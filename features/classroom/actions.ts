"use server";

import { z } from "zod";
import { getSession } from "@/server/auth";
import { revalidatePath } from "next/cache";
import { toggleLessonProgress } from "@/server/services/classroom.service";

const ToggleLessonSchema = z.object({
  courseSlug: z.string().min(1, "Slug de curso requerido"),
  lessonId: z.string().min(1, "ID de lección requerido"),
  completed: z.boolean(),
});

export async function toggleLessonProgressAction(input: {
  courseSlug: string;
  lessonId: string;
  completed: boolean;
}) {
  try {
    const validated = ToggleLessonSchema.parse(input);
    const session = await getSession();

    if (!session) {
      return {
        success: false,
        error: "Debes iniciar sesión para registrar tu avance",
      };
    }

    const result = await toggleLessonProgress(session, validated);

    // Revalidar rutas para sincronizar progreso (AC-13)
    revalidatePath("/campus");
    revalidatePath("/campus/cursos");
    revalidatePath(`/campus/cursos/${validated.courseSlug}`);

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Error al registrar el avance";
    return {
      success: false,
      error: errorMsg,
    };
  }
}
