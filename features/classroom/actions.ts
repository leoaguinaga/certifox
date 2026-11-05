"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/core/action";
import { toggleLessonProgress } from "@/server/modules/learning/classroom.service";

const toggleSchema = z.object({
  courseSlug: z.string().min(1, "Slug de curso requerido").max(120),
  lessonId: z.string().min(1, "ID de lección requerido").max(64),
  completed: z.boolean(),
});

export async function toggleLessonProgressAction(input: z.input<typeof toggleSchema>) {
  return runAction(
    {
      name: "learning.toggle_lesson",
      schema: toggleSchema,
      handler: async (ctx, data) => {
        const result = await toggleLessonProgress(ctx, data);
        revalidatePath(`/campus/cursos/${data.courseSlug}`);
        return result;
      },
    },
    input
  );
}
