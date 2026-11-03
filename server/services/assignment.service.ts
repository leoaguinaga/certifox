import "server-only";

import { prisma } from "@/server/db";
import {
  SessionContext,
  requireAuth,
  requireRole,
  AuthorizationError,
} from "@/server/policies";
import { checkAndCompleteCourse } from "@/server/services/classroom.service";
import { maskDocumentNumber } from "@/server/services/certificate.service";
import {
  StudentAssignmentItem,
  InstructorSubmissionItem,
} from "@/features/assignments/types";

export type { StudentAssignmentItem, InstructorSubmissionItem };

/**
 * Obtiene las evaluaciones para un estudiante o las entregas para un instructor.
 */
export async function getAssignmentsForUser(
  session: SessionContext | null | undefined
): Promise<{
  role: "STUDENT" | "INSTRUCTOR";
  studentAssignments: StudentAssignmentItem[];
  instructorSubmissions: InstructorSubmissionItem[];
}> {
  const user = requireAuth(session);

  if (user.role === "INSTRUCTOR") {
    // Entregas de alumnos en los cursos del instructor
    const submissions = await prisma.submission.findMany({
      where: {
        assessment: {
          course: {
            instructorId: user.id,
          },
        },
      },
      include: {
        assessment: {
          include: {
            course: true,
          },
        },
        enrollment: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    const instructorSubmissions: InstructorSubmissionItem[] = submissions.map((sub) => {
      const student = sub.enrollment.user;
      return {
        id: sub.id,
        assessmentId: sub.assessmentId,
        assessmentTitle: sub.assessment.title,
        courseId: sub.assessment.course.id,
        courseTitle: sub.assessment.course.title,
        passingScore: sub.assessment.passingScore,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        studentDocumentMasked: student.documentNumber
          ? maskDocumentNumber(student.documentNumber)
          : "Sin DNI",
        contentUrlOrText: sub.contentUrlOrText,
        score: sub.score,
        status: sub.status,
        feedback: sub.feedback,
        submittedAt: sub.submittedAt.toISOString(),
        gradedAt: sub.gradedAt ? sub.gradedAt.toISOString() : null,
      };
    });

    return {
      role: "INSTRUCTOR",
      studentAssignments: [],
      instructorSubmissions,
    };
  }

  // Estudiante: Buscar evaluaciones de sus cursos activos o completados
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: user.id,
      status: { in: ["ACTIVE", "COMPLETED"] },
    },
    include: {
      course: {
        include: {
          assessments: true,
        },
      },
      submissions: true,
    },
  });

  const studentAssignments: StudentAssignmentItem[] = [];

  for (const enr of enrollments) {
    for (const assessment of enr.course.assessments) {
      const sub = enr.submissions.find((s) => s.assessmentId === assessment.id);
      studentAssignments.push({
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        passingScore: assessment.passingScore,
        courseId: enr.course.id,
        courseTitle: enr.course.title,
        courseSlug: enr.course.slug,
        enrollmentId: enr.id,
        submission: sub
          ? {
              id: sub.id,
              contentUrlOrText: sub.contentUrlOrText,
              score: sub.score,
              status: sub.status,
              feedback: sub.feedback,
              submittedAt: sub.submittedAt.toISOString(),
              gradedAt: sub.gradedAt ? sub.gradedAt.toISOString() : null,
            }
          : null,
      });
    }
  }

  return {
    role: "STUDENT",
    studentAssignments,
    instructorSubmissions: [],
  };
}

/**
 * Entrega de tarea por un estudiante (texto o URL).
 */
