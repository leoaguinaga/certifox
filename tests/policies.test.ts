import { describe, it, expect } from "vitest";
import {
  requireAuth,
  requireRole,
  assertOwnsEnrollment,
  assertCanManageCourse,
  assertCanSubmitAssessment,
  assertCanViewCampusCertificate,
  AuthorizationError,
} from "../server/policies";

describe("Policies de Autorización (server/policies.ts)", () => {
  const studentSession = {
    user: {
      id: "student-1",
      email: "student@certifox.pe",
      role: "STUDENT" as const,
      name: "Estudiante Uno",
    },
  };

  const instructorSession = {
    user: {
      id: "instructor-1",
      email: "profe@certifox.pe",
      role: "INSTRUCTOR" as const,
      name: "Profesor Uno",
    },
  };

  it("requireAuth lanza 401 si no hay sesión activa", () => {
    expect(() => requireAuth(null)).toThrow(AuthorizationError);
    expect(() => requireAuth(undefined)).toThrowError(/Debes iniciar sesión/);
    try {
      requireAuth(null);
    } catch (err) {
      const authError = err as AuthorizationError;
      expect(authError.statusCode).toBe(401);
    }
  });

  it("requireRole permite acceso si el rol coincide y lanza 403 si no coincide", () => {
    expect(requireRole(studentSession, "STUDENT")).toEqual(studentSession.user);
    expect(() => requireRole(studentSession, "INSTRUCTOR")).toThrow(AuthorizationError);
    try {
      requireRole(studentSession, "INSTRUCTOR");
    } catch (err) {
      const authError = err as AuthorizationError;
      expect(authError.statusCode).toBe(403);
    }
  });

  it("AC-10: assertOwnsEnrollment deniega acceso a datos de otro estudiante con 403", () => {
    // Éxito con el propio ID
    expect(assertOwnsEnrollment(studentSession, "student-1")).toEqual(studentSession.user);

    // Fallo si se intenta acceder a la matrícula de 'student-2'
    expect(() => assertOwnsEnrollment(studentSession, "student-2")).toThrow(AuthorizationError);
    try {
      assertOwnsEnrollment(studentSession, "student-2");
    } catch (err) {
      const authError = err as AuthorizationError;
      expect(authError.statusCode).toBe(403);
      expect(authError.message).toMatch(/No tienes permiso/);
    }
  });

  it("assertCanManageCourse solo permite al instructor propietario gestionar su curso", () => {
    // Instructor dueño tiene acceso
    expect(assertCanManageCourse(instructorSession, "instructor-1")).toEqual(instructorSession.user);

    // Otro instructor es rechazado
    expect(() => assertCanManageCourse(instructorSession, "instructor-2")).toThrow(AuthorizationError);

    // Un estudiante es rechazado inmediatamente
    expect(() => assertCanManageCourse(studentSession, "instructor-1")).toThrow(AuthorizationError);
  });

  it("assertCanSubmitAssessment verifica propiedad de matrícula y estado ACTIVE", () => {
    // Matrícula activa propia
    expect(
      assertCanSubmitAssessment(studentSession, { userId: "student-1", status: "ACTIVE" })
    ).toEqual(studentSession.user);

    // Matrícula ajena es rechazada
    expect(() =>
      assertCanSubmitAssessment(studentSession, { userId: "student-2", status: "ACTIVE" })
    ).toThrow(AuthorizationError);

    // Matrícula propia pero PENDING es rechazada
    expect(() =>
      assertCanSubmitAssessment(studentSession, { userId: "student-1", status: "PENDING" })
    ).toThrowError(/matrícula activa/);
  });

  it("assertCanViewCampusCertificate respeta límites entre estudiantes e instructores", () => {
    const certData = {
      enrollment: {
        userId: "student-1",
        course: { instructorId: "instructor-1" },
      },
    };

    // El alumno dueño puede ver su certificado
    expect(assertCanViewCampusCertificate(studentSession, certData)).toEqual(studentSession.user);

    // El instructor del curso puede ver el certificado
    expect(assertCanViewCampusCertificate(instructorSession, certData)).toEqual(instructorSession.user);

    // Otro alumno no puede
    const otherStudent = {
      user: { id: "student-2", email: "other@certifox.pe", role: "STUDENT" as const },
    };
    expect(() => assertCanViewCampusCertificate(otherStudent, certData)).toThrow(AuthorizationError);

    // Otro instructor no puede
    const otherInstructor = {
      user: { id: "instructor-2", email: "other_prof@certifox.pe", role: "INSTRUCTOR" as const },
    };
    expect(() => assertCanViewCampusCertificate(otherInstructor, certData)).toThrow(AuthorizationError);
  });
});
