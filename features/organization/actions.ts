"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/core/action";
import {
  setActiveOrganization,
  updatePaymentSettings,
  upsertMember,
} from "@/server/modules/organization/organization.service";
import { paymentSettingsSchema } from "@/server/modules/organization/payment-settings";

export async function switchOrganizationAction(organizationId: string) {
  return runAction(
    {
      name: "organization.switch",
      schema: z.string().min(1).max(64),
      handler: async (ctx, orgId) => {
        await setActiveOrganization(ctx, orgId);
        revalidatePath("/campus", "layout");
        return { organizationId: orgId };
      },
    },
    organizationId
  );
}

export async function updatePaymentSettingsAction(input: z.input<typeof paymentSettingsSchema>) {
  return runAction(
    {
      name: "organization.update_payment_settings",
      schema: paymentSettingsSchema,
      handler: async (ctx, data) => updatePaymentSettings(ctx, data),
    },
    input
  );
}

export async function upsertMemberAction(input: { email: string; role: "OWNER" | "ADMIN" | "INSTRUCTOR" | "STUDENT" }) {
  return runAction(
    {
      name: "organization.upsert_member",
      schema: z.object({
        email: z.string().email("Correo inválido"),
        role: z.enum(["OWNER", "ADMIN", "INSTRUCTOR", "STUDENT"]),
      }),
      handler: async (ctx, data) => {
        const m = await upsertMember(ctx, data);
        return { id: m.id, role: m.role };
      },
    },
    input
  );
}