export async function submitAssignment(
  session: SessionContext | null | undefined,
  input: {
    enrollmentId: string;
    assessmentId: string;
    contentUrlOrText: string;
  }
) {
  const user = requireAuth(session);

  const trimmedContent = input.contentUrlOrText.trim();
  if (trimmedContent.length < 5) {
    throw new AuthorizationError(
      "La entrega debe contener un enlace o descripción de al menos 5 caracteres",
      400
    );
  }

  // Validar matrícula del alumno
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: input.enrollmentId },
    include: { course: true },
  });

  if (!enrollment || enrollment.userId !== user.id) {
    throw new AuthorizationError("No eres el titular de esta matrícula", 403);
  }

  if (enrollment.status === "PENDING") {
    throw new AuthorizationError(
      "Tu matrícula está pendiente de confirmación de pago",
      403
    );
  }

  // Validar evaluación
  const assessment = await prisma.assessment.findUnique({
    where: { id: input.assessmentId },
  });

  if (!assessment || assessment.courseId !== enrollment.courseId) {
    throw new AuthorizationError("La evaluación no pertenece a este curso", 400);
  }

  // Buscar si ya existe entrega previa para actualizar o crear nueva
  const existing = await prisma.submission.findFirst({
    where: {
      enrollmentId: enrollment.id,
      assessmentId: assessment.id,
    },
  });

  let submission;
  if (existing) {
    submission = await prisma.submission.update({
      where: { id: existing.id },
      data: {
        contentUrlOrText: trimmedContent,
        status: "PENDING",
        score: null,
        feedback: null,
        submittedAt: new Date(),
        gradedAt: null,
      },
    });
  } else {
    submission = await prisma.submission.create({
      data: {
        enrollmentId: enrollment.id,
        assessmentId: assessment.id,
        contentUrlOrText: trimmedContent,
        status: "PENDING",
        submittedAt: new Date(),
      },
    });
  }

  return {
    success: true,
    submissionId: submission.id,
    status: submission.status,
  };
}

/**
 * Calificación de una entrega por el docente con nota (0-20) y feedback (AC-14).
 * Si la nota es aprobatoria (>= passingScore) y todas las lecciones están completas,
 * la matrícula pasa a COMPLETED.
 */
export async function gradeAssignment(
  session: SessionContext | null | undefined,
  input: {
    submissionId: string;
    score: number;
    feedback?: string;
  }
) {
  const user = requireRole(session, "INSTRUCTOR");

  if (input.score < 0 || input.score > 20 || isNaN(input.score)) {
    throw new AuthorizationError("La nota debe estar entre 0 y 20", 400);
  }

  const submission = await prisma.submission.findUnique({
    where: { id: input.submissionId },
    include: {
      assessment: {
        include: { course: true },
      },
      enrollment: true,
    },
  });

  if (!submission) {
    throw new AuthorizationError("Entrega no encontrada", 404);
  }

  // Verificar que el instructor sea el titular del curso
  if (submission.assessment.course.instructorId !== user.id) {
    throw new AuthorizationError(
      "No eres el docente asignado a este curso para calificar",
      403
    );
  }

  const passingScore = submission.assessment.passingScore;
  const isApproved = input.score >= passingScore;
  const newStatus = isApproved ? "APPROVED" : "REJECTED";

  const updated = await prisma.submission.update({
    where: { id: submission.id },
    data: {
      score: input.score,
      feedback: input.feedback?.trim() || null,
      status: newStatus,
      gradedAt: new Date(),
    },
  });

  // Registro de Auditoría
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "GRADE_SUBMISSION",
      targetType: "Submission",
      targetId: updated.id,
      metadata: {
        score: input.score,
        status: newStatus,
        passingScore,
        enrollmentId: submission.enrollmentId,
        studentId: submission.enrollment.userId,
      },
    },
  });

  // AC-14: Verificar si con esta aprobación se completa la matrícula
  let courseJustCompleted = false;
  if (isApproved) {
    courseJustCompleted = await checkAndCompleteCourse(submission.enrollmentId);
  }

  return {
    success: true,
    submissionId: updated.id,
    score: updated.score,
    status: updated.status,
    courseJustCompleted,
  };
}
