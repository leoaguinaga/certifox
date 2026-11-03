import "server-only";

import { prisma } from "@/server/db";
import { SessionContext, requireAuth, AuthorizationError } from "@/server/policies";
import {
  AccessStatus,
  ClassroomLesson,
  ClassroomModule,
  ClassroomAssessment,
  ClassroomData,
} from "@/features/classroom/types";

export type {
  AccessStatus,
  ClassroomLesson,
  ClassroomModule,
  ClassroomAssessment,
  ClassroomData,
};

/**
 * Consulta integral para el Aula Virtual (Classroom).
 * Aplica políticas de acceso:
 * - Si es docente del curso -> INSTRUCTOR_PREVIEW con todas las lecciones visibles.
 * - Si el estudiante no está matriculado -> NOT_ENROLLED.
 * - Si la matrícula está PENDING -> PENDING_PAYMENT (AC-11: no permite reproducir).
 * - Si la matrícula está ACTIVE o COMPLETED -> GRANTED con progreso real (AC-13).
 */
export async function getClassroomData(
  session: SessionContext | null | undefined,
  courseSlug: string
): Promise<ClassroomData | null> {
  const user = requireAuth(session);

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          institution: true,
        },
      },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
      assessments: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!course) {
    return null;
  }

  // 1. Acceso de instructor (propietario o docente del campus)
  if (user.role === "INSTRUCTOR") {
    const modules: ClassroomModule[] = course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      order: m.order,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order,
        videoUrl: l.videoUrl,
        durationMin: l.durationMin,
        moduleId: l.moduleId,
        isCompleted: true, // El docente tiene vista completa
      })),
    }));

    const totalLessons = modules.flatMap((m) => m.lessons).length;

    return {
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        category: course.category,
        level: course.level,
        hours: course.hours,
        instructorName: course.instructor.name,
        institution: course.instructor.institution,
      },
      accessStatus: "INSTRUCTOR_PREVIEW",
      modules,
      totalLessons,
      completedLessonsCount: totalLessons,
      progressPercent: 100,
      assessments: course.assessments.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        passingScore: a.passingScore,
        submission: null,
      })),
    };
  }

  // 2. Acceso de estudiante: buscar matrícula del usuario en este curso
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
    include: {
      progress: true,
      submissions: true,
    },
  });

  if (!enrollment) {
    return {
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        category: course.category,
        level: course.level,
        hours: course.hours,
        instructorName: course.instructor.name,
        institution: course.instructor.institution,
      },
      accessStatus: "NOT_ENROLLED",
      modules: [],
      totalLessons: course.modules.flatMap((m) => m.lessons).length,
      completedLessonsCount: 0,
      progressPercent: 0,
      assessments: [],
    };
  }

  // AC-11: Matrícula PENDIENTE no deja reproducir lecciones
  if (enrollment.status === "PENDING") {
    return {
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        category: course.category,
        level: course.level,
        hours: course.hours,
        instructorName: course.instructor.name,
        institution: course.instructor.institution,
      },
      accessStatus: "PENDING_PAYMENT",
      enrollmentId: enrollment.id,
      enrollmentStatus: enrollment.status,
      modules: [],
      totalLessons: course.modules.flatMap((m) => m.lessons).length,
      completedLessonsCount: 0,
      progressPercent: 0,
      assessments: [],
    };
  }

  // 3. Matrícula ACTIVE o COMPLETED -> Acceso total
  const completedLessonIdSet = new Set(enrollment.progress.map((p) => p.lessonId));

  const modules: ClassroomModule[] = course.modules.map((m) => ({
    id: m.id,
    title: m.title,
    order: m.order,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      order: l.order,
      videoUrl: l.videoUrl,
      durationMin: l.durationMin,
      moduleId: l.moduleId,
      isCompleted: completedLessonIdSet.has(l.id),
    })),
  }));

  const totalLessons = modules.flatMap((m) => m.lessons).length;
  const completedLessonsCount = completedLessonIdSet.size;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  const assessments: ClassroomAssessment[] = course.assessments.map((a) => {
    const sub = enrollment.submissions.find((s) => s.assessmentId === a.id);
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      passingScore: a.passingScore,
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
    };
  });

  return {
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      summary: course.summary,
      category: course.category,
      level: course.level,
      hours: course.hours,
      instructorName: course.instructor.name,
      institution: course.instructor.institution,
    },
    accessStatus: "GRANTED",
    enrollmentId: enrollment.id,
    enrollmentStatus: enrollment.status,
    modules,
    totalLessons,
    completedLessonsCount,
    progressPercent,
    assessments,
  };
}

