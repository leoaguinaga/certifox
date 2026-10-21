import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getPublicCertificateByCode } from "@/server/services/certificate.service";
import { checkRateLimit } from "@/server/rate-limit";
import { CertificateAuditCard } from "@/features/certificates/components/certificate-audit-card";
import { ShieldAlert } from "lucide-react";

// Regla RNF y Caché: La verificación siempre es dinámica y no debe cachearse obsoleta (no-store)
export const dynamic = "force-dynamic";

interface VerificarCodigoPageProps {
  params: Promise<{
    codigo: string;
  }>;
}

export async function generateMetadata({
  params,
}: VerificarCodigoPageProps): Promise<Metadata> {
  const { codigo } = await params;
  const clean = decodeURIComponent(codigo).trim().toUpperCase();
  const cert = await getPublicCertificateByCode(clean);

  // RNF-10: noindex en /verificar
  if (!cert) {
    return {
      title: `Credencial No Encontrada (${clean}) | Certifox`,
      description: `El código ${clean} no coincide con ninguna credencial registrada.`,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Certificado Oficial ${cert.code} - ${cert.student.name} | Certifox`,
    description: `Auditoría oficial para ${cert.student.name} en ${cert.course.title}. Estado: ${cert.statusLabel}. SHA-256 verificado.`,
    robots: { index: false, follow: false },
  };
}

export default async function VerificarCodigoPage({
  params,
}: VerificarCodigoPageProps) {
  const { codigo } = await params;
  const clean = decodeURIComponent(codigo).trim().toUpperCase();

  // RNF-04: Rate limiting de 30 consultas/min por IP
  const reqHeaders = await headers();
  const ip =
    reqHeaders.get("cf-connecting-ip") ||
    reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    reqHeaders.get("x-real-ip") ||
    "127.0.0.1";

  const rateCheck = checkRateLimit(ip, 30, 60_000);
  if (!rateCheck.allowed) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] bg-[#F8F9FF] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-4 shadow-sm">
          <div className="size-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="size-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              Límite de consultas
            </span>
            <h1 className="text-xl font-bold text-stone-900 mt-1">
              Demasiadas solicitudes
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 leading-relaxed">
              Has alcanzado el límite de 30 consultas por minuto para verificar credenciales. Por favor, espera 60 segundos antes de intentar nuevamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // RF-02 / RF-23: Lectura real desde Prisma con cálculo de vigencia
  const certificate = await getPublicCertificateByCode(clean);

  // AC-06: Un código inexistente muestra «no encontrado» con HTTP 404
  if (!certificate) {
    notFound();
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#F8F9FF]">
      <CertificateAuditCard certificate={certificate} />
    </div>
  );
}
