import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { getUserTickets } from "@/server/services/ticket.service";
import { HelpDeskView } from "@/features/help-desk/components/help-desk-view";

export const metadata: Metadata = {
  title: "Mesa de Ayuda y Tutoría Técnica | Campus Certifox",
  description:
    "Centro de soporte técnico y asistencia académica directa con instructores y administradores de Certifox.",
};

export default async function CampusMesaDeAyudaPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/ingresar");
  }

  const tickets = await getUserTickets(session);

  return <HelpDeskView initialTickets={tickets} />;
}
