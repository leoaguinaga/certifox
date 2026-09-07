import { Metadata } from "next";
import { CertificateNotFoundView } from "@/features/certificates/components/certificate-not-found-view";

interface NoEncontradoPageProps {
  searchParams: Promise<{
    codigo?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Credencial No Encontrada | Auditoría Registral Certifox",
  description:
    "El identificador consultado no coincide con ninguna credencial técnica o académica registrada en el ledger oficial.",
};

export default async function NoEncontradoPage({
  searchParams,
}: NoEncontradoPageProps) {
  const { codigo } = await searchParams;
  const cleanCode = codigo
    ? decodeURIComponent(codigo).trim().toUpperCase()
    : "CFX-9999-0000";

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#F8F9FF]">
      <CertificateNotFoundView code={cleanCode} />
    </div>
  );
}
