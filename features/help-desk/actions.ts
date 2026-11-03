"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/server/auth";
import { createTicket } from "@/server/services/ticket.service";
import { CreateTicketInput } from "./types";

export async function createTicketServerAction(input: CreateTicketInput) {
  try {
    const session = await getSession();
    const ticket = await createTicket(session, input);
    revalidatePath("/campus/mesa-de-ayuda");
    return { success: true, ticket };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message || "Error al registrar el ticket." };
  }
}
