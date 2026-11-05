import { z } from "zod";
import type { PaymentInstructions } from "@/features/catalog/types";

export type { PaymentInstructions };

/**
 * Datos de cobro manual configurables por organización (Organization.paymentSettings).
 * Reemplaza los números de Yape/BCP que antes estaban fijos en el código.
 */
export const paymentSettingsSchema = z.object({
  whatsapp: z
    .string()
    .regex(/^\d{8,15}$/, "WhatsApp en formato internacional sin + ni espacios (p. ej. 51987654321)")
    .optional(),
  yape: z.object({ number: z.string().min(6), holder: z.string().min(2) }).optional(),
  plin: z.object({ number: z.string().min(6), holder: z.string().min(2) }).optional(),
  bankAccounts: z
    .array(
      z.object({
        bank: z.string().min(2),
        accountNumber: z.string().min(6),
        cci: z.string().optional(),
        holder: z.string().min(2),
      })
    )
    .max(5)
    .default([]),
  instructions: z.string().max(1000).optional(),
});

export type PaymentSettings = z.infer<typeof paymentSettingsSchema>;

export function parsePaymentSettings(value: unknown): PaymentSettings {
  const parsed = paymentSettingsSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : { bankAccounts: [] };
}

export function buildPaymentInstructions(params: {
  organizationName: string;
  settings: PaymentSettings;
  priceCents: number;
  currency: string;
  courseTitle: string;
  studentName: string;
}): PaymentInstructions {
  const { settings } = params;
  const message = encodeURIComponent(
    `Hola, soy ${params.studentName}. Solicité mi matrícula en "${params.courseTitle}" (${params.organizationName}) y deseo coordinar el abono.`
  );
  return {
    organizationName: params.organizationName,
    amount: params.priceCents / 100,
    currency: params.currency,
    yape: settings.yape,
    plin: settings.plin,
    bankAccounts: settings.bankAccounts,
    instructions: settings.instructions,
    whatsappUrl: settings.whatsapp ? `https://wa.me/${settings.whatsapp}?text=${message}` : null,
  };
}
