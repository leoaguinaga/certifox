import "server-only";
import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db, transaction, type Tx } from "@/server/core/db";
import { CacheTags, invalidate } from "@/server/core/cache";
import { invalid, notFound } from "@/server/core/errors";
import { pageArgs, toPage, type Page, type PageQuery } from "@/server/core/pagination";
import { assertCanManageCourse, assertStaff, manageableCoursesWhere } from "@/server/core/policies";
import type { AuthedContext } from "@/server/core/request-context";
import { recordAudit } from "@/server/modules/audit/audit";
import { claimReadyFile, fileUrl, scheduleFileDeletion } from "@/server/modules/files/files.service";
import type { InstructorCourseItem } from "@/features/courses-management/types";

export interface CourseInput {
  title: string;
  category: string;
  level: string;
  hours: number;
  summary?: string;
  /** Precio en unidades (p. ej. 680.00 PEN). */
  price?: number;
  currency?: string;
  coverFileId?: string | null;
  published?: boolean;
}

export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
  return base || "curso";
}

function invalidateCourse(slug: string) {
  invalidate(CacheTags.catalog, CacheTags.course(slug));
}

/** Recalcula los contadores desnormalizados del curso (misma transacción). */
async function refreshCourseCounters(tx: Tx, courseId: string) {
  const agg = await tx.lesson.aggregate({
    where: { module: { courseId } },
    _count: { _all: true },
    _sum: { durationMin: true },
  });
  await tx.course.update({
    where: { id: courseId },
    data: { lessonsCount: agg._count._all, totalDurationMin: agg._sum.durationMin ?? 0 },
  });
}

const managedCourseSelect = {
  id: true,
  slug: true,
  title: true,
  category: true,
  level: true,
  hours: true,
  summary: true,
  priceCents: true,
  currency: true,
  published: true,
  coverFile: { select: { key: true, visibility: true } },
  modules: {
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      order: true,
      lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true, durationMin: true, videoUrl: true } },
    },
  },
  _count: { select: { enrollments: { where: { status: { in: ["ACTIVE", "COMPLETED"] } } } } },
} satisfies Prisma.CourseSelect;

export async function listManagedCourses(ctx: AuthedContext, query: PageQuery = {}): Promise<Page<InstructorCourseItem>> {
  const where = manageableCoursesWhere(ctx);
  const { limit, ...args } = pageArgs({ limit: 20, ...query });
  const rows = await db.course.findMany({
    where,
    select: managedCourseSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...args,
  });
  return toPage(rows, limit, toManagedCourseItem);
}

type ManagedCourseRow = Prisma.CourseGetPayload<{ select: typeof managedCourseSelect }>;

function toManagedCourseItem(c: ManagedCourseRow): InstructorCourseItem {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    category: c.category,
    level: c.level,
    hours: c.hours,
    summary: c.summary,
    price: c.priceCents / 100,
    currency: c.currency,
    coverUrl: fileUrl(c.coverFile),
    published: c.published,
    modules: c.modules,
    activeStudentsCount: c._count.enrollments,
  };
}

export async function getManagedCourseItem(ctx: AuthedContext, courseId: string): Promise<InstructorCourseItem> {
  const row = await db.course.findFirst({ where: { id: courseId, ...manageableCoursesWhere(ctx) }, select: managedCourseSelect });
  if (!row) throw notFound("Curso no encontrado");
  return toManagedCourseItem(row);
}

export async function createCourse(ctx: AuthedContext, input: CourseInput) {
  const staff = assertStaff(ctx);
  const title = input.title.trim();
  if (title.length < 5) throw invalid("El título del curso debe tener al menos 5 caracteres");

  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = attempt === 0 ? slugify(title) : `${slugify(title)}-${randomBytes(3).toString("hex")}`;
    try {
      const course = await transaction(async (tx) => {
        const cover = input.coverFileId ? await claimReadyFile(tx, ctx, input.coverFileId, "COURSE_COVER") : null;
        const created = await tx.course.create({
          data: {
            slug,
            title,
            category: input.category.trim() || "General",
            level: input.level || "Intermedio",
            hours: Math.max(1, Math.round(input.hours || 1)),
            summary: input.summary?.trim() || "Programa de certificación técnica.",
            priceCents: Math.max(0, Math.round((input.price ?? 0) * 100)),
            currency: input.currency ?? "PEN",
            published: Boolean(input.published),
            organizationId: staff.organizationId,
            instructorId: staff.userId,
            coverFileId: cover?.id ?? null,
            modules: {
              create: [{ title: "Módulo 1", order: 1, lessons: { create: [{ title: "1.1 Introducción", order: 1, durationMin: 30 }] } }],
            },
            assessments: {
              create: [{ title: "Evaluación final del programa", description: "Presenta tu trabajo final para obtener la acreditación.", passingScore: 14 }],
            },
          },
          select: { id: true, slug: true, title: true, published: true },
        });
        await refreshCourseCounters(tx, created.id);
        await recordAudit(tx, {
          action: "CREATE_COURSE",
          targetType: "Course",
          targetId: created.id,
          actorId: staff.userId,
          organizationId: staff.organizationId,
          metadata: { title: created.title, slug: created.slug, published: created.published },
        });
        return created;
      });
      invalidateCourse(course.slug);
      return course;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") continue;
      throw err;
    }
  }
  throw new Error("No se pudo generar un slug único para el curso");
}

async function loadManagedCourse(ctx: AuthedContext, courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true, slug: true, published: true, organizationId: true, instructorId: true, coverFileId: true },
  });
  if (!course) throw notFound("Curso no encontrado");
  const staff = assertCanManageCourse(ctx, course);
  return { course, staff };
}