/**
 * Verifica si se cumplen las condiciones para completar el curso (AC-14):
 * 1. Todas las lecciones marcadas como completadas en LessonProgress.
 * 2. Todas las evaluaciones del curso aprobadas (score >= passingScore o APPROVED).
 */
export async function checkAndCompleteCourse(enrollmentId: string): Promise<boolean> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        include: {
          modules: { include: { lessons: true } },
          assessments: true,
        },
      },
      progress: true,
      submissions: true,
    },
  });

  if (!enrollment || enrollment.status === "COMPLETED") {
    return false;
  }

  // 1. Total de lecciones
  const totalLessons = enrollment.course.modules.flatMap((m) => m.lessons).length;
  const completedLessons = enrollment.progress.length;

  if (totalLessons === 0 || completedLessons < totalLessons) {
    return false;
  }

  // 2. Evaluaciones del curso (si existen, todas deben estar aprobadas)
  const assessments = enrollment.course.assessments;
  if (assessments.length > 0) {
    for (const assessment of assessments) {
      const submission = enrollment.submissions.find(
        (s) => s.assessmentId === assessment.id
      );
      if (!submission) return false;
      const isApproved =
        submission.status === "APPROVED" ||
        (submission.score !== null && submission.score >= assessment.passingScore);
      if (!isApproved) return false;
    }
  }

  // Ambas condiciones cumplidas -> Transición a COMPLETED
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: enrollment.userId,
      action: "COMPLETE_COURSE",
      targetType: "Enrollment",
      targetId: enrollment.id,
      metadata: {
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        completedAt: new Date().toISOString(),
      },
    },
  });

  return true;
}

/**
 * Marca o desmarca una lección como completada (AC-13).
 */
export async function toggleLessonProgress(
  session: SessionContext | null | undefined,
  input: {
    courseSlug: string;
    lessonId: string;
    completed: boolean;
  }
) {
  const user = requireAuth(session);

  const course = await prisma.course.findUnique({
    where: { slug: input.courseSlug },
    select: { id: true, title: true },
  });

  if (!course) {
    throw new AuthorizationError("Curso no encontrado", 404);
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  if (!enrollment || (enrollment.status !== "ACTIVE" && enrollment.status !== "COMPLETED")) {
    throw new AuthorizationError(
      "No tienes una matrícula activa para registrar avance en este curso",
      403
    );
  }

  // Validar pertenencia de la lección
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: input.lessonId,
      module: { courseId: course.id },
    },
  });

  if (!lesson) {
    throw new AuthorizationError("La lección no pertenece a este curso", 400);
  }

  if (input.completed) {
    await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId: input.lessonId,
        },
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId: input.lessonId,
        completedAt: new Date(),
      },
      update: {
        completedAt: new Date(),
      },
    });
  } else {
    await prisma.lessonProgress.deleteMany({
      where: {
        enrollmentId: enrollment.id,
        lessonId: input.lessonId,
      },
    });
  }

  // Comprobar si con este avance se completa el programa (AC-14)
  const courseJustCompleted = await checkAndCompleteCourse(enrollment.id);

  // Recalcular métricas
  const totalLessons = await prisma.lesson.count({
    where: { module: { courseId: course.id } },
  });
  const completedLessons = await prisma.lessonProgress.count({
    where: { enrollmentId: enrollment.id },
  });
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const currentEnrollment = await prisma.enrollment.findUnique({
    where: { id: enrollment.id },
    select: { status: true },
  });

  return {
    success: true,
    isCompleted: input.completed,
    completedCount: completedLessons,
    totalCount: totalLessons,
    progressPercent,
    enrollmentStatus: currentEnrollment?.status ?? enrollment.status,
    courseJustCompleted,
  };
}
