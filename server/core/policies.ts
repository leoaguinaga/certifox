import type { OrgRole } from "@prisma/client";
import { forbidden, unauthenticated } from "./errors";
import { ADMIN_ROLES, STAFF_ROLES } from "./roles";
import type { AuthedContext, RequestContext } from "./request-context";

/**
 * Autorización pura (sin I/O): recibe el contexto y los atributos del recurso.
 * Es la barrera real de seguridad; proxy.ts y los layouts solo redirigen por UX.
 */

type Ctx = Pick<RequestContext, "user" | "organization" | "role">;

export function assertAuthenticated(ctx: Ctx): asserts ctx is Ctx & { user: NonNullable<Ctx["user"]> } {
  if (!ctx.user) throw unauthenticated();
}

/** Usuario con rol de staff (OWNER/ADMIN/INSTRUCTOR) en la organización activa. */
export function assertStaff(ctx: Ctx): { userId: string; organizationId: string; role: OrgRole } {
  assertAuthenticated(ctx);
  if (!ctx.organization || !ctx.role || !STAFF_ROLES.includes(ctx.role)) {
    throw forbidden("Acceso restringido al personal docente de la organización");
  }
  return { userId: ctx.user.id, organizationId: ctx.organization.id, role: ctx.role };
}

export function assertOrgAdmin(ctx: Ctx): { userId: string; organizationId: string } {
  const staff = assertStaff(ctx);
  if (!ADMIN_ROLES.includes(staff.role)) throw forbidden("Se requiere rol de administrador de la organización");
  return staff;
}

/**
 * Gestión de un curso: debe pertenecer a la organización activa y el usuario ser
 * OWNER/ADMIN, o el INSTRUCTOR titular.
 */
export function assertCanManageCourse(ctx: Ctx, course: { organizationId: string; instructorId: string }) {
  const staff = assertStaff(ctx);
  if (course.organizationId !== staff.organizationId) {
    throw forbidden("El curso pertenece a otra organización");
  }
  if (staff.role === "INSTRUCTOR" && course.instructorId !== staff.userId) {
    throw forbidden("Solo el instructor asignado a este curso puede gestionarlo");
  }
  return staff;
}

/** Filtro Prisma de cursos gestionables por el staff actual. */
export function manageableCoursesWhere(ctx: Ctx) {
  const staff = assertStaff(ctx);
  return staff.role === "INSTRUCTOR"
    ? { organizationId: staff.organizationId, instructorId: staff.userId }
    : { organizationId: staff.organizationId };
}

export function assertOwnsEnrollment(ctx: Ctx, enrollment: { userId: string }) {
  assertAuthenticated(ctx);
  if (enrollment.userId !== ctx.user.id) {
    throw forbidden("No tienes permiso para acceder a esta matrícula");
  }
  return ctx.user;
}

export function assertCanSubmitAssessment(ctx: Ctx, enrollment: { userId: string; status: string }) {
  const user = assertOwnsEnrollment(ctx, enrollment);
  if (enrollment.status === "PENDING") {
    throw forbidden("Tu matrícula está pendiente de confirmación de pago");
  }
  return user;
}

export type { AuthedContext };
