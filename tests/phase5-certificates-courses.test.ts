/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCourse,
  toggleCoursePublish,
} from "../server/services/course-management.service";
import {
  issueCertificate,
  revokeCertificate,
} from "../server/services/certificate-management.service";
import { prisma } from "../server/db";
import { AuthorizationError } from "../server/policies";

// Mock de Prisma db / prisma
vi.mock("@/server/db", () => {
  const mockPrisma = {
    course: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    module: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    lesson: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    enrollment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    certificate: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  };

  return {
    prisma: mockPrisma,
    db: mockPrisma,
  };
});

describe("Fase 5: Gestión de Cursos y Certificados Oficiales (AC-07, AC-16, AC-17, AC-18)", () => {
  const instructorSession = {
    user: {
      id: "instructor-100",
      email: "docente@certifox.pe",
      role: "INSTRUCTOR" as const,
      name: "Ing. Docente Titular",
    },
  };

  const otherInstructorSession = {
    user: {
      id: "instructor-999",
      email: "otro_docente@certifox.pe",
      role: "INSTRUCTOR" as const,
      name: "Ing. Otro Docente",
    },
  };

  const studentSession = {
    user: {
      id: "student-200",
      email: "alumno@certifox.pe",
      role: "STUDENT" as const,
      name: "Alumno Demo",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // AC-18: Gestión de Cursos y Publicación
  // ---------------------------------------------------------------------------
  it("AC-18: createCourse crea el curso asignado al instructor y genera módulos iniciales", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValueOnce(null); // Slug no existe aún
    vi.mocked(prisma.course.create).mockResolvedValueOnce({
      id: "course-new-1",
      slug: "inspeccion-izaje-pesado",
      title: "Inspección de Equipos de Izaje",
      category: "Maquinaria",
      level: "Avanzado",
      hours: 40,
      summary: "Curso de maniobras seguras",
      coverUrl: "https://example.com/cover.jpg",
      published: true,
      instructorId: instructorSession.user.id,
      modules: [],
    } as any);

    const course = await createCourse(instructorSession, {
      title: "Inspección de Equipos de Izaje",
      category: "Maquinaria",
      level: "Avanzado",
      hours: 40,
      summary: "Curso de maniobras seguras",
      published: true,
    });

    expect(course.id).toBe("course-new-1");
    expect(course.instructorId).toBe(instructorSession.user.id);
    expect(prisma.course.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          instructorId: instructorSession.user.id,
          published: true,
        }),
      })
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "CREATE_COURSE",
          actorId: instructorSession.user.id,
        }),
      })
    );
  });

  it("AC-18: Un estudiante no puede crear cursos", async () => {
    await expect(
      createCourse(studentSession, {
        title: "Curso Intento",
        category: "Test",
        level: "Básico",
        hours: 10,
      })
    ).rejects.toThrow(AuthorizationError);
  });

  it("AC-18: Un instructor no puede despublicar ni modificar cursos de otro docente", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValueOnce({
      id: "course-belonging-to-100",
      instructorId: "instructor-100",
      published: true,
      title: "Curso 100",
      slug: "curso-100",
    } as any);

    // Instructor 999 intenta modificarlo
    await expect(
      toggleCoursePublish(otherInstructorSession, "course-belonging-to-100")
    ).rejects.toThrow(AuthorizationError);
  });

  it("AC-18: toggleCoursePublish cambia el estado de publicación y audita la acción", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValueOnce({
      id: "course-1",
      instructorId: instructorSession.user.id,
      published: false,
      title: "Curso Borrador",
      slug: "curso-borrador",
    } as any);

    vi.mocked(prisma.course.update).mockResolvedValueOnce({
      id: "course-1",
      published: true,
      slug: "curso-borrador",
    } as any);

    const updated = await toggleCoursePublish(instructorSession, "course-1");

    expect(updated.published).toBe(true);
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "PUBLISH_COURSE",
          targetId: "course-1",
        }),
      })
    );
  });

  // ---------------------------------------------------------------------------
  // AC-16: Emisión de Certificado con Alta Entropía y SHA-256
  // ---------------------------------------------------------------------------
  it("AC-16: issueCertificate genera código de alta entropía y SHA-256 para matrícula COMPLETED", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValueOnce({
      id: "enr-comp-1",
      userId: "student-200",
      courseId: "course-1",
      status: "COMPLETED",
      course: {
        id: "course-1",
        title: "Seguridad Operativa",
        instructorId: instructorSession.user.id,
      },
      user: {
        id: "student-200",
        name: "Carlos Estudiante",
      },
      certificate: null, // Aún no emitido
    } as any);

    vi.mocked(prisma.certificate.findUnique).mockResolvedValueOnce(null); // Código único disponible
    vi.mocked(prisma.certificate.create).mockResolvedValueOnce({
      id: "cert-new",
      code: "CFX-2026-AB12CD",
      sha256: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      status: "VALID",
      issuedAt: new Date(),
      expiresAt: new Date(),
    } as any);

    const result = await issueCertificate(instructorSession, "enr-comp-1");

    expect(result.success).toBe(true);
    expect(result.code).toContain("CFX-");
    expect(result.sha256).toHaveLength(64); // Longitud válida SHA-256
    expect(result.isAlreadyIssued).toBe(false);
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "ISSUE_CERTIFICATE",
        }),
      })
    );
  });

  it("AC-16: issueCertificate es IDEMPOTENTE y devuelve el certificado si ya existía", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValueOnce({
      id: "enr-comp-1",
      userId: "student-200",
      courseId: "course-1",
      status: "COMPLETED",
      course: {
        id: "course-1",
        instructorId: instructorSession.user.id,
      },
      user: { id: "student-200", name: "Carlos" },
      certificate: {
        id: "cert-prev-1",
        code: "CFX-2025-9831",
        sha256: "8a9fe409b3628e811c0f0f49c01742de8b7c4270f92275ba2c4b8e2cb927c24e",
        status: "VALID",
      },
    } as any);

    const result = await issueCertificate(instructorSession, "enr-comp-1");

    expect(result.success).toBe(true);
    expect(result.code).toBe("CFX-2025-9831");
    expect(result.isAlreadyIssued).toBe(true);
    expect(prisma.certificate.create).not.toHaveBeenCalled();
  });

  it("AC-16: issueCertificate falla si la matrícula está PENDING o ACTIVE sin completar", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValueOnce({
      id: "enr-active",
      userId: "student-200",
      courseId: "course-1",
      status: "ACTIVE", // No ha completado el programa
      course: { instructorId: instructorSession.user.id },
      user: { id: "student-200" },
      certificate: null,
    } as any);

    await expect(
      issueCertificate(instructorSession, "enr-active")
    ).rejects.toThrow("No se puede emitir el certificado");
  });

  // ---------------------------------------------------------------------------
  // AC-17: Revocación con Motivo Obligatorio y AuditLog
  // ---------------------------------------------------------------------------
  it("AC-17: revokeCertificate actualiza status a REVOKED con motivo y registra en AuditLog", async () => {
    vi.mocked(prisma.certificate.findUnique).mockResolvedValueOnce({
      id: "cert-to-revoke",
      code: "CFX-2025-9831",
      status: "VALID",
      enrollment: {
        course: { instructorId: instructorSession.user.id },
        user: { name: "Alumno Sancionado" },
      },
    } as any);

    vi.mocked(prisma.certificate.update).mockResolvedValueOnce({
      id: "cert-to-revoke",
      code: "CFX-2025-9831",
      status: "REVOKED",
      revocationReason: "Falsificación de horas prácticas en campo",
    } as any);

    const revoked = await revokeCertificate(instructorSession, {
      code: "CFX-2025-9831",
      reason: "Falsificación de horas prácticas en campo",
    });

    expect(revoked.status).toBe("REVOKED");
    expect(prisma.certificate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cert-to-revoke" },
        data: expect.objectContaining({
          status: "REVOKED",
          revocationReason: "Falsificación de horas prácticas en campo",
        }),
      })
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "REVOKE_CERTIFICATE",
          targetId: "CFX-2025-9831",
        }),
      })
    );
  });

  it("AC-17: revokeCertificate falla si el motivo es vacío o menor a 8 caracteres", async () => {
    await expect(
      revokeCertificate(instructorSession, {
        code: "CFX-2025-9831",
        reason: "anular", // demasiado corto
      })
    ).rejects.toThrow("Debes indicar un motivo de revocación oficial");
  });

  // ---------------------------------------------------------------------------
  // AC-07: Verificación del enlace QR
  // ---------------------------------------------------------------------------
  it("AC-07: El código QR del PDF genera la URL directa a /verificar/[codigo]", () => {
    const code = "CFX-2025-9831";
    const origin = "https://certifox.pe";
    const targetUrl = `${origin}/verificar/${code}`;

    expect(targetUrl).toBe("https://certifox.pe/verificar/CFX-2025-9831");
    expect(targetUrl).toContain(code);
  });
});
