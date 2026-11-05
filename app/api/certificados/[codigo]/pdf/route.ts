import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { clientIp } from "@/server/core/request-context";
import { consume, RATE_LIMITS } from "@/server/core/rate-limit";
import { handleRouteError } from "@/server/core/http";
import { isPlausibleCertificateCode, normalizeCertificateCode } from "@/server/modules/certification/certificate-code";
import {
  findCertificateForPdf,
  renderCertificatePdf,
  storedCertificatePdf,
} from "@/server/modules/certification/certificate-pdf";
import { signedFileUrl } from "@/server/modules/files/files.service";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

/**
 * PDF del certificado. Público por código (como la verificación) pero:
 *  - S2: limitado por IP y con el documento de identidad enmascarado
 *  - certificados revocados no se descargan (410)
 *  - si el PDF ya está en R2 (pre-generado al emitir) se redirige a una URL firmada
 *    de 2 minutos; si no, se renderiza bajo demanda.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  try {
    const ip = clientIp(await headers());
    const limit = await consume(`pdf:${ip}`, RATE_LIMITS.certificatePdf);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes" },
        { status: 429, headers: { ...NO_STORE, "Retry-After": String(limit.retryAfter ?? 60) } }
      );
    }

    const code = normalizeCertificateCode((await params).codigo);
    if (!isPlausibleCertificateCode(code)) return NextResponse.json({ error: "No encontrado" }, { status: 404, headers: NO_STORE });

    const cert = await findCertificateForPdf(code);
    if (!cert) return NextResponse.json({ error: "No encontrado" }, { status: 404, headers: NO_STORE });
    if (cert.status === "REVOKED") {
      return NextResponse.json({ error: "Certificado revocado" }, { status: 410, headers: NO_STORE });
    }

    const stored = await storedCertificatePdf(cert.pdfFileId);
    if (stored) {
      const url = await signedFileUrl(stored, { expiresInSeconds: 120, downloadName: `Certificado-${cert.code}.pdf` });
      return NextResponse.redirect(url, { status: 302, headers: NO_STORE });
    }

    const pdf = await renderCertificatePdf(cert);
    return new Response(Buffer.from(pdf), {
      headers: {
        ...NO_STORE,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Certificado-${cert.code}.pdf"`,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
