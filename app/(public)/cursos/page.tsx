import { Metadata } from "next";
import { getAllCourses, getCatalogCategories } from "@/data/cursos";
import { CatalogHeader } from "@/features/catalog/components/catalog-header";
import { CourseCatalogExplorer } from "@/features/catalog/components/course-catalog-explorer";

export const metadata: Metadata = {
  title: "Catálogo de Programas y Certificaciones — Certifox",
  description:
    "Explora cursos técnicos y vocacionales certificados con respaldo institucional y validación criptográfica.",
};

export default function CursosPage() {
  const courses = getAllCourses();
  const categoryCounts = getCatalogCategories();

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
