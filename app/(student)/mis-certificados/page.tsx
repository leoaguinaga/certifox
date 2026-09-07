import { Metadata } from "next";
import { CertificatesCollectionView } from "@/features/learning/components/certificates-collection-view";

export const metadata: Metadata = {
  title: "Mis Certificados y Credenciales Oficiales | Certifox",
  description:
    "Colección oficial de certificados académicos y acreditaciones técnicas con firma digital SHA-256 e inmutabilidad registral.",
};

export default function MisCertificadosPage() {
  return <CertificatesCollectionView />;
}
