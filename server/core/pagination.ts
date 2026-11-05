import { z } from "zod";

/** Paginación por cursor (estable y O(log n) con índices, a diferencia de OFFSET). */
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 25;

export const pageQuerySchema = z.object({
  cursor: z.string().min(1).max(64).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type PageQuery = z.input<typeof pageQuerySchema>;

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/** Argumentos Prisma: pide un elemento extra para saber si hay página siguiente. */
export function pageArgs(query: PageQuery = {}) {
  const { cursor, limit } = pageQuerySchema.parse(query);
  return {
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    limit,
  };
}

export function toPage<T extends { id: string }, R = T>(rows: T[], limit: number, map?: (row: T) => R): Page<R> {
  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;
  return {
    items: map ? slice.map(map) : (slice as unknown as R[]),
    nextCursor: hasMore ? slice[slice.length - 1].id : null,
  };
}
