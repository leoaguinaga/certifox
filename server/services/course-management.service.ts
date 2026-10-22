import "server-only";

import { prisma } from "@/server/db";
import {
  SessionContext,
  requireRole,
  assertCanManageCourse,
  AuthorizationError,
} from "@/server/policies";
import crypto from "crypto";

export interface CreateCourseInput {
  title: string;
  category: string;
  level: string;
  hours: number;
  summary?: string;
  coverUrl?: string;
  published?: boolean;
}

export interface UpdateCourseInput {
  title?: string;
  category?: string;
  level?: string;
  hours?: number;
  summary?: string;
  coverUrl?: string;
  published?: boolean;
}

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return base || "curso-tecnico";
}

/**
 * Crea un nuevo curso asignado al instructor autenticado (AC-18).
 */
export async function createCourse(
  session: SessionContext | null | undefined,
  input: CreateCourseInput
) {
  const user = requireRole(session, "INSTRUCTOR");

  if (!input.title || input.title.trim().length < 5) {
    throw new AuthorizationError("El título del curso debe tener al menos 5 caracteres", 400);
  }

  let slug = slugify(input.title);
  const existingWithSlug = await prisma.course.findUnique({ where: { slug } });
  if (existingWithSlug) {
    slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
  }

  const course = await prisma.course.create({
    data: {
      slug,
      title: input.title.trim(),
      category: input.category.trim() || "Operaciones Técnicas",
      level: input.level || "Intermedio",
      hours: Math.max(1, input.hours || 40),
      summary:
        input.summary?.trim() || "Programa de certificación técnica especializada.",
      coverUrl:
        input.coverUrl?.trim() ||
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
      published: Boolean(input.published),
      instructorId: user.id,
      modules: {
        create: [
          {
            title: "Módulo 1: Fundamentos y Procedimientos Operativos",
            order: 1,
            lessons: {
              create: [
                {
                  title: "1.1 Introducción y Normativa de Seguridad",
                  order: 1,
                  durationMin: 30,
                  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                },
              ],
            },
          },
        ],
      },
      assessments: {
        create: [
          {
            title: "Evaluación Práctica del Programa",
            description: "Presenta tu reporte técnico de campo para obtener la acreditación.",
            passingScore: 14,
          },
        ],
      },
    },
    include: {
      modules: { include: { lessons: true } },
      assessments: true,
    },
  });

  // Registro de Auditoría
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "CREATE_COURSE",
      targetType: "Course",
      targetId: course.id,
      metadata: {
        title: course.title,
        slug: course.slug,
        published: course.published,
      },
    },
  });

  return course;
}

/**
 * Publicar o despublicar curso (AC-18).
 * Si published pasa a true, el curso se vuelve visible inmediatamente en /cursos.
 */
export async function toggleCoursePublish(
  session: SessionContext | null | undefined,
  courseId: string
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true, published: true, title: true, slug: true },
  });

  if (!course) {
    throw new AuthorizationError("Curso no encontrado", 404);
  }

  assertCanManageCourse(session, course.instructorId);

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: { published: !course.published },
  });

  await prisma.auditLog.create({
    data: {
      actorId: course.instructorId,
      action: updated.published ? "PUBLISH_COURSE" : "UNPUBLISH_COURSE",
      targetType: "Course",
      targetId: updated.id,
      metadata: {
        published: updated.published,
        slug: updated.slug,
      },
    },
  });

  return updated;
}

/**
 * Agregar módulo a un curso del instructor.
 */
export async function addModuleToCourse(
  session: SessionContext | null | undefined,
  courseId: string,
  title: string
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { orderBy: { order: "desc" }, take: 1 } },
  });

  if (!course) {
    throw new AuthorizationError("Curso no encontrado", 404);
  }

  assertCanManageCourse(session, course.instructorId);

  const nextOrder = (course.modules[0]?.order || 0) + 1;

  return await prisma.module.create({
    data: {
      courseId,
      title: title.trim(),
      order: nextOrder,
    },
  });
}

/**
 * Agregar lección a un módulo.
 */
export async function addLessonToModule(
  session: SessionContext | null | undefined,
  moduleId: string,
  input: {
    title: string;
    durationMin: number;
    videoUrl?: string;
  }
) {
  const moduleRecord = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: { select: { instructorId: true } },
      lessons: { orderBy: { order: "desc" }, take: 1 },
    },
  });

  if (!moduleRecord) {
    throw new AuthorizationError("Módulo no encontrado", 404);
  }

  assertCanManageCourse(session, moduleRecord.course.instructorId);

  const nextOrder = (moduleRecord.lessons[0]?.order || 0) + 1;

  return await prisma.lesson.create({
    data: {
      moduleId,
      title: input.title.trim(),
      durationMin: Math.max(1, input.durationMin || 20),
      videoUrl: input.videoUrl?.trim() || null,
      order: nextOrder,
    },
  });
}

/**
 * Eliminar lección.
 */
export async function deleteLessonFromModule(
  session: SessionContext | null | undefined,
  lessonId: string
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: { select: { instructorId: true } },
        },
      },
    },
  });

  if (!lesson) {
    throw new AuthorizationError("Lección no encontrada", 404);
  }

  assertCanManageCourse(session, lesson.module.course.instructorId);

  return await prisma.lesson.delete({
    where: { id: lessonId },
  });
}
