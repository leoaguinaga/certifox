import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import type { OrgRole, PlatformRole } from "@prisma/client";
import { auth } from "./auth";
import { db } from "./db";
import { env } from "./env";
import { unauthenticated } from "./errors";
import { logger, type Logger } from "./logger";
import { STAFF_ROLES } from "./roles";

export const ACTIVE_ORG_COOKIE = "cfx_org";
export const REQUEST_ID_HEADER = "x-request-id";

export interface ContextUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  platformRole: PlatformRole;
}

export interface ContextOrganization {
  id: string;
  slug: string;
  name: string;
}

export interface MembershipSummary {
  organization: ContextOrganization;
  role: OrgRole;
}

export interface RequestContext {
  requestId: string;
  ip: string;
  log: Logger;
  user: ContextUser | null;
  /** Organización activa para operaciones de gestión (staff). */
  organization: ContextOrganization | null;
  /** Rol del usuario en la organización activa (null si no es miembro). */
  role: OrgRole | null;
  memberships: MembershipSummary[];
}

export type AuthedContext = RequestContext & { user: ContextUser };


export function clientIp(h: Headers): string {
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "0.0.0.0"
  );
}

/** Sesión de Better Auth memoizada por request (layout + página + acción = 1 lectura). */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/**
 * Elige la organización activa: cookie → organización del host → primera membresía
 * de staff → primera membresía.
 */
export function pickActiveMembership(
  memberships: MembershipSummary[],
  preferredOrgId: string | undefined,
  hostOrgSlug: string | null
): MembershipSummary | null {
  return (
    memberships.find((m) => m.organization.id === preferredOrgId) ??
    memberships.find((m) => hostOrgSlug !== null && m.organization.slug === hostOrgSlug) ??
    memberships.find((m) => STAFF_ROLES.includes(m.role)) ??
    memberships[0] ??
    null
  );
}

/** Slug de tenant derivado del host (<slug>.ROOT_DOMAIN). */
export function tenantSlugFromHost(host: string | null, rootDomain = env.ROOT_DOMAIN): string | null {
  if (!host || !rootDomain) return null;
  const hostname = host.split(":")[0].toLowerCase();
  const root = rootDomain.toLowerCase();
  if (hostname === root || !hostname.endsWith(`.${root}`)) return null;
  const sub = hostname.slice(0, -(root.length + 1));
  if (!sub || sub === "www" || sub.includes(".")) return null;
  return sub;
}

export const getRequestContext = cache(async (): Promise<RequestContext> => {
  const h = await headers();
  const requestId = h.get(REQUEST_ID_HEADER) ?? crypto.randomUUID();
  const ip = clientIp(h);
  const session = await getSession();
  const log = logger.child({ requestId, userId: session?.user.id });

  if (!session) {
    return { requestId, ip, log, user: null, organization: null, role: null, memberships: [] };
  }

  const rows = await db.membership.findMany({
    where: { userId: session.user.id, organization: { status: "ACTIVE" } },
    select: { role: true, organization: { select: { id: true, slug: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  const memberships: MembershipSummary[] = rows.map((r) => ({ role: r.role, organization: r.organization }));

  const preferred = (await cookies()).get(ACTIVE_ORG_COOKIE)?.value;
  const active = pickActiveMembership(memberships, preferred, tenantSlugFromHost(h.get("host")));

  const u = session.user as typeof session.user & { platformRole?: PlatformRole };
  return {
    requestId,
    ip,
    log: log.child({ orgId: active?.organization.id }),
    user: {
      id: u.id,
      email: u.email,
      name: u.name,
      image: u.image ?? null,
      platformRole: u.platformRole === "SUPERADMIN" ? "SUPERADMIN" : "USER",
    },
    organization: active?.organization ?? null,
    role: active?.role ?? null,
    memberships,
  };
});

export async function requireUser(): Promise<AuthedContext> {
  const ctx = await getRequestContext();
  if (!ctx.user) throw unauthenticated();
  return ctx as AuthedContext;
}
