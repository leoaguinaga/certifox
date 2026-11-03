"use server";

import { z } from "zod";
import { getSession } from "@/server/auth";
import { revalidatePath } from "next/cache";
import {
  submitAssignment,
  gradeAssignment,
} from "@/server/services/assignment.service";

const SubmitAssignmentSchema = z.object({
  enrollmentId: z.string().min(1, "ID de matrícula requerido"),
  assessmentId: z.string().min(1, "ID de evaluación requerido"),
  contentUrlOrText: z
    .string()
    .min(5, "El contenido o URL debe tener al menos 5 caracteres")
    .max(3000, "El contenido no debe exceder los 3000 caracteres"),
});

const GradeAssignmentSchema = z.object({
  submissionId: z.string().min(1, "ID de entrega requerido"),
  score: z.number().min(0, "Nota mínima es 0").max(20, "Nota máxima es 20"),
  feedback: z.string().max(2000, "El feedback no debe exceder 2000 caracteres").optional(),
});

export async function submitAssignmentAction(input: {
  enrollmentId: string;
  assessmentId: string;
  contentUrlOrText: string;
}) {
  try {
    const validated = SubmitAssignmentSchema.parse(input);
    const session = await getSession();

    if (!session) {
      return {
        success: false,
        error: "Debes iniciar sesión para entregar la tarea",
      };
    }

    const result = await submitAssignment(session, validated);

    revalidatePath("/campus/tareas");
    revalidatePath("/campus");
    revalidatePath("/campus/cursos");

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Error al enviar la entrega";
    return {
      success: false,
      error: errorMsg,
    };
  }
}

export async function gradeAssignmentAction(input: {
  submissionId: string;
  score: number;
  feedback?: string;
}) {
  try {
    const validated = GradeAssignmentSchema.parse(input);
    const session = await getSession();

    if (!session) {
      return {
        success: false,
        error: "Debes iniciar sesión como docente para calificar",
      };
    }

    const result = await gradeAssignment(session, validated);

    revalidatePath("/campus/tareas");
    revalidatePath("/campus/estudiantes");
    revalidatePath("/campus");

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Error al calificar la entrega";
    return {
      success: false,
      error: errorMsg,
    };
  }
}
