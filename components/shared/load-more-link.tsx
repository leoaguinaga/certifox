import Link from "next/link";

/** Paginación por cursor en Server Components: enlace a la página siguiente. */
export function LoadMoreLink({
  basePath,
  nextCursor,
  params = {},
  label = "Ver más resultados",
}: {
  basePath: string;
  nextCursor: string | null;
  params?: Record<string, string | undefined>;
  label?: string;
}) {
  if (!nextCursor) return null;
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) search.set(k, v);
  search.set("cursor", nextCursor);
  return (
    <div className="flex justify-center py-6">
      <Link
        href={`${basePath}?${search.toString()}`}
        className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors"
      >
        {label}
      </Link>
    </div>
  );
}
