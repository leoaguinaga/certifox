import "server-only";

import { prisma } from "@/server/db";
import {
  SessionContext,
  requireRole,
  requireAuth,
  assertCanManageCourse,
  AuthorizationError,
} from "@/server/policies";
import crypto from "crypto";

export interface IssueCertificateResult {
  success: boolean;
  code: string;
  sha256: string;
  isAlreadyIssued?: boolean;
}

/**
 * Genera un código de alta entropía (≥ 96 bits).
 * Formato: CFX-{AÑO}-{6 CARACTERES CRIPTOGRÁFICOS}
 */
function generateCertificateCode(): string {
  const year = new Date().getFullYear();
  const randomChars = crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `CFX-${year}-${randomChars}`;
}

/**
 * Genera el hash criptográfico SHA-256 de auditoría del certificado.
 */
function generateCertificateSha256(data: {
  code: string;
  studentId: string;
  courseId: string;
  issuedAt: Date;
}): string {
  const payload = `${data.code}|${data.studentId}|${data.courseId}|${data.issuedAt.toISOString()}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Emite un certificado oficial para un alumno con matrícula COMPLETED (AC-16).
 * Es IDEMPOTENTE: si ya se emitió, devuelve el existente sin duplicar ni fallar.
 */
export async function issueCertificate(
  session: SessionContext | null | undefined,
  enrollmentId: string
): Promise<IssueCertificateResult> {
  const user = requireRole(session, "INSTRUCTOR");

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: true,
      user: true,
      certificate: true,
    },
  });

  if (!enrollment) {
    throw new AuthorizationError("Matrícula no encontrada", 404);
  }

  // Validar que el instructor sea el titular del curso
  assertCanManageCourse(session, enrollment.course.instructorId);

  // AC-16: Debe tener la matrícula completada
  if (enrollment.status !== "COMPLETED") {
    throw new AuthorizationError(
      "No se puede emitir el certificado: el alumno no ha completado el 100% de los requisitos del programa",
      400
    );
  }

  // Idempotencia: si ya tiene certificado válido
  if (enrollment.certificate) {
    return {
      success: true,
      code: enrollment.certificate.code,
      sha256: enrollment.certificate.sha256,
      isAlreadyIssued: true,
    };
  }

  // Generar código único y SHA-256
  let code = generateCertificateCode();
  let exists = await prisma.certificate.findUnique({ where: { code } });
  while (exists) {
    code = generateCertificateCode();
    exists = await prisma.certificate.findUnique({ where: { code } });
  }

  const issuedAt = new Date();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 2); // Vigencia de 2 años estándar

  const sha256 = generateCertificateSha256({
    code,
    studentId: enrollment.userId,
    courseId: enrollment.courseId,
    issuedAt,
  });

  const certificate = await prisma.certificate.create({
    data: {
      code,
      sha256,
      status: "VALID",
      issuedAt,
      expiresAt,
      enrollmentId: enrollment.id,
    },
  });

  // Registro de Auditoría
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "ISSUE_CERTIFICATE",
      targetType: "Certificate",
      targetId: certificate.code,
      metadata: {
        enrollmentId: enrollment.id,
        courseTitle: enrollment.course.title,
        studentName: enrollment.user.name,
        sha256,
        issuedAt: issuedAt.toISOString(),
      },
    },
  });

  return {
    success: true,
    code: certificate.code,
    sha256: certificate.sha256,
    isAlreadyIssued: false,
  };
}

/**
 * Revoca un certificado emitido con motivo obligatorio (AC-17).
 */
export async function revokeCertificate(
  session: SessionContext | null | undefined,
  input: {
    code: string;
    reason: string;
  }
) {
  const user = requireRole(session, "INSTRUCTOR");

  if (!input.reason || input.reason.trim().length < 8) {
    throw new AuthorizationError(
      "Debes indicar un motivo de revocación oficial de al menos 8 caracteres",
      400
    );
  }

  const certificate = await prisma.certificate.findUnique({
    where: { code: input.code.trim().toUpperCase() },
    include: {
      enrollment: {
        include: {
          course: true,
          user: true,
        },
      },
    },
  });

  if (!certificate) {
    throw new AuthorizationError("Certificado no encontrado", 404);
  }

  assertCanManageCourse(session, certificate.enrollment.course.instructorId);

  const revokedAt = new Date();
  const updated = await prisma.certificate.update({
    where: { id: certificate.id },
    data: {
      status: "REVOKED",
      revokedAt,
      revocationReason: input.reason.trim(),
    },
  });

  // Registro de Auditoría
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "REVOKE_CERTIFICATE",
      targetType: "Certificate",
      targetId: certificate.code,
      metadata: {
        reason: input.reason.trim(),
        revokedAt: revokedAt.toISOString(),
        studentName: certificate.enrollment.user.name,
      },
    },
  });

  return updated;
}

/**
 * Colección de certificados de un estudiante autenticado.
 */
export async function getStudentCertificatesCollection(
  session: SessionContext | null | undefined
) {
  const user = requireAuth(session);

  return await prisma.certificate.findMany({
    where: {
      enrollment: {
        userId: user.id,
      },
    },
    include: {
      enrollment: {
        include: {
          course: {
            include: {
              instructor: {
                select: { name: true, institution: true },
              },
            },
          },
        },
      },
    },
    orderBy: { issuedAt: "desc" },
  });
}

/**
 * Panel de emisión para el instructor: alumnos completados y certificados emitidos.
 */
export async function getInstructorCertificatesDashboard(
  session: SessionContext | null | undefined
) {
  const user = requireRole(session, "INSTRUCTOR");

  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: {
        instructorId: user.id,
      },
      status: "COMPLETED",
    },
    include: {
      course: true,
      user: true,
      certificate: true,
    },
    orderBy: { completedAt: "desc" },
  });

  return enrollments;
}
