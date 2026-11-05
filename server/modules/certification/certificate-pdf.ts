import "server-only";
import React from "react";
import QRCode from "qrcode";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/server/core/db";
import { appUrl } from "@/server/core/env";
import { logger } from "@/server/core/logger";
import { bucketFor, isStorageConfigured, putObject } from "@/server/core/storage";
import { maskDocumentNumber } from "@/lib/masking";
import { CertificatePdfDocument } from "./pdf/certificate-pdf-document";

const certificateForPdf = (where: { id: string } | { code: string }) =>
  db.certificate.findUnique({
    where,
    select: {
      id: true,
      code: true,
      sha256: true,
      status: true,
      issuedAt: true,
      holderName: true,
      courseTitle: true,
      hours: true,
      organizationId: true,
      pdfFileId: true,
      organization: { select: { name: true, legalName: true } },
      enrollment: {
        select: {
          user: { select: { documentType: true, documentNumber: true } },
          course: { select: { instructor: { select: { name: true } } } },
        },
      },
    },
  });

type CertificateForPdf = NonNullable<Awaited<ReturnType<typeof certificateForPdf>>>;

/**
 * Renderiza el PDF. S2: el documento de identidad va ENMASCARADO; el PDF es accesible
 * por cualquiera que tenga el código, igual que la verificación pública.
 */
export async function renderCertificatePdf(cert: CertificateForPdf): Promise<Uint8Array> {
  const verificationUrl = `${appUrl()}/verificar/${cert.code}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    margin: 1,
    width: 256,
    color: { dark: "#0D1C2F", light: "#FFFFFF" },
  });
  const buffer = await renderToBuffer(
    React.createElement(CertificatePdfDocument, {
      code: cert.code,
      studentName: cert.holderName,
      documentType: cert.enrollment.user.documentType || "Documento",
      documentNumber: maskDocumentNumber(cert.enrollment.user.documentNumber),
      courseTitle: cert.courseTitle,
      hours: cert.hours,
      instructorName: cert.enrollment.course.instructor.name,
      institution: cert.organization.legalName ?? cert.organization.name,
      issuedAt: cert.issuedAt.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }),
      sha256: cert.sha256,
      qrDataUrl,
    }) as Parameters<typeof renderToBuffer>[0]
  );
  return new Uint8Array(buffer);
}

export function findCertificateForPdf(code: string) {
  return certificateForPdf({ code });
}

/** PDF pre-generado (READY) en R2, si existe. */
export async function storedCertificatePdf(pdfFileId: string | null) {
  if (!pdfFileId || !isStorageConfigured()) return null;
  const file = await db.file.findUnique({ where: { id: pdfFileId }, select: { bucket: true, key: true, status: true } });
  return file?.status === "READY" ? file : null;
}

/**
 * Job (outbox `certificate.issued`): genera el PDF una sola vez y lo guarda en el
 * bucket PRIVADO de R2. Idempotente: si ya existe, no hace nada.
 */
export async function generateAndStoreCertificatePdf(certificateId: string): Promise<void> {
  const cert = await certificateForPdf({ id: certificateId });
  if (!cert) return;
  if (cert.pdfFileId) return;
  if (!isStorageConfigured()) {
    logger.info("certificate_pdf.skip_storage", { certificateId, reason: "R2 no configurado; se renderiza bajo demanda" });
    return;
  }

  const body = await renderCertificatePdf(cert);
  const bucket = bucketFor("PRIVATE");
  const key = `org/${cert.organizationId}/certificates/${cert.code}.pdf`;
  await putObject({ bucket, key, body, contentType: "application/pdf" });

  await db.$transaction(async (tx) => {
    const file = await tx.file.upsert({
      where: { key },
      create: {
        kind: "CERTIFICATE_PDF",
        visibility: "PRIVATE",
        status: "READY",
        bucket,
        key,
        contentType: "application/pdf",
        sizeBytes: body.byteLength,
        organizationId: cert.organizationId,
        originalName: `Certificado-${cert.code}.pdf`,
      },
      update: { status: "READY", sizeBytes: body.byteLength },
    });
    await tx.certificate.update({ where: { id: cert.id }, data: { pdfFileId: file.id } });
  });
}
