import "server-only";
import { prisma } from "@/server/db";
import { SessionContext, requireAuth, AuthorizationError } from "@/server/policies";
import { TicketDto, CreateTicketInput } from "@/features/help-desk/types";

export async function getUserTickets(
  session: SessionContext | null | undefined
): Promise<TicketDto[]> {
  const user = requireAuth(session);

  const tickets = await prisma.ticket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    category: t.category,
    message: t.message,
    status: t.status as "OPEN" | "CLOSED",
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));
}

export async function createTicket(
  session: SessionContext | null | undefined,
  input: CreateTicketInput
): Promise<TicketDto> {
  const user = requireAuth(session);

  if (!input.subject || input.subject.trim().length < 5) {
    throw new AuthorizationError("El asunto del ticket debe tener al menos 5 caracteres.", 400);
  }

  if (!input.category || input.category.trim().length < 3) {
    throw new AuthorizationError("Debe seleccionar una categoría válida.", 400);
  }

  if (!input.message || input.message.trim().length < 10) {
    throw new AuthorizationError("La descripción del ticket debe tener al menos 10 caracteres.", 400);
  }

  const created = await prisma.ticket.create({
    data: {
      userId: user.id,
      subject: input.subject.trim(),
      category: input.category.trim(),
      message: input.message.trim(),
      status: "OPEN",
    },
  });

  return {
    id: created.id,
    subject: created.subject,
    category: created.category,
    message: created.message,
    status: created.status as "OPEN" | "CLOSED",
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}
