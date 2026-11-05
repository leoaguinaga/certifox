"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/core/action";
import { issueCertificate, revokeCertificate } from "@/server/modules/certification/certification.service";
import { scheduleOutboxProcessing } from "@/server/modules/jobs/jobs";

const issueSchema = z.string().min(1).max(64);
const revokeSchema = z.object({
  code: z.string().min(3, "Código de certificado requerido").max(64),
  reason: z.string().min(8, "El motivo debe tener al menos 8 caracteres").max(500),
});

export async function issueCertificateAction(enrollmentId: string) {
  return runAction(
    {
      name: "certificate.issue",
      schema: issueSchema,
      handler: async (ctx, id) => {
        const result = await issueCertificate(ctx, id);
        scheduleOutboxProcessing();
        revalidatePath("/campus/certificados");
        return result;
      },
    },
    enrollmentId
  );
}

export async function revokeCertificateAction(input: z.input<typeof revokeSchema>) {
  return runAction(
    {
      name: "certificate.revoke",
      schema: revokeSchema,
      handler: async (ctx, data) => {
        const result = await revokeCertificate(ctx, data);
        scheduleOutboxProcessing();
        revalidatePath("/campus/certificados");
        return result;
      },
    },
    input
  );
}
