import { Metadata } from "next";
import {
  getCertificateByCode,
  getAllCertificateCodes,
} from "@/data/certificados";
import { CertificateAuditCard } from "@/features/certificates/components/certificate-audit-card";
import { CertificateNotFoundView } from "@/features/certificates/components/certificate-not-found-view";

interface VerificarCodigoPageProps {
  params: Promise<{
    codigo: string;
  }>;
}

export async function generateStaticParams() {
  const codes = getAllCertificateCodes();
  return codes.map((codigo) => ({
    codigo,
  }));
}

export async function generateMetadata({
  params,
}: VerificarCodigoPageProps): Promise<Metadata> {
  const { codigo } = await params;
  const clean = decodeURIComponent(codigo).trim().toUpperCase();
  const cert = getCertificateByCode(clean);

  if (!cert) {
    return {
      title: `Credencial No Encontrada (${clean}) | Certifox`,
      description: `El código ${clean} no coincide con ninguna credencial técnica o académica registrada en el ledger oficial de Certifox.`,
    };
  }

  return {
    title: `Certificado Oficial ${cert.code} - ${cert.student.name} | Certifox`,
    description: `Auditoría oficial de credencial para ${cert.student.name} en ${cert.course.title}. Estado: ${cert.statusLabel}. SHA-256 inmutable.`,
  };
}

export default async function VerificarCodigoPage({
  params,
}: VerificarCodigoPageProps) {
  const { codigo } = await params;
  const clean = decodeURIComponent(codigo).trim().toUpperCase();
  const certificate = getCertificateByCode(clean);

  if (!certificate) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] bg-[#F8F9FF]">
        <CertificateNotFoundView code={clean} />
      </div>
    );
  }

  // If certificate is found, provide alternate revoked demo certificate if needed
  const alternateRevoked =
    certificate.status === "valido"
      ? getCertificateByCode("CFX-2023-1102") ||
        getCertificateByCode("CFX-2024-0042")
      : null;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#F8F9FF]">
      <CertificateAuditCard
        certificate={certificate}
        alternateRevokedCertificate={alternateRevoked}
      />
    </div>
  );
}
