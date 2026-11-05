import "server-only";
import { db } from "@/server/core/db";
import { invalid } from "@/server/core/errors";
import type { AuthedContext } from "@/server/core/request-context";
import type { CreateTicketInput, TicketDto } from "@/features/help-desk/types";

const MAX_TICKETS = 100;

function toDto(t: { id: string; subject: string; category: string; message: string; status: "OPEN" | "CLOSED"; createdAt: Date; updatedAt: Date }): TicketDto {
  return { ...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() };
}

const ticketSelect = { id: true, subject: true, category: true, message: true, status: true, createdAt: true, updatedAt: true } as const;

export async function listMyTickets(ctx: AuthedContext): Promise<TicketDto[]> {
  const rows = await db.ticket.findMany({
    where: { userId: ctx.user.id },
    orderBy: { createdAt: "desc" },
    take: MAX_TICKETS,
    select: ticketSelect,
  });
  return rows.map(toDto);
}

/** El ticket se asocia a la organización activa para que su staff pueda atenderlo. */
export async function createTicket(ctx: AuthedContext, input: CreateTicketInput): Promise<TicketDto> {
  if (input.subject.trim().length < 5) throw invalid("El asunto del ticket debe tener al menos 5 caracteres.");
  if (input.category.trim().length < 3) throw invalid("Debe seleccionar una categoría válida.");
  if (input.message.trim().length < 10) throw invalid("La descripción del ticket debe tener al menos 10 caracteres.");

  const created = await db.ticket.create({
    data: {
      userId: ctx.user.id,
      organizationId: ctx.organization?.id ?? null,
      subject: input.subject.trim().slice(0, 200),
      category: input.category.trim().slice(0, 60),
      message: input.message.trim().slice(0, 5000),
      status: "OPEN",
    },
    select: ticketSelect,
  });
  return toDto(created);
}
