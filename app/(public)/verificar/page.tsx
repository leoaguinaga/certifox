import { Metadata } from "next";
import { VerificationHeroSearch } from "@/features/certificates/components/verification-hero-search";
import { VerificationChannelsSection } from "@/features/certificates/components/verification-channels-section";
import { VerificationProcessSteps } from "@/features/certificates/components/verification-process-steps";
import { VerificationStandardsSection } from "@/features/certificates/components/verification-standards-section";
import { VerificationFaq } from "@/features/certificates/components/verification-faq";

export const metadata: Metadata = {
  title: "Verificación Oficial de Certificados y Credenciales | Certifox",
  description:
    "Auditoría pública registral en tiempo real con inmutabilidad criptográfica SHA-256 y cumplimiento ISO/IEC 17024.",
};

export default function VerificarPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero & Central Search */}
      <VerificationHeroSearch />

      {/* Audit Channels */}
      <VerificationChannelsSection />

      {/* 3-Step Zero Trust Validation Guide */}
      <VerificationProcessSteps />

      {/* Normative Standards & Legal Guarantees */}
      <VerificationStandardsSection />

      {/* Frequently Asked Questions */}
      <VerificationFaq />
    </div>
  );
}
