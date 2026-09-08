import { Metadata } from "next";
import { AuthView } from "@/features/auth";

export const metadata: Metadata = {
  title: "Ingresar | Certifox - Plataforma de Certificación Técnica",
  description:
    "Accede a tu cuenta de estudiante en Certifox para gestionar tus cursos, evaluaciones y diplomas oficiales.",
};

export default function IngresarPage() {
  return <AuthView />;
}
