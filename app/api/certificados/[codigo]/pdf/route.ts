import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import QRCode from "qrcode";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { CertificatePdfDocument } from "@/server/pdf/certificate-pdf-document";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    codigo: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { codigo } = await params;

  if (!codigo) {
    notFound();
  }

  const certificate = await prisma.certificate.findUnique({
    where: { code: codigo.toUpperCase() },
    include: {
      enrollment: {
        include: {
          user: true,
          course: {
            include: {
              instructor: true,
            },
          },
        },
      },
    },
  });

  if (!certificate) {
    notFound();
  }

  const student = certificate.enrollment.user;
  const course = certificate.enrollment.course;
  const instructor = course.instructor;

  // AC-07: El QR del PDF abre la verificación del mismo código
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    "http://localhost:3000";

  const verificationUrl = `${origin}/verificar/${certificate.code}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    margin: 1,
    width: 256,
    color: {
      dark: "#0D1C2F",
      light: "#FFFFFF",
    },
  });

  const pdfBuffer = await renderToBuffer(
    React.createElement(CertificatePdfDocument, {
      code: certificate.code,
      studentName: student.name,
      documentType: student.documentType || "DNI",
      documentNumber: student.documentNumber || "No registrado",
      courseTitle: course.title,
      hours: course.hours,
      instructorName: instructor.name,
      institution: instructor.institution || "Centro de Capacitación Técnica",
      issuedAt: new Date(certificate.issuedAt).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      sha256: certificate.sha256,
      qrDataUrl,
    }) as Parameters<typeof renderToBuffer>[0]
  );

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Certificado-${certificate.code}.pdf"`,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
