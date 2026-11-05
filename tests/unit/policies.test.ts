import { describe, expect, it } from "vitest";
import type { OrgRole } from "@prisma/client";
import { AuthorizationError } from "@/server/core/errors";
import {
  assertCanManageCourse,
  assertCanSubmitAssessment,
  assertOrgAdmin,
  assertStaff,
  manageableCoursesWhere,
} from "@/server/core/policies";
import { campusView } from "@/server/core/roles";

const user = { id: "u1", email: "u1@test.pe", name: "U1", image: null, platformRole: "USER" as const };
const org = { id: "orgA", slug: "a", name: "A" };
const ctx = (role: OrgRole | null, organization: typeof org | null = org) => ({ user, organization, role });

describe("policies (autorización pura)", () => {
  it("sin sesión → UNAUTHENTICATED", () => {
    expect(() => assertStaff({ user: null, organization: null, role: null })).toThrowError(
      expect.objectContaining({ code: "UNAUTHENTICATED" })
    );
  });

  it("un STUDENT no es staff (403)", () => {
    expect(() => assertStaff(ctx("STUDENT"))).toThrow(AuthorizationError);
    expect(campusView(ctx("STUDENT"))).toBe("STUDENT");
    expect(campusView(ctx(null))).toBe("STUDENT");
  });

  it("OWNER/ADMIN/INSTRUCTOR son staff", () => {
    for (const role of ["OWNER", "ADMIN", "INSTRUCTOR"] as const) {
      expect(assertStaff(ctx(role))).toEqual({ userId: "u1", organizationId: "orgA", role });
      expect(campusView(ctx(role))).toBe("INSTRUCTOR");
    }
  });

  it("aislamiento entre tenants: nadie gestiona cursos de otra organización", () => {
    expect(() => assertCanManageCourse(ctx("OWNER"), { organizationId: "orgB", instructorId: "u1" })).toThrowError(
      /otra organización/
    );
  });

  it("INSTRUCTOR solo gestiona sus cursos; ADMIN gestiona todos los de su organización", () => {
    expect(() => assertCanManageCourse(ctx("INSTRUCTOR"), { organizationId: "orgA", instructorId: "otro" })).toThrow();
    expect(assertCanManageCourse(ctx("INSTRUCTOR"), { organizationId: "orgA", instructorId: "u1" }).userId).toBe("u1");
    expect(assertCanManageCourse(ctx("ADMIN"), { organizationId: "orgA", instructorId: "otro" }).organizationId).toBe("orgA");
  });

  it("manageableCoursesWhere filtra por tenant (+ titular si es INSTRUCTOR)", () => {
    expect(manageableCoursesWhere(ctx("INSTRUCTOR"))).toEqual({ organizationId: "orgA", instructorId: "u1" });
    expect(manageableCoursesWhere(ctx("ADMIN"))).toEqual({ organizationId: "orgA" });
  });

  it("assertOrgAdmin rechaza INSTRUCTOR", () => {
    expect(() => assertOrgAdmin(ctx("INSTRUCTOR"))).toThrow(AuthorizationError);
    expect(assertOrgAdmin(ctx("OWNER")).organizationId).toBe("orgA");
  });

  it("entregas: solo el titular y con matrícula no pendiente", () => {
    expect(() => assertCanSubmitAssessment(ctx("STUDENT"), { userId: "otro", status: "ACTIVE" })).toThrow();
    expect(() => assertCanSubmitAssessment(ctx("STUDENT"), { userId: "u1", status: "PENDING" })).toThrow();
    expect(assertCanSubmitAssessment(ctx("STUDENT"), { userId: "u1", status: "ACTIVE" }).id).toBe("u1");
  });
});
