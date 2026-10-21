import { CertificateNotFoundView } from "@/features/certificates/components/certificate-not-found-view";

export default function CertificateNotFound() {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#F8F9FF]">
      <CertificateNotFoundView code="CÓDIGO NO REGISTRADO" />
    </div>
  );
}
