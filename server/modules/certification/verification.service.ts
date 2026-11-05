import "server-only";
import { cache } from "react";
import type { CertificateStatus as DbStatus } from "@prisma/client";
import { dbRead } from "@/server/core/db";
import { maskDocumentNumber } from "@/lib/masking";
import type { Certificate, CertificateStatus } from "@/features/certificates/types";
import { isPlausibleCertificateCode, normalizeCertificateCode } from "./certificate-code";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function formatDateEs(date?: Date | null): string {
  if (!date) return "N/D";
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** RF-23: el vencimiento se calcula al leer (sin cron). */
export function effectiveStatus(status: DbStatus, expiresAt: Date | null, now = new Date()): CertificateStatus {
  if (status === "REVOKED") return "revocado";
  if (status === "OBSERVED") return "observado";
  if (status === "EXPIRED" || (expiresAt && expiresAt < now)) return "expirado";
  return "valido";
}

const STATUS_LABELS: Record<CertificateStatus, string> = {
  valido: "Estado: Válido y Vigente",
  expirado: "Estado: Credencial Vencida",
  revocado: "Estado: Credencial Revocada / No Vigente",
  observado: "Estado: Credencial en Observación Registral",
};

/**
 * Verificación pública (RF-02). Solo datos reales del snapshot del certificado:
 * nada de valores de relleno. El documento siempre va enmascarado (Ley 29733).
 */
export const getPublicCertificate = cache(async (rawCode: string): Promise<Certificate | null> => {
  const code = normalizeCertificateCode(rawCode);
  if (!isPlausibleCertificateCode(code)) return null;

  const cert = await dbRead.certificate.findUnique({
    where: { code },
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
      finalScore: true,
      organization: { select: { name: true, legalName: true } },
      enrollment: {
        select: {
          user: { select: { documentNumber: true } },
          course: { select: { slug: true, summary: true, instructor: { select: { name: true } } } },
        },
      },
    },
  });
  if (!cert) return null;

  const status = effectiveStatus(cert.status, cert.expiresAt);
  const issuer = cert.organization.legalName ?? cert.organization.name;

  return {
    code: cert.code,
    status,
    statusLabel: STATUS_LABELS[status],
    complianceStandards: ["Huella criptográfica SHA-256", "Verificación pública en tiempo real"],
    student: {
      name: cert.holderName,
      documentMasked: maskDocumentNumber(cert.enrollment.user.documentNumber),
      documentLawNotice: "Protegido por Ley 29733",
    },
    course: {
      title: cert.courseTitle,
      slug: cert.enrollment.course.slug,
      courseCode: cert.enrollment.course.slug.slice(0, 6).toUpperCase(),
      description: cert.enrollment.course.summary,
      issuingEntity: issuer,
      instructor: { name: cert.enrollment.course.instructor.name },
    },
    evaluation: {
      finalGrade: cert.finalScore,
      maxGrade: 20,
      hours: cert.hours,
      issueDate: formatDateEs(cert.issuedAt),
      validity: cert.expiresAt ? "Con fecha de vencimiento" : "Permanente",
      expirationDate: cert.expiresAt ? formatDateEs(cert.expiresAt) : "Sin vencimiento",
    },
    cryptography: {
      sha256: cert.sha256,
      timestampUtc: cert.issuedAt.toISOString().replace("T", " ").slice(0, 19) + " UTC",
      recordId: cert.id,
    },
    competencies: [],
    revocationDetails:
      status === "revocado"
        ? {
            revocationDate: formatDateEs(cert.revokedAt),
            auditorResponsible: issuer,
            reason: cert.revocationReason ?? "Sin motivo registrado",
            instruction:
              "Esta credencial ha sido revocada formalmente y carece de validez. No se autoriza su presentación ante entidades reguladoras.",
          }
        : undefined,
  };
});
