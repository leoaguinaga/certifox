"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/core/action";
import { RATE_LIMITS } from "@/server/core/rate-limit";
import { confirmEnrollmentPayment, requestEnrollment } from "@/server/modules/enrollment/enrollment.service";
import { scheduleOutboxProcessing } from "@/server/modules/jobs/jobs";

const requestEnrollmentSchema = z.object({
  courseId: z.string().min(1, "El ID del curso es obligatorio").max(64),
});

/** S3: la matrícula siempre es del usuario autenticado. */
export async function requestEnrollmentAction(input: z.input<typeof requestEnrollmentSchema>) {
  return runAction(
    {
      name: "enrollment.request",
      schema: requestEnrollmentSchema,
      rateLimit: { rule: RATE_LIMITS.enrollmentRequest, name: "enrollment-request" },
      handler: async (ctx, data) => {
        const result = await requestEnrollment(ctx, data);
        scheduleOutboxProcessing();
        revalidatePath("/campus");
        return result;
      },
    },
    input
  );
}

const confirmPaymentSchema = z.object({
  enrollmentId: z.string().min(1, "ID de matrícula requerido").max(64),
  note: z.string().max(500).optional(),
});

export async function confirmPaymentAction(input: z.input<typeof confirmPaymentSchema>) {
  return runAction(
    {
      name: "enrollment.confirm_payment",
      schema: confirmPaymentSchema,
      handler: async (ctx, data) => {
        const result = await confirmEnrollmentPayment(ctx, data);
        scheduleOutboxProcessing();
        revalidatePath("/campus/estudiantes");
        return { id: result.id, status: result.status };
      },
    },
    input
  );
}
