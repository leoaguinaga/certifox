import "server-only";
import { revalidateTag } from "next/cache";

/**
 * Etiquetas de caché de datos (lecturas públicas cacheadas con unstable_cache).
 * Se invalidan desde los casos de uso que modifican esos datos.
 */
export const CacheTags = {
  catalog: "catalog",
  course: (slug: string) => `course:${slug}`,
  organization: (slugOrDomain: string) => `org:${slugOrDomain}`,
  organizations: "organizations",
} as const;

/**
 * Invalida etiquetas con semántica stale-while-revalidate ("max").
 * Seguro de llamar fuera de un request (tests/jobs): en ese caso no hace nada.
 */
export function invalidate(...tags: string[]): void {
  for (const tag of tags) {
    try {
      revalidateTag(tag, "max");
    } catch {
      // Fuera del contexto de Next (scripts, tests): no hay caché que invalidar.
    }
  }
}
