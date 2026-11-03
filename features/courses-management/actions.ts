"use server";

import { z } from "zod";
import { getSession } from "@/server/auth";
import { revalidatePath } from "next/cache";
import {
  createCourse,
  toggleCoursePublish,
  addModuleToCourse,
  addLessonToModule,
  deleteLessonFromModule,
} from "@/server/services/course-management.service";

const CreateCourseSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  category: z.string().min(2, "Categoría requerida"),
  level: z.string().min(2, "Nivel requerido"),
  hours: z.number().min(1, "Las horas deben ser al menos 1"),
  summary: z.string().optional(),
  coverUrl: z.string().optional(),
  published: z.boolean().optional(),
});

export async function createCourseAction(input: z.infer<typeof CreateCourseSchema>) {
  try {
    const validated = CreateCourseSchema.parse(input);
    const session = await getSession();

    if (!session) {
      return { success: false, error: "Debes iniciar sesión como instructor" };
    }

    const course = await createCourse(session, validated);

    revalidatePath("/campus/cursos");
    revalidatePath("/cursos");

    return { success: true, data: course };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al crear curso",
    };
  }
}

export async function togglePublishCourseAction(courseId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Debes iniciar sesión como instructor" };
    }

    const updated = await toggleCoursePublish(session, courseId);

    revalidatePath("/campus/cursos");
    revalidatePath("/cursos");
    revalidatePath(`/campus/cursos/${updated.slug}`);
    revalidatePath(`/cursos/${updated.slug}`);

    return { success: true, data: updated };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al cambiar estado de publicación",
    };
  }
}

export async function addModuleAction(courseId: string, title: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "No autorizado" };
    }

    const moduleRecord = await addModuleToCourse(session, courseId, title);
    revalidatePath("/campus/cursos");

    return { success: true, data: moduleRecord };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al agregar módulo",
    };
  }
}

export async function addLessonAction(
  moduleId: string,
  input: { title: string; durationMin: number; videoUrl?: string }
) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "No autorizado" };
    }

    const lesson = await addLessonToModule(session, moduleId, input);
    revalidatePath("/campus/cursos");

    return { success: true, data: lesson };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al agregar lección",
    };
  }
}

export async function deleteLessonAction(lessonId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "No autorizado" };
    }

    await deleteLessonFromModule(session, lessonId);
    revalidatePath("/campus/cursos");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al eliminar lección",
    };
  }
}
