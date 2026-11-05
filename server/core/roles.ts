import type { OrgRole } from "@prisma/client";

export const STAFF_ROLES: readonly OrgRole[] = ["OWNER", "ADMIN", "INSTRUCTOR"];
export const ADMIN_ROLES: readonly OrgRole[] = ["OWNER", "ADMIN"];

export function isStaffRole(role: OrgRole | null | undefined): boolean {
  return !!role && STAFF_ROLES.includes(role);
}

/** Vista del campus: el personal de la organización activa ve el panel docente. */
export function campusView(ctx: { role: OrgRole | null }): "INSTRUCTOR" | "STUDENT" {
  return isStaffRole(ctx.role) ? "INSTRUCTOR" : "STUDENT";
}
