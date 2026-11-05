import "server-only";
import { db, transaction } from "@/server/core/db";
import { forbidden, notFound } from "@/server/core/errors";
import { isStaffRole } from "@/server/core/roles";
import type { AuthedContext } from "@/server/core/request-context";
import { isStorageConfigured } from "@/server/core/storage";
import { signedFileUrl } from "@/server/modules/files/files.service";
import type { ClassroomAssessment, ClassroomData, ClassroomModule } from "@/features/classroom/types";
import { completeEnrollmentIfEligible, progressPercent } from "./progress";

/**
 * Aula virtual. Reglas de acceso:
 *  - staff de la organización del curso → INSTRUCTOR_PREVIEW
 *  - sin matrícula → NOT_ENROLLED · PENDING → PENDING_PAYMENT (AC-11) · ACTIVE/COMPLETED → GRANTED
 */
export async function getClassroomData(ctx: AuthedContext, courseSlug: string): Promise<ClassroomData | null> {
  const course = await db.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      category: true,
      level: true,
      hours: true,
      lessonsCount: true,
      organizationId: true,
      organization: { select: { name: true } },
      instructor: { select: { name: true, institution: true } },
    },
  });
  if (!course) return null;

  const header = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    category: course.category,
    level: course.level,
    hours: course.hours,
    instructorName: course.instructor.name,
    institution: course.instructor.institution ?? course.organization.name,
  };

  const staffMembership = ctx.memberships.find(
    (m) => m.organization.id === course.organizationId && isStaffRole(m.role)
  );

  const enrollment = staffMembership
    ? null
    : await db.enrollment.findUnique({
        where: { userId_courseId: { userId: ctx.user.id, courseId: course.id } },
        select: {
          id: true,
          status: true,
          progress: { select: { lessonId: true } },
          submissions: true,
        },
      });

  if (!staffMembership && !enrollment) {
    return { course: header, accessStatus: "NOT_ENROLLED", modules: [], totalLessons: course.lessonsCount, completedLessonsCount: 0, progressPercent: 0, assessments: [] };
  }
  if (enrollment?.status === "PENDING") {
    return {
      course: header,
      accessStatus: "PENDING_PAYMENT",
      enrollmentId: enrollment.id,
      enrollmentStatus: enrollment.status,
      modules: [],
      totalLessons: course.lessonsCount,
      completedLessonsCount: 0,
      progressPercent: 0,
      assessments: [],
    };
  }

  const [modulesRows, assessmentsRows] = await Promise.all([
    db.module.findMany({
      where: { courseId: course.id },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        order: true,
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            videoUrl: true,
            durationMin: true,
            moduleId: true,
            videoFile: { select: { bucket: true, key: true, status: true } },
          },
        },
      },
    }),
    db.assessment.findMany({
      where: { courseId: course.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, description: true, passingScore: true },
    }),
  ]);

  const completed = new Set(enrollment?.progress.map((p) => p.lessonId) ?? []);
  const isPreview = Boolean(staffMembership);

  const modules: ClassroomModule[] = await Promise.all(
    modulesRows.map(async (m) => ({
      id: m.id,
      title: m.title,
      order: m.order,
      lessons: await Promise.all(
        m.lessons.map(async (l) => ({
          id: l.id,
          title: l.title,
          order: l.order,
          // Video en R2 (privado) → URL firmada de corta duración; si no, enlace externo.
          videoUrl:
            l.videoFile?.status === "READY" && isStorageConfigured()
              ? await signedFileUrl(l.videoFile, { expiresInSeconds: 60 * 60 })
              : l.videoUrl,
          durationMin: l.durationMin,
          moduleId: l.moduleId,
          isCompleted: isPreview || completed.has(l.id),
        }))
      ),
    }))
  );

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessonsCount = isPreview ? totalLessons : completed.size;

  const assessments: ClassroomAssessment[] = assessmentsRows.map((a) => {
    const sub = enrollment?.submissions.find((s) => s.assessmentId === a.id);
    return {
      ...a,
      submission: sub
        ? {
            id: sub.id,
            contentUrlOrText: sub.contentUrlOrText,
            score: sub.score,
            status: sub.status,
            feedback: sub.feedback,
            submittedAt: sub.submittedAt.toISOString(),
            gradedAt: sub.gradedAt?.toISOString() ?? null,
          }
        : null,
    };
  });

  return {
    course: header,
    accessStatus: isPreview ? "INSTRUCTOR_PREVIEW" : "GRANTED",
    enrollmentId: enrollment?.id,
    enrollmentStatus: enrollment?.status,
    modules,
    totalLessons,
    completedLessonsCount,
    progressPercent: isPreview ? 100 : progressPercent(completedLessonsCount, totalLessons),
    assessments,
  };
}

/** AC-13: marca o desmarca una lección y completa el curso si corresponde. Todo en una transacción. */
export async function toggleLessonProgress(
  ctx: AuthedContext,
  input: { courseSlug: string; lessonId: string; completed: boolean }
) {
  const lesson = await db.lesson.findFirst({
    where: { id: input.lessonId, module: { course: { slug: input.courseSlug } } },
    select: { id: true, module: { select: { courseId: true, course: { select: { lessonsCount: true } } } } },
  });
  if (!lesson) throw notFound("La lección no pertenece a este curso");

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: ctx.user.id, courseId: lesson.module.courseId } },
    select: { id: true, status: true },
  });
  if (!enrollment || enrollment.status === "PENDING") {
    throw forbidden("No tienes una matrícula activa para registrar avance en este curso");
  }

  return transaction(async (tx) => {
    if (input.completed) {
      await tx.lessonProgress.upsert({
        where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: lesson.id } },
        create: { enrollmentId: enrollment.id, lessonId: lesson.id },
        update: {},
      });
    } else {
      await tx.lessonProgress.deleteMany({ where: { enrollmentId: enrollment.id, lessonId: lesson.id } });
    }

    const courseJustCompleted = await completeEnrollmentIfEligible(tx, enrollment.id, ctx.user.id);
    const completedCount = await tx.lessonProgress.count({ where: { enrollmentId: enrollment.id } });
    const totalCount = lesson.module.course.lessonsCount;

    return {
      success: true,
      isCompleted: input.completed,
      completedCount,
      totalCount,
      progressPercent: progressPercent(completedCount, totalCount),
      enrollmentStatus: courseJustCompleted ? ("COMPLETED" as const) : enrollment.status,
      courseJustCompleted,
    };
  });
}
