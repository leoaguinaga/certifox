"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/core/action";
import { gradeAssignment, submitAssignment } from "@/server/modules/assessment/assessment.service";

const submitSchema = z.object({
  enrollmentId: z.string().min(1, "ID de matrícula requerido").max(64),
  assessmentId: z.string().min(1, "ID de evaluación requerido").max(64),
  contentUrlOrText: z
    .string()
    .min(5, "El contenido o URL debe tener al menos 5 caracteres")
    .max(3000, "El contenido no debe exceder los 3000 caracteres"),
  attachmentFileId: z.string().max(64).optional(),
});

const gradeSchema = z.object({
  submissionId: z.string().min(1, "ID de entrega requerido").max(64),
  score: z.number().int("La nota debe ser un número entero").min(0, "Nota mínima es 0").max(20, "Nota máxima es 20"),
  feedback: z.string().max(2000, "El feedback no debe exceder 2000 caracteres").optional(),
});

export async function submitAssignmentAction(input: z.input<typeof submitSchema>) {
  return runAction(
    {
      name: "assessment.submit",
      schema: submitSchema,
      handler: async (ctx, data) => {
        const result = await submitAssignment(ctx, data);
        revalidatePath("/campus/tareas");
        return result;
      },
    },
    input
  );
}

export async function gradeAssignmentAction(input: z.input<typeof gradeSchema>) {
  return runAction(
    {
      name: "assessment.grade",
      schema: gradeSchema,
      handler: async (ctx, data) => {
        const result = await gradeAssignment(ctx, data);
        revalidatePath("/campus/tareas");
        return result;
      },
    },
    input
  );
}
