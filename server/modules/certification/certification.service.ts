import "server-only";
import { Prisma } from "@prisma/client";
import { db, dbRead, transaction } from "@/server/core/db";
import { invalid, notFound, preconditionFailed } from "@/server/core/errors";
import { enqueue } from "@/server/core/outbox";
import { pageArgs, toPage, type Page, type PageQuery } from "@/server/core/pagination";
import { assertCanManageCourse, manageableCoursesWhere } from "@/server/core/policies";
import type { AuthedContext } from "@/server/core/request-context";
import { recordAudit } from "@/server/modules/audit/audit";
import { maskDocumentNumber } from "@/lib/masking";
import type { EligibleEnrollmentItem, StudentCertificateItem } from "@/features/certificates-management/types";
import { certificateFingerprint, generateCertificateCode, normalizeCertificateCode } from "./certificate-code";

const VALIDITY_YEARS = 2;

export interface IssueCertificateResult {
  success: true;
  code: string;
  sha256: string;
  isAlreadyIssued: boolean;
}

/**
 * Emisión (AC-16). Idempotente y segura ante doble clic: la restricción única de
 * `enrollmentId` decide; el perdedor de la carrera devuelve el certificado existente.
 * El PDF se genera de forma asíncrona (outbox → R2).
 */
export async function issueCertificate(ctx: AuthedContext, enrollmentId: string): Promise<IssueCertificateResult> {
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      id: true,
      status: true,
      organizationId: true,
      user: { select: { name: true } },
      course: { select: { title: true, hours: true, organizationId: true, instructorId: true } },
      certificate: { select: { code: true, sha256: true } },
      submissions: { where: { status: "APPROVED" }, select: { score: true } },
    },
  });
  if (!enrollment) throw notFound("Matrícula no encontrada");
  const staff = assertCanManageCourse(ctx, enrollment.course);

  if (enrollment.certificate) {
    return { success: true, ...enrollment.certificate, isAlreadyIssued: true };
  }
  if (enrollment.status !== "COMPLETED") {
    throw preconditionFailed("No se puede emitir: el alumno no ha completado el 100% de los requisitos del programa");
  }

  const scores = enrollment.submissions.map((s) => s.score).filter((s): s is number => s !== null);
  const finalScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCertificateCode();
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + VALIDITY_YEARS);
    const snapshot = {
      holderName: enrollment.user.name,
      courseTitle: enrollment.course.title,
      hours: enrollment.course.hours,
    };
    const sha256 = certificateFingerprint({
      code,
      ...snapshot,
      organizationId: enrollment.organizationId,
      enrollmentId: enrollment.id,
      issuedAt,
    });

    try {
      const cert = await transaction(async (tx) => {
        const created = await tx.certificate.create({
          data: {
            code,
            sha256,
            status: "VALID",
            issuedAt,
            expiresAt,
            ...snapshot,
            finalScore,
            organizationId: enrollment.organizationId,
            enrollmentId: enrollment.id,
          },
          select: { id: true, code: true, sha256: true },
        });
        await recordAudit(tx, {
          action: "ISSUE_CERTIFICATE",
          targetType: "Certificate",
          targetId: created.id,
          actorId: staff.userId,
          organizationId: staff.organizationId,
          metadata: { code, enrollmentId: enrollment.id, sha256 },
        });
        await enqueue(tx, "certificate.issued", { certificateId: created.id });
        return created;
      });
      return { success: true, code: cert.code, sha256: cert.sha256, isAlreadyIssued: false };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const target = String((err.meta as { target?: unknown })?.target ?? "");
        if (target.includes("enrollmentId")) {
          const existing = await db.certificate.findUniqueOrThrow({
            where: { enrollmentId: enrollment.id },
            select: { code: true, sha256: true },
          });
          return { success: true, ...existing, isAlreadyIssued: true };
        }
        continue; // colisión de código (prácticamente imposible con 80 bits): reintentar
      }
      throw err;
    }
  }
  throw new Error("No se pudo generar un código de certificado único");
}

