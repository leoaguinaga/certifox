"use server";

import { z } from "zod";
import { getSession } from "@/server/auth";
import { revalidatePath } from "next/cache";
import {
  issueCertificate,
  revokeCertificate,
} from "@/server/services/certificate-management.service";

const RevokeSchema = z.object({
  code: z.string().min(3, "Código de certificado requerido"),
  reason: z.string().min(8, "El motivo debe tener al menos 8 caracteres"),
});

export async function issueCertificateAction(enrollmentId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Debes iniciar sesión como instructor" };
    }

    const result = await issueCertificate(session, enrollmentId);

    revalidatePath("/campus/certificados");
    revalidatePath("/campus/estudiantes");
    revalidatePath(`/verificar/${result.code}`);

    return { success: true, data: result };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al emitir certificado",
    };
  }
}

export async function revokeCertificateAction(input: z.infer<typeof RevokeSchema>) {
  try {
    const validated = RevokeSchema.parse(input);
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Debes iniciar sesión como instructor" };
    }

    const updated = await revokeCertificate(session, validated);

    revalidatePath("/campus/certificados");
    revalidatePath(`/verificar/${validated.code}`);

    return { success: true, data: updated };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al revocar certificado",
    };
  }
}
