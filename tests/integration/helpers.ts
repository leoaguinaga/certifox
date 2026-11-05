import { randomUUID } from "node:crypto";
import type { OrgRole } from "@prisma/client";
import { db } from "@/server/core/db";
import { logger } from "@/server/core/logger";
import type { AuthedContext } from "@/server/core/request-context";

export const hasDb = Boolean(process.env.TEST_DATABASE_URL);

export async function resetDb() {
  const tables = await db.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  await db.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(", ")} CASCADE`);
}

export async function createUser(name = "Usuario") {
  return db.user.create({ data: { name, email: `${randomUUID()}@test.pe`, documentNumber: "72499203" } });
}

export async function createOrg(slug = `org-${randomUUID().slice(0, 8)}`) {
  return db.organization.create({
    data: {
      slug,
      name: `Org ${slug}`,
      paymentSettings: { whatsapp: "51999999999", yape: { number: "999999999", holder: "Test" }, bankAccounts: [] },
    },
  });
}

/** Contexto autenticado equivalente al que arma getRequestContext(). */
export async function ctxFor(userId: string, activeOrgId?: string): Promise<AuthedContext> {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const memberships = await db.membership.findMany({
    where: { userId },
    select: { role: true, organization: { select: { id: true, slug: true, name: true } } },
  });
  const active = memberships.find((m) => m.organization.id === activeOrgId) ?? memberships[0] ?? null;
  return {
    requestId: "test",
    ip: "127.0.0.1",
    log: logger,
    user: { id: user.id, email: user.email, name: user.name, image: null, platformRole: user.platformRole },
    organization: active?.organization ?? null,
    role: active?.role ?? null,
    memberships: memberships.map((m) => ({ role: m.role, organization: m.organization })),
  };
}

export async function addMember(orgId: string, userId: string, role: OrgRole) {
  return db.membership.create({ data: { organizationId: orgId, userId, role } });
}

/** Curso publicado con N lecciones y (opcional) una evaluación. */
export async function createCourse(opts: {
  organizationId: string;
  instructorId: string;
  lessons?: number;
  withAssessment?: boolean;
  priceCents?: number;
}) {
  const lessons = opts.lessons ?? 2;
  const course = await db.course.create({
    data: {
      slug: `curso-${randomUUID().slice(0, 8)}`,
      title: "Curso de prueba",
      summary: "Resumen",
      category: "Seguridad",
      level: "Intermedio",
      hours: 10,
      published: true,
      priceCents: opts.priceCents ?? 50000,
      lessonsCount: lessons,
      organizationId: opts.organizationId,
      instructorId: opts.instructorId,
      modules: {
        create: {
          title: "Módulo 1",
          order: 1,
          lessons: { create: Array.from({ length: lessons }, (_, i) => ({ title: `L${i + 1}`, order: i + 1, durationMin: 10 })) },
        },
      },
      ...(opts.withAssessment ? { assessments: { create: { title: "Final", passingScore: 14 } } } : {}),
    },
    include: { modules: { include: { lessons: true } }, assessments: true },
  });
  return course;
}
