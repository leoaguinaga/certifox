"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/core/action";
import {
  addLessonToModule,
  addModuleToCourse,
  createCourse,
  deleteLesson,
  getManagedCourseItem,
  toggleCoursePublish,
  updateCourse,
} from "@/server/modules/course-management/course-management.service";

const id = z.string().min(1).max(64);

const courseSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres").max(160),
  category: z.string().min(2, "Categoría requerida").max(60),
  level: z.string().min(2, "Nivel requerido").max(30),
  hours: z.number().int().min(1, "Las horas deben ser al menos 1").max(2000),
  summary: z.string().max(2000).optional(),
  price: z.number().min(0).max(100_000).optional(),
  currency: z.enum(["PEN", "USD"]).optional(),
  coverFileId: z.string().max(64).optional(),
  published: z.boolean().optional(),
});

export async function createCourseAction(input: z.input<typeof courseSchema>) {
  return runAction(
    {
      name: "course.create",
      schema: courseSchema,
      handler: async (ctx, data) => {
        const created = await createCourse(ctx, data);
        revalidatePath("/campus/cursos");
        return getManagedCourseItem(ctx, created.id);
      },
    },
    input
  );
}

export async function updateCourseAction(courseId: string, input: z.input<typeof courseSchema>) {
  return runAction(
    {
      name: "course.update",
      schema: z.object({ courseId: id, data: courseSchema.partial().extend({ coverFileId: z.string().max(64).nullable().optional() }) }),
      handler: async (ctx, { courseId, data }) => {
        await updateCourse(ctx, courseId, data);
        revalidatePath("/campus/cursos");
        return getManagedCourseItem(ctx, courseId);
      },
    },
    { courseId, data: input }
  );
}

export async function togglePublishCourseAction(courseId: string) {
  return runAction(
    {
      name: "course.toggle_publish",
      schema: id,
      handler: async (ctx, cid) => {
        const updated = await toggleCoursePublish(ctx, cid);
        revalidatePath("/campus/cursos");
        return updated;
      },
    },
    courseId
  );
}

export async function addModuleAction(courseId: string, title: string) {
  return runAction(
    {
      name: "course.add_module",
      schema: z.object({ courseId: id, title: z.string().min(3, "Título muy corto").max(160) }),
      handler: async (ctx, data) => {
        const mod = await addModuleToCourse(ctx, data.courseId, data.title);
        revalidatePath("/campus/cursos");
        return mod;
      },
    },
    { courseId, title }
  );
}

const lessonSchema = z.object({
  title: z.string().min(3, "Título muy corto").max(160),
  durationMin: z.number().int().min(1).max(600),
  videoUrl: z.string().url("URL de video inválida").max(500).optional().or(z.literal("")),
  videoFileId: z.string().max(64).optional(),
});

export async function addLessonAction(moduleId: string, input: z.input<typeof lessonSchema>) {
  return runAction(
    {
      name: "course.add_lesson",
      schema: z.object({ moduleId: id, lesson: lessonSchema }),
      handler: async (ctx, data) => {
        const lesson = await addLessonToModule(ctx, data.moduleId, data.lesson);
        revalidatePath("/campus/cursos");
        return lesson;
      },
    },
    { moduleId, lesson: input }
  );
}

export async function deleteLessonAction(lessonId: string) {
  return runAction(
    {
      name: "course.delete_lesson",
      schema: id,
      handler: async (ctx, lid) => {
        await deleteLesson(ctx, lid);
        revalidatePath("/campus/cursos");
        return { deleted: true };
      },
    },
    lessonId
  );
}
