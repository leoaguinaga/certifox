import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { cookies, headers } from "next/headers";
import { Prisma, type OrgRole } from "@prisma/client";
import { db, transaction } from "@/server/core/db";
import { CacheTags, invalidate } from "@/server/core/cache";
import { conflict, forbidden, invalid, notFound } from "@/server/core/errors";
import { assertAuthenticated, assertOrgAdmin } from "@/server/core/policies";
import { ACTIVE_ORG_COOKIE, tenantSlugFromHost, type AuthedContext } from "@/server/core/request-context";
import { pageArgs, toPage, type PageQuery } from "@/server/core/pagination";
import { recordAudit } from "@/server/modules/audit/audit";
import { paymentSettingsSchema, parsePaymentSettings, type PaymentSettings } from "./payment-settings";

export interface PublicTenant {
  id: string;
  slug: string;
  name: string;
}

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

const findTenant = unstable_cache(
  async (by: "slug" | "domain", value: string): Promise<PublicTenant | null> => {
    return db.organization.findFirst({
      where: { status: "ACTIVE", ...(by === "slug" ? { slug: value } : { customDomain: value }) },
      select: { id: true, slug: true, name: true },
    });
  },
  ["tenant-lookup"],
  { tags: [CacheTags.organizations], revalidate: 300 }
);

/**
 * Organización del sitio público según el host:
 *  - <slug>.ROOT_DOMAIN → esa organización
 *  - dominio propio (Organization.customDomain) → esa organización
 *  - dominio raíz → null (catálogo de todas las organizaciones)
 */
export const resolvePublicTenant = cache(async (): Promise<PublicTenant | null> => {
  const host = (await headers()).get("host");
  if (!host) return null;
  const slug = tenantSlugFromHost(host);
  if (slug) return findTenant("slug", slug);
  const hostname = host.split(":")[0].toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".vercel.app")) return null;
  return findTenant("domain", hostname);
});

export async function getOrganizationPaymentSettings(organizationId: string): Promise<{ name: string; settings: PaymentSettings }> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { name: true, paymentSettings: true },
  });
  if (!org) throw notFound("Organización no encontrada");
  return { name: org.name, settings: parsePaymentSettings(org.paymentSettings) };
}

/** Cambia la organización activa del campus (cookie validada contra las membresías). */
export async function setActiveOrganization(ctx: AuthedContext, organizationId: string): Promise<void> {
  if (!ctx.memberships.some((m) => m.organization.id === organizationId)) {
    throw forbidden("No perteneces a esa organización");
  }
  (await cookies()).set(ACTIVE_ORG_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/** Garantiza la membresía (rol STUDENT si no existía) del usuario en la organización. */
export async function ensureMembership(
  client: Prisma.TransactionClient | typeof db,
  organizationId: string,
  userId: string,
  role: OrgRole = "STUDENT"
) {
  return client.membership.upsert({
    where: { organizationId_userId: { organizationId, userId } },
    create: { organizationId, userId, role },
    update: {},
  });
}

// ---------------------------------------------------------------------------
// Administración (OWNER/ADMIN de la organización activa)
// ---------------------------------------------------------------------------

export async function updatePaymentSettings(ctx: AuthedContext, input: unknown): Promise<PaymentSettings> {
  const admin = assertOrgAdmin(ctx);
  const settings = paymentSettingsSchema.parse(input);
  await transaction(async (tx) => {
    await tx.organization.update({
      where: { id: admin.organizationId },
      data: { paymentSettings: settings as Prisma.InputJsonValue },
    });
    await recordAudit(tx, {
      action: "UPDATE_ORGANIZATION",
      targetType: "Organization",
      targetId: admin.organizationId,
      actorId: admin.userId,
      organizationId: admin.organizationId,
      metadata: { field: "paymentSettings" },
    });
  });
  return settings;
}

export async function listMembers(ctx: AuthedContext, query: PageQuery & { role?: OrgRole } = {}) {
  const admin = assertOrgAdmin(ctx);
  const { limit, ...args } = pageArgs(query);
  const rows = await db.membership.findMany({
    where: { organizationId: admin.organizationId, ...(query.role ? { role: query.role } : {}) },
    select: { id: true, role: true, createdAt: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...args,
  });
  return toPage(rows, limit);
}

/** Alta o cambio de rol de un usuario existente en la organización activa. */
export async function upsertMember(ctx: AuthedContext, input: { email: string; role: OrgRole }) {
  const admin = assertOrgAdmin(ctx);
  if (input.role === "OWNER" && ctx.role !== "OWNER") throw forbidden("Solo un OWNER puede asignar el rol OWNER");

  const user = await db.user.findUnique({ where: { email: input.email.toLowerCase().trim() }, select: { id: true } });
  if (!user) throw notFound("El usuario debe registrarse primero en la plataforma");

  return transaction(async (tx) => {
    const membership = await tx.membership.upsert({
      where: { organizationId_userId: { organizationId: admin.organizationId, userId: user.id } },
      create: { organizationId: admin.organizationId, userId: user.id, role: input.role },
      update: { role: input.role },
    });
    await recordAudit(tx, {
      action: "UPDATE_MEMBER_ROLE",
      targetType: "Membership",
      targetId: membership.id,
      actorId: admin.userId,
      organizationId: admin.organizationId,
      metadata: { userId: user.id, role: input.role },
    });
    return membership;
  });
}

// ---------------------------------------------------------------------------
// Plataforma (SUPERADMIN / scripts)
// ---------------------------------------------------------------------------

export async function createOrganization(input: {
  slug: string;
  name: string;
  ownerEmail: string;
  customDomain?: string;
}) {
  const slug = input.slug.toLowerCase().trim();
  if (!SLUG_RE.test(slug)) throw invalid("Slug inválido: 3-40 caracteres, minúsculas, números y guiones");
  const owner = await db.user.findUnique({ where: { email: input.ownerEmail.toLowerCase().trim() } });
  if (!owner) throw notFound(`No existe el usuario ${input.ownerEmail}`);

  try {
    const org = await transaction(async (tx) => {
      const created = await tx.organization.create({
        data: { slug, name: input.name.trim(), customDomain: input.customDomain?.toLowerCase().trim() || null },
      });
      await tx.membership.create({ data: { organizationId: created.id, userId: owner.id, role: "OWNER" } });
      return created;
    });
    invalidate(CacheTags.organizations);
    return org;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw conflict("Ya existe una organización con ese slug o dominio");
    }
    throw err;
  }
}

export function assertSuperadmin(ctx: AuthedContext) {
  assertAuthenticated(ctx);
  if (ctx.user.platformRole !== "SUPERADMIN") throw forbidden("Solo administradores de plataforma");
}
