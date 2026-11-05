import { Metadata } from "next";
import { getCatalogCategoryCounts, getCatalogPage } from "@/server/modules/catalog/catalog.service";
import { resolvePublicTenant } from "@/server/modules/organization/organization.service";
import { cursorParam } from "@/server/core/page-guards";
import { LoadMoreLink } from "@/components/shared/load-more-link";
import { CatalogHeader } from "@/features/catalog/components/catalog-header";
import { CourseCatalogExplorer } from "@/features/catalog/components/course-catalog-explorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo de Programas y Certificaciones — Certifox",
  description:
    "Explora cursos técnicos y vocacionales certificados con respaldo institucional y validación criptográfica.",
};

interface CursosPageProps {
  searchParams: Promise<{
    categoria?: string;
    nivel?: string;
    buscar?: string;
    cursor?: string;
  }>;
}

export default async function CursosPage({ searchParams }: CursosPageProps) {
  const { categoria, nivel, buscar, cursor } = await searchParams;
  const tenant = await resolvePublicTenant();

  const [page, categoryCounts] = await Promise.all([
    getCatalogPage({
      organizationId: tenant?.id ?? null,
      category: categoria,
      level: nivel,
      search: buscar?.slice(0, 100),
      cursor: cursorParam(cursor),
      limit: 24,
    }),
    getCatalogCategoryCounts(tenant?.id ?? null),
  ]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f8f9ff]">
      <CatalogHeader />
      <CourseCatalogExplorer
        initialCourses={page.items}
        categoryCounts={categoryCounts}
      />
      <LoadMoreLink
        basePath="/cursos"
        nextCursor={page.nextCursor}
        params={{ categoria, nivel, buscar }}
        label="Ver más programas"
      />
    </div>
  );
}
