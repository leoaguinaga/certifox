import { Metadata } from "next";
import { campusContext } from "@/server/core/page-guards";
import { listMyTickets } from "@/server/modules/support/ticket.service";
import { HelpDeskView } from "@/features/help-desk/components/help-desk-view";

export const metadata: Metadata = {
  title: "Mesa de Ayuda y Tutoría Técnica | Campus Certifox",
  description: "Centro de soporte técnico y asistencia académica directa con instructores y administradores de Certifox.",
};

export default async function CampusMesaDeAyudaPage() {
  const ctx = await campusContext("/campus/mesa-de-ayuda");
  const tickets = await listMyTickets(ctx);
  return <HelpDeskView initialTickets={tickets} />;
}
