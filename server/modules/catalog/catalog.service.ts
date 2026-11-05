import "server-only";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { dbRead } from "@/server/core/db";
import { CacheTags } from "@/server/core/cache";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, type Page } from "@/server/core/pagination";
import { fileUrl } from "@/server/modules/files/files.service";
import type { Course } from "@/features/catalog/types";
import { DEFAULT_COURSE_FAQS, DEFAULT_PREREQUISITES } from "./static-content";

/**
 * Lecturas públicas del catálogo. Cacheadas (unstable_cache + tags) porque son las
 * páginas con más tráfico anónimo; se invalidan desde course-management.
 */

const courseCardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  category: true,
  level: true,
  hours: true,
  priceCents: true,
  currency: true,
  lessonsCount: true,
  createdAt: true,
  organization: { select: { id: true, slug: true, name: true } },
  coverFile: { select: { key: true, visibility: true } },
  instructor: {
    select: { name: true, institution: true, image: true, avatarFile: { select: { key: true, visibility: true } } },
  },
} satisfies Prisma.CourseSelect;

type CourseCardRow = Prisma.CourseGetPayload<{ select: typeof courseCardSelect }>;

const DEFAULT_COVER = "/images/courses/course-default.svg";
const DEFAULT_INSTRUCTOR_AVATAR = "/images/avatars/instructor.svg";

function toCourseDto(row: CourseCardRow): Course {
  const cover = fileUrl(row.coverFile) ?? DEFAULT_COVER;
  return {
    id: row.id,
    code: row.slug.slice(0, 6).toUpperCase(),
    slug: row.slug,
    title: row.title,
    shortDescription: row.summary,
    fullDescription: row.summary,
    category: row.category,
    level: row.level,
    hours: row.hours,
    lessonsCount: row.lessonsCount,
    price: row.priceCents / 100,
    currency: row.currency,
    accessNote: row.priceCents > 0 ? "Acceso previa confirmación de abono" : "Acceso gratuito",
    hasVerifiableCertificate: true,
    hasQrCertificate: true,
    imageUrl: cover,
    imageAlt: row.title,
    backdropUrl: cover,
    instructorName: row.instructor.name,
    organizationName: row.organization.name,
    instructor: {
      name: row.instructor.name,
      role: "Instructor",
      avatarUrl: fileUrl(row.instructor.avatarFile) ?? row.instructor.image ?? DEFAULT_INSTRUCTOR_AVATAR,
      bio: row.instructor.institution ?? row.organization.name,
    },
  };
}

export interface CatalogQuery {
  organizationId: string | null;
  category?: string;
  level?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

function isAll(value?: string) {
  return !value || value === "all" || value === "Todos";
}

async function queryCatalog(q: CatalogQuery): Promise<Page<Course>> {
  const limit = Math.min(q.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const where: Prisma.CourseWhereInput = {
    published: true,
    organization: { status: "ACTIVE" },
    ...(q.organizationId ? { organizationId: q.organizationId } : {}),
    ...(!isAll(q.category) ? { category: { equals: q.category, mode: "insensitive" } } : {}),
    ...(!isAll(q.level) ? { level: { equals: q.level, mode: "insensitive" } } : {}),
  };
  const search = q.search?.trim();
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  const rows = await dbRead.course.findMany({
    where,
    select: courseCardSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  return { items: page.map(toCourseDto), nextCursor: hasMore ? page[page.length - 1].id : null };
}

const cachedCatalog = unstable_cache(
  async (q: CatalogQuery) => queryCatalog(q),
  ["catalog-page"],
  { tags: [CacheTags.catalog], revalidate: 300 }
);

export async function getCatalogPage(q: CatalogQuery): Promise<Page<Course>> {
  // Las búsquedas libres tienen cardinalidad ilimitada: no se cachean.
  return q.search?.trim() ? queryCatalog(q) : cachedCatalog(q);
}

export const getCatalogCategoryCounts = unstable_cache(
  async (organizationId: string | null): Promise<Record<string, number>> => {
    const where: Prisma.CourseWhereInput = {
      published: true,
      organization: { status: "ACTIVE" },
      ...(organizationId ? { organizationId } : {}),
    };
    const groups = await dbRead.course.groupBy({ by: ["category"], where, _count: { _all: true } });
    const total = groups.reduce((acc, g) => acc + g._count._all, 0);
    const record: Record<string, number> = { all: total, Todos: total };
    for (const g of groups) record[g.category] = g._count._all;
    return record;
  },
  ["catalog-category-counts"],
  { tags: [CacheTags.catalog], revalidate: 300 }
);

async function queryCourseDetail(slugOrId: string, organizationId: string | null): Promise<Course | null> {
  const row = await dbRead.course.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
      published: true,
      organization: { status: "ACTIVE" },
      ...(organizationId ? { organizationId } : {}),
    },
    select: {
      ...courseCardSelect,
      modules: {
        orderBy: { order: "asc" },
        select: {
          title: true,
          lessons: { orderBy: { order: "asc" }, select: { title: true, durationMin: true } },
        },
      },
    },
  });
  if (!row) return null;

  return {
    ...toCourseDto(row),
    curriculum: row.modules.map((m, idx) => {
      const minutes = m.lessons.reduce((acc, l) => acc + l.durationMin, 0);
      return {
        moduleNumber: String(idx + 1).padStart(2, "0"),
        title: m.title,
        summary: `${m.lessons.length} lecciones`,
        hours: Math.max(1, Math.ceil(minutes / 60)),
        lessons: m.lessons.map((l) => ({
          title: l.title,
          duration: `${l.durationMin} min`,
          type: "video" as const,
          meta: "Lección en video",
        })),
      };
    }),
    competencies: [],
    prerequisites: DEFAULT_PREREQUISITES,
    faqs: DEFAULT_COURSE_FAQS,
  };
}

export function getCourseDetail(slugOrId: string, organizationId: string | null): Promise<Course | null> {
  return unstable_cache(() => queryCourseDetail(slugOrId, organizationId), ["course-detail", slugOrId, organizationId ?? "all"], {
    tags: [CacheTags.catalog, CacheTags.course(slugOrId)],
    revalidate: 300,
  })();
}
