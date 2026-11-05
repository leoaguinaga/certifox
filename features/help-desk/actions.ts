"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/core/action";
import { RATE_LIMITS } from "@/server/core/rate-limit";
import { createTicket } from "@/server/modules/support/ticket.service";

const ticketSchema = z.object({
  subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres").max(200),
  category: z.string().min(3, "Debe seleccionar una categoría válida").max(60),
  message: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(5000),
});

export async function createTicketServerAction(input: z.input<typeof ticketSchema>) {
  return runAction(
    {
      name: "support.create_ticket",
      schema: ticketSchema,
      rateLimit: { rule: RATE_LIMITS.ticketCreate, name: "ticket-create" },
      handler: async (ctx, data) => {
        const ticket = await createTicket(ctx, data);
        revalidatePath("/campus/mesa-de-ayuda");
        return ticket;
      },
    },
    input
  );
}