export async function updateCourse(ctx: AuthedContext, courseId: string, input: Partial<CourseInput>) {
  const { course, staff } = await loadManagedCourse(ctx, courseId);
  const updated = await transaction(async (tx) => {
    let coverFileId: string | null | undefined;
    if (input.coverFileId !== undefined) {
      coverFileId = input.coverFileId ? (await claimReadyFile(tx, ctx, input.coverFileId, "COURSE_COVER")).id : null;
      if (course.coverFileId && course.coverFileId !== coverFileId) await scheduleFileDeletion(tx, course.coverFileId);
    }
    const result = await tx.course.update({
      where: { id: course.id },
      data: {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.category !== undefined ? { category: input.category.trim() } : {}),
        ...(input.level !== undefined ? { level: input.level } : {}),
        ...(input.hours !== undefined ? { hours: Math.max(1, Math.round(input.hours)) } : {}),
        ...(input.summary !== undefined ? { summary: input.summary.trim() } : {}),
        ...(input.price !== undefined ? { priceCents: Math.max(0, Math.round(input.price * 100)) } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(coverFileId !== undefined ? { coverFileId } : {}),
      },
      select: { id: true, slug: true, title: true, published: true },
    });
    await recordAudit(tx, {
      action: "UPDATE_COURSE",
      targetType: "Course",
      targetId: course.id,
      actorId: staff.userId,
      organizationId: staff.organizationId,
      metadata: { fields: Object.keys(input) },
    });
    return result;
  });
  invalidateCourse(updated.slug);
  return updated;
}

export async function toggleCoursePublish(ctx: AuthedContext, courseId: string) {
  const { course, staff } = await loadManagedCourse(ctx, courseId);
  const updated = await transaction(async (tx) => {
    const result = await tx.course.update({
      where: { id: course.id },
      data: { published: !course.published },
      select: { id: true, slug: true, published: true },
    });
    await recordAudit(tx, {
      action: result.published ? "PUBLISH_COURSE" : "UNPUBLISH_COURSE",
      targetType: "Course",
      targetId: course.id,
      actorId: staff.userId,
      organizationId: staff.organizationId,
    });
    return result;
  });
  invalidateCourse(updated.slug);
  return updated;
}

export async function addModuleToCourse(ctx: AuthedContext, courseId: string, title: string) {
  const { course, staff } = await loadManagedCourse(ctx, courseId);
  if (title.trim().length < 3) throw invalid("El título del módulo debe tener al menos 3 caracteres");
  const created = await transaction(async (tx) => {
    const last = await tx.module.findFirst({ where: { courseId: course.id }, orderBy: { order: "desc" }, select: { order: true } });
    const mod = await tx.module.create({
      data: { courseId: course.id, title: title.trim(), order: (last?.order ?? 0) + 1 },
      select: { id: true, title: true, order: true },
    });
    await recordAudit(tx, {
      action: "ADD_MODULE",
      targetType: "Module",
      targetId: mod.id,
      actorId: staff.userId,
      organizationId: staff.organizationId,
      metadata: { courseId: course.id },
    });
    return mod;
  });
  invalidateCourse(course.slug);
  return created;
}

export async function addLessonToModule(
  ctx: AuthedContext,
  moduleId: string,
  input: { title: string; durationMin: number; videoUrl?: string; videoFileId?: string }
) {
  const mod = await db.module.findUnique({
    where: { id: moduleId },
    select: { id: true, course: { select: { id: true, slug: true, organizationId: true, instructorId: true } } },
  });
  if (!mod) throw notFound("Módulo no encontrado");
  const staff = assertCanManageCourse(ctx, mod.course);
  if (input.title.trim().length < 3) throw invalid("El título de la lección debe tener al menos 3 caracteres");

  const lesson = await transaction(async (tx) => {
    const video = input.videoFileId ? await claimReadyFile(tx, ctx, input.videoFileId, "LESSON_VIDEO") : null;
    const last = await tx.lesson.findFirst({ where: { moduleId: mod.id }, orderBy: { order: "desc" }, select: { order: true } });
    const created = await tx.lesson.create({
      data: {
        moduleId: mod.id,
        title: input.title.trim(),
        durationMin: Math.max(1, Math.round(input.durationMin || 1)),
        videoUrl: input.videoUrl?.trim() || null,
        videoFileId: video?.id ?? null,
        order: (last?.order ?? 0) + 1,
      },
      select: { id: true, title: true, order: true, durationMin: true, videoUrl: true },
    });
    await refreshCourseCounters(tx, mod.course.id);
    await recordAudit(tx, {
      action: "ADD_LESSON",
      targetType: "Lesson",
      targetId: created.id,
      actorId: staff.userId,
      organizationId: staff.organizationId,
      metadata: { courseId: mod.course.id, moduleId: mod.id },
    });
    return created;
  });
  invalidateCourse(mod.course.slug);
  return lesson;
}

export async function deleteLesson(ctx: AuthedContext, lessonId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      videoFileId: true,
      module: { select: { course: { select: { id: true, slug: true, organizationId: true, instructorId: true } } } },
    },
  });
  if (!lesson) throw notFound("Lección no encontrada");
  const course = lesson.module.course;
  const staff = assertCanManageCourse(ctx, course);

  await transaction(async (tx) => {
    await tx.lesson.delete({ where: { id: lesson.id } });
    await scheduleFileDeletion(tx, lesson.videoFileId);
    await refreshCourseCounters(tx, course.id);
    await recordAudit(tx, {
      action: "DELETE_LESSON",
      targetType: "Lesson",
      targetId: lesson.id,
      actorId: staff.userId,
      organizationId: staff.organizationId,
      metadata: { courseId: course.id },
    });
  });
  invalidateCourse(course.slug);
}
