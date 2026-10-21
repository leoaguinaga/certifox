import { Metadata } from "next";
import { getCatalogCourses, getCatalogCategoryCounts } from "@/server/services/course.service";
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
  }>;
}

export default async function CursosPage({ searchParams }: CursosPageProps) {
  const { categoria, nivel, buscar } = await searchParams;

  const courses = await getCatalogCourses({
    category: categoria,
    level: nivel,
    search: buscar,
  });

  const categoryCounts = await getCatalogCategoryCounts();

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f8f9ff]">
      <CatalogHeader />
      <CourseCatalogExplorer
        initialCourses={courses}
        categoryCounts={categoryCounts}
      />
    </div>
  );
}
