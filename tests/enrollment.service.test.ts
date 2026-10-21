import { describe, it, expect, vi } from "vitest";
import {
  requestEnrollment,
  confirmEnrollmentPayment,
  getPaymentInstructions,
} from "../server/services/enrollment.service";
import { db } from "../server/db";
import { AuthorizationError } from "../server/policies";

// Mock de Prisma db
vi.mock("@/server/db", () => {
  return {
    db: {
      course: {
        findUnique: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      enrollment: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    },
  };
});

describe("Flujo de Matrícula y Confirmación de Pagos (server/services/enrollment.service.ts)", () => {
  const instructorSession = {
    user: {
      id: "instructor-1",
      email: "profe@certifox.pe",
      role: "INSTRUCTOR" as const,
      name: "Prof. Miguel Grau",
    },
  };

  const otherInstructorSession = {
    user: {
      id: "instructor-2",
      email: "otro_profe@certifox.pe",
      role: "INSTRUCTOR" as const,
      name: "Prof. Francisco Bolognesi",
    },
  };

  it("AC-11: getPaymentInstructions genera datos para abono manual (Yape, BCP, WhatsApp)", () => {
    const instructions = getPaymentInstructions("Maquinaria Pesada", "Juan Pérez");
    expect(instructions.yapeNumber).toBeDefined();
    expect(instructions.bcpAccount).toBeDefined();
    expect(instructions.whatsappUrl).toContain("https://wa.me/");
    expect(instructions.whatsappUrl).toContain("Juan");
  });

  it("AC-11: requestEnrollment crea o devuelve matrícula en estado PENDING de forma idempotente", async () => {
    const mockCourse = {
      id: "course-1",
      title: "Seguridad Operativa",
    };

    const mockEnrollment = {
      id: "enr-1",
      userId: "student-1",
      courseId: "course-1",
      status: "PENDING",
      course: mockCourse,
      user: { name: "Juan Pérez", email: "juan@certifox.pe" },
    };

    vi.mocked(db.course.findUnique).mockResolvedValueOnce(
      mockCourse as unknown as Awaited<ReturnType<typeof db.course.findUnique>>
    );
    vi.mocked(db.enrollment.upsert).mockResolvedValueOnce(
      mockEnrollment as unknown as Awaited<ReturnType<typeof db.enrollment.upsert>>
    );

    const result = await requestEnrollment({
      courseId: "course-1",
      studentEmail: "juan@certifox.pe",
      studentName: "Juan Pérez",
      currentUserId: "student-1",
    });

    expect(result.status).toBe("PENDING");
    expect(result.enrollmentId).toBe("enr-1");
    expect(result.instructions.yapeNumber).toBeDefined();
  });

  it("AC-12: El instructor dueño confirma el pago pasando a ACTIVE y generando AuditLog", async () => {
    const mockPendingEnrollment = {
      id: "enr-10",
      status: "PENDING",
      course: {
        id: "course-1",
        title: "Seguridad Operativa",
        instructorId: "instructor-1", // El instructor de la sesión es dueño
      },
      user: {
        name: "Carlos Mendoza",
        email: "carlos@certifox.pe",
      },
    };

    const mockActiveEnrollment = {
      ...mockPendingEnrollment,
      status: "ACTIVE",
      activatedAt: new Date(),
    };

    vi.mocked(db.enrollment.findUnique).mockResolvedValueOnce(
      mockPendingEnrollment as unknown as Awaited<ReturnType<typeof db.enrollment.findUnique>>
    );
    vi.mocked(db.enrollment.update).mockResolvedValueOnce(
      mockActiveEnrollment as unknown as Awaited<ReturnType<typeof db.enrollment.update>>
    );
    vi.mocked(db.auditLog.create).mockResolvedValueOnce(
      { id: "audit-1" } as unknown as Awaited<ReturnType<typeof db.auditLog.create>>
    );

    const result = await confirmEnrollmentPayment(instructorSession, "enr-10", "Abono verificado");

    expect(result.status).toBe("ACTIVE");
    expect(db.enrollment.update).toHaveBeenCalledWith({
      where: { id: "enr-10" },
      data: expect.objectContaining({ status: "ACTIVE" }),
    });
    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "CONFIRM_PAYMENT",
        actorId: "instructor-1",
      }),
    });
  });

  it("AC-12 / R2: Otro instructor NO puede confirmar el pago de un curso ajeno (lanza 403)", async () => {
    const mockEnrollmentOtherCourse = {
      id: "enr-20",
      status: "PENDING",
      course: {
        id: "course-99",
        title: "Curso Ajeno",
        instructorId: "instructor-1", // Pertenece a instructor-1
      },
      user: {
        name: "Alumno Prueba",
        email: "prueba@certifox.pe",
      },
    };

    // Intentar confirmar con otherInstructorSession (instructor-2)
    vi.mocked(db.enrollment.findUnique).mockResolvedValueOnce(
      mockEnrollmentOtherCourse as unknown as Awaited<ReturnType<typeof db.enrollment.findUnique>>
    );

    await expect(
      confirmEnrollmentPayment(otherInstructorSession, "enr-20")
    ).rejects.toThrow(AuthorizationError);
  });
});
