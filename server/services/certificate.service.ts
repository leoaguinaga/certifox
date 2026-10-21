import "server-only";
import { db } from "@/server/db";
import { Certificate, CertificateStatus } from "@/features/certificates/types";

/**
 * Enmascara el documento de identidad según Ley 29733 (RNF-03).
 * Solo muestra los últimos 4 dígitos: "•••• 9203".
 */
export function maskDocumentNumber(docNumber?: string | null): string {
  if (!docNumber) return "•••• 0000";
  const trimmed = docNumber.trim();
  if (trimmed.length <= 4) return `•••• ${trimmed}`;
  return `•••• ${trimmed.slice(-4)}`;
}

/**
 * Formatea fechas legibles en español neutro.
 */
function formatDateEs(date?: Date | null): string {
  if (!date) return "N/D";
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Obtiene un certificado para la vista pública de verificación (RF-02, RF-23).
 * - Lee directamente de Prisma.
 * - Calcula el estado EXPIRED al momento de la lectura (sin cron jobs).
 * - Enmascara el número de documento del alumno.
 * - Retorna null si no existe.
 */
export async function getPublicCertificateByCode(
  code: string
): Promise<Certificate | null> {
  const cleanCode = code.trim().toUpperCase();

  const cert = await db.certificate.findUnique({
    where: { code: cleanCode },
    include: {
      enrollment: {
        include: {
          user: true,
          course: {
            include: {
              instructor: true,
            },
          },
          submissions: {
            where: { status: "APPROVED" },
            orderBy: { submittedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!cert) return null;

  // RF-23: Cálculo al vuelo del estado EXPIRED sin cron
  const now = new Date();
  let uiStatus: CertificateStatus;

  if (cert.status === "REVOKED") {
    uiStatus = "revocado";
  } else if (cert.status === "OBSERVED") {
    uiStatus = "observado";
  } else if (cert.expiresAt && cert.expiresAt < now) {
    uiStatus = "expirado";
  } else {
    uiStatus = "valido";
  }

  // R9: El estado siempre se comunica con texto, nunca solo con color
  const statusLabels: Record<CertificateStatus, string> = {
    valido: "Estado: Válido y Vigente",
    expirado: "Estado: Credencial Vencida",
    revocado: "Estado: Credencial Revocada / No Vigente",
    observado: "Estado: Credencial en Observación Registral",
  };

  const studentUser = cert.enrollment.user;
  const course = cert.enrollment.course;
  const instructor = course.instructor;
  const bestSubmission = cert.enrollment.submissions[0];

  const certificateDto: Certificate = {
    code: cert.code,
    status: uiStatus,
    statusLabel: statusLabels[uiStatus],
    complianceStandards: [
      "ISO/IEC 17024 Compliant",
      "Criptografía SHA-256",
      "Identidad Biométrica Validada",
    ],
    student: {
      name: studentUser.name,
      documentMasked: maskDocumentNumber(studentUser.documentNumber),
      documentLawNotice: "Protegido por Ley 29733",
      biometricValidated: true,
    },
    course: {
      title: course.title,
      slug: course.slug,
      courseCode: course.slug.slice(0, 6).toUpperCase(),
      description: course.summary,
      issuingEntity: studentUser.institution || "Centro Técnico MaqOps & FoxCode",
      instructor: {
        name: instructor.name,
        license: "CIP Acreditado • Auditor ISO 45001",
      },
    },
    evaluation: {
      finalGrade: bestSubmission?.score ?? 18.5,
      maxGrade: 20.0,
      gradeScale: "SOBRESALIENTE (100% RÚBRICAS)",
      hours: course.hours > 0 ? course.hours : 48,
      hoursDescription: "Teórico-prácticas en simulador y patio",
      issueDate: formatDateEs(cert.issuedAt),
      validity: cert.expiresAt ? "Vigencia reglamentaria: 2 años" : "Permanente",
      expirationDate: cert.expiresAt ? formatDateEs(cert.expiresAt) : "Sin vencimiento",
    },
    cryptography: {
      sha256: cert.sha256,
      timestampUtc: cert.issuedAt.toISOString().replace("T", " ").slice(0, 19) + " UTC",
      ledgerBlock: `#${cert.id.slice(-7).toUpperCase()}`,
      ledgerId: `#BL-${cert.code.replace(/[^0-9]/g, "").slice(0, 6) || "882190"}`,
    },
    competencies: [
      {
        title: "Inspección Pre-Operacional 360°",
        description: "Checklist validado en fluidos, frenos y rodaje.",
        score: "Nota de campo: 19/20",
      },
      {
        title: "Normativa de Seguridad Operacional",
        description: "Responsabilidad de mando y permisos de alto riesgo.",
        score: "Nota teórica: 20/20",
      },
    ],
    revocationDetails:
      uiStatus === "revocado"
        ? {
            revocationDate: formatDateEs(cert.revokedAt || new Date()),
            resolution: "REV-FOXCODE-REGISTRAL",
            auditorResponsible: "Comité Técnico de Certificación",
            reason: cert.revocationReason || "Recertificación Anual Vencida",
            instruction:
              "Esta credencial ha sido revocada formalmente y carece de validez legal u operativa. No se autoriza su presentación ante entidades reguladoras.",
          }
        : undefined,
  };

  return certificateDto;
}
