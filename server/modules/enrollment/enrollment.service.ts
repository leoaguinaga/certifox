import "server-only";
import type { EnrollmentStatus } from "@prisma/client";
import { db, dbRead, transaction } from "@/server/core/db";
import { notFound, preconditionFailed } from "@/server/core/errors";
import { enqueue } from "@/server/core/outbox";
import { pageArgs, toPage, type PageQuery } from "@/server/core/pagination";
import { assertCanManageCourse, manageableCoursesWhere } from "@/server/core/policies";
import type { AuthedContext } from "@/server/core/request-context";
import { recordAudit } from "@/server/modules/audit/audit";
import { ensureMembership, getOrganizationPaymentSettings } from "@/server/modules/organization/organization.service";
import { buildPaymentInstructions, type PaymentInstructions } from "@/server/modules/organization/payment-settings";
import { maskDocumentNumber } from "@/lib/masking";
import type { EnrollmentRequestResult } from "@/features/catalog/types";

export type RequestEnrollmentResult = EnrollmentRequestResult;

/**
 * Solicitud de matrícula (RF-05). S3: requiere sesión; se matricula SIEMPRE al usuario
 * autenticado (ya no se crean usuarios a partir de un email arbitrario).
 * Idempotente: repetir la solicitud devuelve la matrícula existente.
 * Cursos gratuitos (precio 0) se activan de inmediato.
 */
export async function requestEnrollment(ctx: AuthedContext, input: { courseId: string }): Promise<RequestEnrollmentResult> {
  const course = await db.course.findFirst({
    where: { id: input.courseId, published: true, organization: { status: "ACTIVE" } },
    select: { id: true, title: true, priceCents: true, currency: true, organizationId: true },
  });
  if (!course) throw notFound("El curso solicitado no existe o no está disponible");

  const isFree = course.priceCents === 0;

  const enrollment = await transaction(async (tx) => {
    await ensureMembership(tx, course.organizationId, ctx.user.id, "STUDENT");
    const existing = await tx.enrollment.findUnique({
      where: { userId_courseId: { userId: ctx.user.id, courseId: course.id } },
      select: { id: true, status: true },
    });
    if (existing) return existing;

    const created = await tx.enrollment.create({
      data: {
        userId: ctx.user.id,
        courseId: course.id,
        organizationId: course.organizationId,
        priceCents: course.priceCents,
        currency: course.currency,
        status: isFree ? "ACTIVE" : "PENDING",
        activatedAt: isFree ? new Date() : null,
      },
      select: { id: true, status: true },
    });
    await enqueue(tx, isFree ? "enrollment.activated" : "enrollment.requested", { enrollmentId: created.id });
    return created;
  });

  let instructions: PaymentInstructions | null = null;
  if (enrollment.status === "PENDING") {
    const org = await getOrganizationPaymentSettings(course.organizationId);
    instructions = buildPaymentInstructions({
      organizationName: org.name,
      settings: org.settings,
      priceCents: course.priceCents,
      currency: course.currency,
      courseTitle: course.title,
      studentName: ctx.user.name,
    });
  }

  return { enrollmentId: enrollment.id, status: enrollment.status, courseTitle: course.title, instructions };
}

/**
 * Confirmación manual de pago (RF-06). Transición PENDING → ACTIVE atómica e idempotente:
 * dos confirmaciones simultáneas producen una sola activación y una sola auditoría.
 */
export async function confirmEnrollmentPayment(ctx: AuthedContext, input: { enrollmentId: string; note?: string }) {
  const enrollment = await db.enrollment.findUnique({
    where: { id: input.enrollmentId },
    select: {
      id: true,
      status: true,
      userId: true,
      course: { select: { id: true, title: true, organizationId: true, instructorId: true } },
    },
  });
  if (!enrollment) throw notFound("Matrícula no encontrada");
  const staff = assertCanManageCourse(ctx, enrollment.course);

  return transaction(async (tx) => {
    const { count } = await tx.enrollment.updateMany({
      where: { id: enrollment.id, status: "PENDING" },
      data: { status: "ACTIVE", activatedAt: new Date() },
    });
    if (count === 1) {
      await recordAudit(tx, {
        action: "CONFIRM_PAYMENT",
        targetType: "Enrollment",
        targetId: enrollment.id,
        actorId: staff.userId,
        organizationId: staff.organizationId,
        metadata: {
          studentId: enrollment.userId,
          courseId: enrollment.course.id,
          note: input.note?.trim() || "Confirmación de abono manual",
        },
      });
      await enqueue(tx, "enrollment.activated", { enrollmentId: enrollment.id });
    }
    const current = await tx.enrollment.findUniqueOrThrow({
      where: { id: enrollment.id },
      select: { id: true, status: true },
    });
    return { ...current, changed: count === 1 };
  });
}

export interface InstructorEnrollmentItem {
  id: string;
  studentName: string;
  studentEmail: string;
  documentMasked: string;
  courseId: string;
  courseTitle: string;
  status: EnrollmentStatus;
  createdAt: string;
  activatedAt: string | null;
  completedAt: string | null;
  hasCertificate: boolean;
  certificateCode: string | null;
}

/** Matrículas de los cursos que el staff puede gestionar (RF-11), paginadas. */
export async function listManagedEnrollments(
  ctx: AuthedContext,
  query: PageQuery & { status?: EnrollmentStatus } = {}
) {
  const courseWhere = manageableCoursesWhere(ctx);
  const { limit, ...args } = pageArgs(query);
  const rows = await dbRead.enrollment.findMany({
    where: {
      organizationId: courseWhere.organizationId,
      ...("instructorId" in courseWhere ? { course: { instructorId: courseWhere.instructorId } } : {}),
      ...(query.status ? { status: query.status } : {}),
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      activatedAt: true,
      completedAt: true,
      courseId: true,
      user: { select: { name: true, email: true, documentNumber: true } },
      course: { select: { title: true } },
      certificate: { select: { code: true } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...args,
  });

  return toPage(rows, limit, (e): InstructorEnrollmentItem => ({
    id: e.id,
    studentName: e.user.name,
    studentEmail: e.user.email,
    documentMasked: e.user.documentNumber ? maskDocumentNumber(e.user.documentNumber) : "No registrado",
    courseId: e.courseId,
    courseTitle: e.course.title,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
    activatedAt: e.activatedAt?.toISOString() ?? null,
    completedAt: e.completedAt?.toISOString() ?? null,
    hasCertificate: Boolean(e.certificate),
    certificateCode: e.certificate?.code ?? null,
  }));
}

/** Instrucciones de pago de una matrícula pendiente propia (para reabrirlas desde el aula). */
export async function getMyPaymentInstructions(ctx: AuthedContext, enrollmentId: string) {
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      userId: true,
      status: true,
      priceCents: true,
      currency: true,
      organizationId: true,
      course: { select: { title: true } },
    },
  });
  if (!enrollment || enrollment.userId !== ctx.user.id) throw notFound("Matrícula no encontrada");
  if (enrollment.status !== "PENDING") throw preconditionFailed("La matrícula ya está activa");
  const org = await getOrganizationPaymentSettings(enrollment.organizationId);
  return buildPaymentInstructions({
    organizationName: org.name,
    settings: org.settings,
    priceCents: enrollment.priceCents,
    currency: enrollment.currency,
    courseTitle: enrollment.course.title,
    studentName: ctx.user.name,
  });
}
