import { Metadata } from "next";
import { HelpDeskView } from "@/features/learning/components/help-desk-view";

export const metadata: Metadata = {
  title: "Mesa de Ayuda y Tutoría Técnica | Campus Certifox",
  description:
    "Centro de soporte técnico y asistencia académica directa con instructores y administradores de Certifox.",
};

export default function CampusMesaDeAyudaPage() {
  return <HelpDeskView />;
}
