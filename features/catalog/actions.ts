"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/server/auth";
import {
  requestEnrollment,
  confirmEnrollmentPayment,
} from "@/server/services/enrollment.service";

const requestEnrollmentSchema = z.object({
  courseId: z.string().min(1, "El ID del curso es obligatorio"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico no válido"),
  phone: z.string().optional(),
});

export async function requestEnrollmentAction(formData: {
  courseId: string;
  name: string;
  email: string;
  phone?: string;
}) {
  const parsed = requestEnrollmentSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos no válidos",
    };
  }

  try {
    const session = await getSession();

    const result = await requestEnrollment({
      courseId: parsed.data.courseId,
      studentName: parsed.data.name,
      studentEmail: parsed.data.email,
      studentPhone: parsed.data.phone,
      currentUserId: session?.user?.id,
    });

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al procesar la solicitud de matrícula";
    return {
      success: false,
      error: message,
    };
  }
}

const confirmPaymentSchema = z.object({
  enrollmentId: z.string().min(1, "ID de matrícula requerido"),
  note: z.string().optional(),
});

export async function confirmPaymentAction(input: {
  enrollmentId: string;
  note?: string;
}) {
  const parsed = confirmPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos no válidos",
    };
  }

  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: "Debes iniciar sesión para confirmar pagos",
      };
    }

    const updated = await confirmEnrollmentPayment(
      session,
      parsed.data.enrollmentId,
      parsed.data.note
    );

    revalidatePath("/campus/estudiantes");
    revalidatePath("/campus");

    return {
      success: true,
      enrollment: {
        id: updated.id,
        status: updated.status,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "No autorizado o error al confirmar pago";
    return {
      success: false,
      error: message,
    };
  }
}