/** Revocación con motivo obligatorio (AC-17). Atómica: estado + auditoría + notificación. */
export async function revokeCertificate(ctx: AuthedContext, input: { code: string; reason: string }) {
  const reason = input.reason.trim();
  if (reason.length < 8) throw invalid("Debes indicar un motivo de revocación de al menos 8 caracteres");

  const certificate = await db.certificate.findUnique({
    where: { code: normalizeCertificateCode(input.code) },
    select: {
      id: true,
      code: true,
      status: true,
      enrollment: { select: { course: { select: { organizationId: true, instructorId: true } } } },
    },
  });
  if (!certificate) throw notFound("Certificado no encontrado");
  const staff = assertCanManageCourse(ctx, certificate.enrollment.course);

  return transaction(async (tx) => {
    const revokedAt = new Date();
    const { count } = await tx.certificate.updateMany({
      where: { id: certificate.id, status: { not: "REVOKED" } },
      data: { status: "REVOKED", revokedAt, revocationReason: reason },
    });
    if (count === 1) {
      await recordAudit(tx, {
        action: "REVOKE_CERTIFICATE",
        targetType: "Certificate",
        targetId: certificate.id,
        actorId: staff.userId,
        organizationId: staff.organizationId,
        metadata: { code: certificate.code, reason },
      });
      await enqueue(tx, "certificate.revoked", { certificateId: certificate.id });
    }
    return tx.certificate.findUniqueOrThrow({
      where: { id: certificate.id },
      select: { id: true, code: true, status: true, revokedAt: true, revocationReason: true },
    });
  });
}

export async function listMyCertificates(ctx: AuthedContext): Promise<StudentCertificateItem[]> {
  const [user, certs] = await Promise.all([
    db.user.findUnique({ where: { id: ctx.user.id }, select: { documentNumber: true } }),
    db.certificate.findMany({
      where: { enrollment: { userId: ctx.user.id } },
      orderBy: { issuedAt: "desc" },
      take: 200,
      select: {
        id: true,
        code: true,
        sha256: true,
        status: true,
        issuedAt: true,
        expiresAt: true,
        revokedAt: true,
        revocationReason: true,
        holderName: true,
        courseTitle: true,
        hours: true,
        organization: { select: { name: true } },
        enrollment: { select: { course: { select: { slug: true, instructor: { select: { name: true } } } } } },
      },
    }),
  ]);
  const doc = maskDocumentNumber(user?.documentNumber);
  return certs.map((c) => ({
    id: c.id,
    code: c.code,
    sha256: c.sha256,
    status: c.status,
    issuedAt: c.issuedAt.toISOString(),
    expiresAt: c.expiresAt?.toISOString() ?? null,
    revokedAt: c.revokedAt?.toISOString() ?? null,
    revocationReason: c.revocationReason,
    courseTitle: c.courseTitle,
    courseSlug: c.enrollment.course.slug,
    hours: c.hours,
    instructorName: c.enrollment.course.instructor.name,
    institution: c.organization.name,
    studentName: c.holderName,
    studentDocumentMasked: doc,
  }));
}

/** Panel de emisión: matrículas completadas de los cursos gestionables, paginadas. */
export async function listCompletedEnrollmentsForIssuing(
  ctx: AuthedContext,
  query: PageQuery = {}
): Promise<Page<EligibleEnrollmentItem>> {
  const courseWhere = manageableCoursesWhere(ctx);
  const { limit, ...args } = pageArgs(query);
  const rows = await dbRead.enrollment.findMany({
    where: { status: "COMPLETED", organizationId: courseWhere.organizationId, course: courseWhere },
    select: {
      id: true,
      completedAt: true,
      user: { select: { id: true, name: true, email: true, documentNumber: true } },
      course: { select: { id: true, title: true } },
      certificate: { select: { code: true, status: true } },
    },
    orderBy: [{ completedAt: "desc" }, { id: "desc" }],
    ...args,
  });
  return toPage(rows, limit, (e) => ({
    enrollmentId: e.id,
    studentId: e.user.id,
    studentName: e.user.name,
    studentEmail: e.user.email,
    studentDocumentMasked: maskDocumentNumber(e.user.documentNumber),
    courseId: e.course.id,
    courseTitle: e.course.title,
    completedAt: e.completedAt?.toISOString() ?? "",
    certificateCode: e.certificate?.code ?? null,
    certificateStatus: e.certificate?.status ?? null,
  }));
}
