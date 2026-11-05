import "server-only";
import type { Tx } from "@/server/core/db";
import { recordAudit } from "@/server/modules/audit/audit";

/**
 * AC-14: completa la matrícula si (1) todas las lecciones están marcadas y (2) todas las
 * evaluaciones están aprobadas. Se ejecuta dentro de la transacción del caso de uso y la
 * transición ACTIVE → COMPLETED es condicional, por lo que es segura ante concurrencia.
 */
export async function completeEnrollmentIfEligible(tx: Tx, enrollmentId: string, actorId: string): Promise<boolean> {
  const enrollment = await tx.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      id: true,
      status: true,
      organizationId: true,
      courseId: true,
      course: { select: { lessonsCount: true, assessments: { select: { id: true, passingScore: true } } } },
      _count: { select: { progress: true } },
      submissions: { select: { assessmentId: true, status: true, score: true } },
    },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") return false;

  const totalLessons = enrollment.course.lessonsCount;
  if (totalLessons === 0 || enrollment._count.progress < totalLessons) return false;

  for (const assessment of enrollment.course.assessments) {
    const sub = enrollment.submissions.find((s) => s.assessmentId === assessment.id);
    const approved = sub && (sub.status === "APPROVED" || (sub.score !== null && sub.score >= assessment.passingScore));
    if (!approved) return false;
  }

  const { count } = await tx.enrollment.updateMany({
    where: { id: enrollment.id, status: "ACTIVE" },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
  if (count === 0) return false;

  await recordAudit(tx, {
    action: "COMPLETE_COURSE",
    targetType: "Enrollment",
    targetId: enrollment.id,
    actorId,
    organizationId: enrollment.organizationId,
    metadata: { courseId: enrollment.courseId },
  });
  return true;
}

export function progressPercent(completed: number, total: number): number {
  return total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
}
