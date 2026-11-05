import "server-only";
import { db, dbRead, transaction } from "@/server/core/db";
import { invalid, notFound } from "@/server/core/errors";
import { pageArgs, toPage, type Page, type PageQuery } from "@/server/core/pagination";
import { assertCanManageCourse, assertCanSubmitAssessment, manageableCoursesWhere } from "@/server/core/policies";
import type { AuthedContext } from "@/server/core/request-context";
import { recordAudit } from "@/server/modules/audit/audit";
import { claimReadyFile } from "@/server/modules/files/files.service";
import { completeEnrollmentIfEligible } from "@/server/modules/learning/progress";
import { maskDocumentNumber } from "@/lib/masking";
import type { InstructorSubmissionItem, StudentAssignmentItem } from "@/features/assignments/types";

const MAX_STUDENT_ITEMS = 200;

export async function listMyAssignments(ctx: AuthedContext): Promise<StudentAssignmentItem[]> {
  const enrollments = await db.enrollment.findMany({
    where: { userId: ctx.user.id, status: { in: ["ACTIVE", "COMPLETED"] } },
    take: MAX_STUDENT_ITEMS,
    select: {
      id: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          assessments: { select: { id: true, title: true, description: true, passingScore: true } },
        },
      },
      submissions: true,
    },
  });

  return enrollments.flatMap((enr) =>
    enr.course.assessments.map((a) => {
      const sub = enr.submissions.find((s) => s.assessmentId === a.id);
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        passingScore: a.passingScore,
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
              gradedAt: sub.gradedAt?.toISOString() ?? null,
            }
          : null,
      };
    })
  );
}

/** Bandeja de calificación del staff, paginada y filtrable por estado. */
export async function listSubmissionsToGrade(
  ctx: AuthedContext,
  query: PageQuery & { status?: "PENDING" | "APPROVED" | "REJECTED" } = {}
): Promise<Page<InstructorSubmissionItem>> {
  const courseWhere = manageableCoursesWhere(ctx);
  const { limit, ...args } = pageArgs(query);
  const rows = await dbRead.submission.findMany({
    where: { assessment: { course: courseWhere }, ...(query.status ? { status: query.status } : {}) },
    select: {
      id: true,
      assessmentId: true,
      contentUrlOrText: true,
      score: true,
      status: true,
      feedback: true,
      submittedAt: true,
      gradedAt: true,
      assessment: { select: { title: true, passingScore: true, course: { select: { id: true, title: true } } } },
      enrollment: { select: { user: { select: { id: true, name: true, email: true, documentNumber: true } } } },
    },
    orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
    ...args,
  });

  return toPage(rows, limit, (sub) => ({
    id: sub.id,
    assessmentId: sub.assessmentId,
    assessmentTitle: sub.assessment.title,
    courseId: sub.assessment.course.id,
    courseTitle: sub.assessment.course.title,
    passingScore: sub.assessment.passingScore,
    studentId: sub.enrollment.user.id,
    studentName: sub.enrollment.user.name,
    studentEmail: sub.enrollment.user.email,
    studentDocumentMasked: maskDocumentNumber(sub.enrollment.user.documentNumber),
    contentUrlOrText: sub.contentUrlOrText,
    score: sub.score,
    status: sub.status,
    feedback: sub.feedback,
    submittedAt: sub.submittedAt.toISOString(),
    gradedAt: sub.gradedAt?.toISOString() ?? null,
  }));
}

/** Entrega (o reentrega) de una evaluación. Una sola fila por (matrícula, evaluación). */
export async function submitAssignment(
  ctx: AuthedContext,
  input: { enrollmentId: string; assessmentId: string; contentUrlOrText: string; attachmentFileId?: string }
) {
  const content = input.contentUrlOrText.trim();
  if (content.length < 5) throw invalid("La entrega debe contener un enlace o descripción de al menos 5 caracteres");

  const enrollment = await db.enrollment.findUnique({
    where: { id: input.enrollmentId },
    select: { id: true, userId: true, status: true, courseId: true },
  });
  if (!enrollment) throw notFound("Matrícula no encontrada");
  assertCanSubmitAssessment(ctx, enrollment);

  const assessment = await db.assessment.findFirst({
    where: { id: input.assessmentId, courseId: enrollment.courseId },
    select: { id: true },
  });
  if (!assessment) throw invalid("La evaluación no pertenece a este curso");

  return transaction(async (tx) => {
    const attachment = input.attachmentFileId
      ? await claimReadyFile(tx, ctx, input.attachmentFileId, "SUBMISSION_ATTACHMENT")
      : null;

    const data = {
      contentUrlOrText: content,
      status: "PENDING" as const,
      score: null,
      feedback: null,
      gradedAt: null,
      submittedAt: new Date(),
      attachmentFileId: attachment?.id ?? null,
    };
    const submission = await tx.submission.upsert({
      where: { enrollmentId_assessmentId: { enrollmentId: enrollment.id, assessmentId: assessment.id } },
      create: { enrollmentId: enrollment.id, assessmentId: assessment.id, ...data },
      update: data,
      select: { id: true, status: true },
    });
    return { success: true, submissionId: submission.id, status: submission.status };
  });
}

/** Calificación 0–20 (AC-14). Nota, auditoría y posible cierre del curso: atómicos. */
export async function gradeAssignment(ctx: AuthedContext, input: { submissionId: string; score: number; feedback?: string }) {
  if (!Number.isInteger(input.score) || input.score < 0 || input.score > 20) {
    throw invalid("La nota debe ser un entero entre 0 y 20");
  }

  const submission = await db.submission.findUnique({
    where: { id: input.submissionId },
    select: {
      id: true,
      enrollmentId: true,
      enrollment: { select: { userId: true } },
      assessment: { select: { passingScore: true, course: { select: { organizationId: true, instructorId: true } } } },
    },
  });
  if (!submission) throw notFound("Entrega no encontrada");
  const staff = assertCanManageCourse(ctx, submission.assessment.course);

  const passingScore = submission.assessment.passingScore;
  const status = input.score >= passingScore ? ("APPROVED" as const) : ("REJECTED" as const);

  return transaction(async (tx) => {
    const updated = await tx.submission.update({
      where: { id: submission.id },
      data: { score: input.score, feedback: input.feedback?.trim() || null, status, gradedAt: new Date() },
      select: { id: true, score: true, status: true },
    });
    await recordAudit(tx, {
      action: "GRADE_SUBMISSION",
      targetType: "Submission",
      targetId: updated.id,
      actorId: staff.userId,
      organizationId: staff.organizationId,
      metadata: { score: input.score, status, passingScore, enrollmentId: submission.enrollmentId },
    });
    const courseJustCompleted =
      status === "APPROVED" ? await completeEnrollmentIfEligible(tx, submission.enrollmentId, staff.userId) : false;

    return { success: true, submissionId: updated.id, score: updated.score, status: updated.status, courseJustCompleted };
  });
}
