/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getClassroomData,
  toggleLessonProgress,
  checkAndCompleteCourse,
} from "../server/services/classroom.service";
import { gradeAssignment } from "../server/services/assignment.service";
import { prisma } from "../server/db";

// Mock de Prisma db / prisma
vi.mock("@/server/db", () => {
  const mockPrisma = {
    course: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    lesson: {
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    enrollment: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    lessonProgress: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    assessment: {
      findUnique: vi.fn(),
    },
    submission: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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

describe("Fase 4: Aula, Progreso y Tareas (AC-11, AC-13, AC-14)", () => {
  const studentSession = {
    user: {
      id: "student-123",
      email: "alumno@certifox.pe",
      role: "STUDENT" as const,
      name: "Carlos Estudiante",
    },
  };

  const instructorSession = {
    user: {
      id: "instructor-456",
      email: "profe@certifox.pe",
      role: "INSTRUCTOR" as const,
      name: "Ing. Docente Titular",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // AC-11: Matrícula PENDIENTE no deja reproducir lecciones
  // ---------------------------------------------------------------------------
  it("AC-11: getClassroomData con matrícula PENDING devuelve accessStatus PENDING_PAYMENT y oculta lecciones", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValueOnce({
      id: "course-1",
      slug: "seguridad-operativa",
      title: "Seguridad Operativa",
      summary: "Resumen técnico",
      category: "Seguridad",
      level: "Básico",
      hours: 20,
      instructor: {
        id: "instructor-456",
        name: "Ing. Docente",
        institution: "Centro Industrial",
      },
      modules: [
        {
          id: "mod-1",
          title: "Módulo 1",
          order: 1,
          lessons: [
            {
              id: "les-1",
              title: "Lección 1",
              order: 1,
              videoUrl: "https://youtube.com/watch?v=123",
              durationMin: 30,
              moduleId: "mod-1",
            },
          ],
        },
      ],
      assessments: [],
    } as any);

    // Matrícula en estado PENDING
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValueOnce({
      id: "enr-1",
      userId: studentSession.user.id,
      courseId: "course-1",
      status: "PENDING",
      progress: [],
      submissions: [],
    } as any);

    const result = await getClassroomData(studentSession, "seguridad-operativa");

    expect(result).not.toBeNull();
    expect(result?.accessStatus).toBe("PENDING_PAYMENT");
    // No expone módulos ni lecciones mientras el pago no esté confirmado
    expect(result?.modules).toHaveLength(0);
  });

  // ---------------------------------------------------------------------------
  // AC-13: Persistencia de Progreso
  // ---------------------------------------------------------------------------
  it("AC-13: toggleLessonProgress guarda el avance en la BD y recalcula el porcentaje", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValueOnce({
      id: "course-1",
      title: "Seguridad Operativa",
    } as any);

    vi.mocked(prisma.enrollment.findUnique).mockResolvedValueOnce({
      id: "enr-1",
      userId: studentSession.user.id,
      courseId: "course-1",
      status: "ACTIVE",
    } as any);

    vi.mocked(prisma.lesson.findFirst).mockResolvedValueOnce({
      id: "les-1",
      moduleId: "mod-1",
    } as any);

    vi.mocked(prisma.lessonProgress.upsert).mockResolvedValueOnce({
      id: "prog-1",
      enrollmentId: "enr-1",
      lessonId: "les-1",
      completedAt: new Date(),
    } as any);

    // Supongamos que el curso tiene 4 lecciones y con esta se completaron 2 (50%)
    vi.mocked(prisma.lesson.count).mockResolvedValueOnce(4);
    vi.mocked(prisma.lessonProgress.count).mockResolvedValueOnce(2);

    const result = await toggleLessonProgress(studentSession, {
      courseSlug: "seguridad-operativa",
      lessonId: "les-1",
      completed: true,
    });

    expect(result.success).toBe(true);
    expect(result.isCompleted).toBe(true);
    expect(result.completedCount).toBe(2);
    expect(result.totalCount).toBe(4);
    expect(result.progressPercent).toBe(50);
    expect(prisma.lessonProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: "enr-1",
            lessonId: "les-1",
          },
        },
      })
    );
  });

  // ---------------------------------------------------------------------------
  // AC-14: Con 100% de lecciones + tarea aprobada (>= 14), matrícula pasa a COMPLETED
  // ---------------------------------------------------------------------------
  it("AC-14: checkAndCompleteCourse marca matrícula como COMPLETED si lecciones = 100% y evaluación aprobada", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValueOnce({
      id: "enr-1",
      userId: studentSession.user.id,
      courseId: "course-1",
      status: "ACTIVE",
      course: {
        id: "course-1",
        title: "Seguridad Operativa",
        modules: [
          {
            id: "mod-1",
            lessons: [{ id: "l1" }, { id: "l2" }],
          },
        ],
        assessments: [
          {
            id: "ass-1",
            passingScore: 14,
          },
        ],
      },
      // 2 de 2 lecciones completadas
      progress: [{ lessonId: "l1" }, { lessonId: "l2" }],
      // Evaluación aprobada con nota 17
      submissions: [
        {
          id: "sub-1",
          assessmentId: "ass-1",
          score: 17,
          status: "APPROVED",
        },
      ],
    } as any);

    const completed = await checkAndCompleteCourse("enr-1");

    expect(completed).toBe(true);
    expect(prisma.enrollment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "enr-1" },
        data: expect.objectContaining({
          status: "COMPLETED",
        }),
      })
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "COMPLETE_COURSE",
          targetId: "enr-1",
        }),
      })
    );
  });

  it("AC-14: checkAndCompleteCourse NO pasa a COMPLETED si la evaluación está reprobada (< 14)", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValueOnce({
      id: "enr-1",
      userId: studentSession.user.id,
      courseId: "course-1",
      status: "ACTIVE",
      course: {
        id: "course-1",
        title: "Seguridad Operativa",
        modules: [{ id: "mod-1", lessons: [{ id: "l1" }] }],
        assessments: [{ id: "ass-1", passingScore: 14 }],
      },
      progress: [{ lessonId: "l1" }], // Lecciones al 100%
      submissions: [
        {
          id: "sub-1",
          assessmentId: "ass-1",
          score: 11, // Nota desaprobatoria (< 14)
          status: "REJECTED",
        },
      ],
    } as any);

    const completed = await checkAndCompleteCourse("enr-1");

    expect(completed).toBe(false);
    expect(prisma.enrollment.update).not.toHaveBeenCalled();
  });

  it("AC-14: gradeAssignment califica la entrega y si la nota es aprobatoria verifica finalización", async () => {
    vi.mocked(prisma.submission.findUnique).mockResolvedValueOnce({
      id: "sub-1",
      enrollmentId: "enr-1",
      assessment: {
        id: "ass-1",
        passingScore: 14,
        course: {
          id: "course-1",
          instructorId: instructorSession.user.id, // Es el instructor dueño
        },
      },
      enrollment: {
        id: "enr-1",
        userId: studentSession.user.id,
      },
    } as any);

    vi.mocked(prisma.submission.update).mockResolvedValueOnce({
      id: "sub-1",
      score: 18,
      status: "APPROVED",
    } as any);

    // Mock para checkAndCompleteCourse dentro de gradeAssignment
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValueOnce({
      id: "enr-1",
      userId: studentSession.user.id,
      courseId: "course-1",
      status: "ACTIVE",
      course: {
        modules: [{ lessons: [{ id: "l1" }] }],
        assessments: [{ id: "ass-1", passingScore: 14 }],
      },
      progress: [{ lessonId: "l1" }],
      submissions: [{ assessmentId: "ass-1", score: 18, status: "APPROVED" }],
    } as any);

    const result = await gradeAssignment(instructorSession, {
      submissionId: "sub-1",
      score: 18,
      feedback: "Excelente informe técnico.",
    });

    expect(result.success).toBe(true);
    expect(result.score).toBe(18);
    expect(result.status).toBe("APPROVED");
    expect(result.courseJustCompleted).toBe(true);
  });
});
