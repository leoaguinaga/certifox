"use client";

import { useState, useMemo } from "react";
import {
  Search,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Course } from "../types";
import { CourseCatalogCard } from "./course-catalog-card";
import { CourseCatalogFilters } from "./course-catalog-filters";
import { cn } from "@/lib/utils";

interface CourseCatalogExplorerProps {
  initialCourses: Course[];
  categoryCounts: Record<string, number>;
}

export function CourseCatalogExplorer({
  initialCourses,
  categoryCounts,
}: CourseCatalogExplorerProps) {
  // Filter and view states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLevel, setSelectedLevel] = useState<string>("Todos");
  const [durationPreset, setDurationPreset] = useState<string>("all");
  const [onlyQr, setOnlyQr] = useState(true);
  const [isAsync, setIsAsync] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filter logic
  const filteredCourses = useMemo(() => {
    let result = [...initialCourses];

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.instructor.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory !== "Todos") {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Level
    if (selectedLevel !== "Todos") {
      result = result.filter((c) => c.level === selectedLevel);
    }

    // Duration presets
    if (durationPreset === "<20") {
      result = result.filter((c) => c.hours < 20);
    } else if (durationPreset === "20-50") {
      result = result.filter((c) => c.hours >= 20 && c.hours <= 50);
    } else if (durationPreset === ">50") {
      result = result.filter((c) => c.hours > 50);
    }

    // QR filter
    if (onlyQr) {
      result = result.filter((c) => c.hasQrCertificate);
    }

    // Sorting
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => a.priceUsd - b.priceUsd);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.priceUsd - a.priceUsd);
    }

    return result;
  }, [
    initialCourses,
    searchTerm,
    selectedCategory,
    selectedLevel,
    durationPreset,
    onlyQr,
    sortBy,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCourses.length / pageSize) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Todos");
    setSelectedLevel("Todos");
    setDurationPreset("all");
    setOnlyQr(true);
    setIsAsync(true);
    setIsLive(false);
    setSortBy("recent");
    setCurrentPage(1);
  };

  return (
    <section className="w-full py-10 bg-[#f8f9ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Operational Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between pb-6 mb-8 border-b border-stone-200">
          {/* Search Input */}
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por especialidad, instructor o código..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white text-stone-900 text-sm placeholder:text-stone-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#FD761A]/30 border border-stone-200 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Sorting & View Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-stone-500">Ordenar por:</span>
            <div className="relative inline-block">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white text-stone-800 text-xs font-semibold py-2 pl-3 pr-8 rounded-xl shadow-xs border border-stone-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FD761A]/20"
              >
                <option value="recent">Más recientes</option>
                <option value="rating">Mayor valoración</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
              </select>
            </div>

            {/* Grid / List Toggles */}
            <div className="hidden sm:flex items-center bg-[#EFF4FF] p-1 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Vista Cuadrícula"
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "grid"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-900"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="Vista Lista"
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "list"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-900"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Filters Sidebar + Courses List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Filter Sidebar */}
          <CourseCatalogFilters
            className="lg:col-span-3"
            totalCoursesCount={initialCourses.length}
            categoryCounts={categoryCounts}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            selectedLevel={selectedLevel}
            onSelectLevel={(lvl) => {
              setSelectedLevel(lvl);
              setCurrentPage(1);
            }}
            durationPreset={durationPreset}
            onSelectDurationPreset={(preset) => {
              setDurationPreset(preset);
              setCurrentPage(1);
            }}
            isAsync={isAsync}
            onToggleIsAsync={setIsAsync}
            isLive={isLive}
            onToggleIsLive={setIsLive}
            onlyQr={onlyQr}
            onToggleOnlyQr={setOnlyQr}
            onResetFilters={handleResetFilters}
          />

          {/* Right Main Grid */}
          <main className="lg:col-span-9 flex flex-col gap-8">
            {paginatedCourses.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FD761A] flex items-center justify-center mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-stone-900 mb-1">
                  No se encontraron cursos
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mb-4">
                  No hay programas que coincidan con los filtros seleccionados. Intenta restablecer los filtros para ver todo el catálogo.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-[#151B2A] text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                )}
              >
                {paginatedCourses.map((course) => (
                  <CourseCatalogCard
                    key={course.id}
                    course={course}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredCourses.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 bg-white p-4 rounded-2xl shadow-xs border border-stone-200">
                <div className="text-xs text-stone-500">
                  Mostrando{" "}
                  <span className="font-bold text-stone-900">
                    {paginatedCourses.length}
                  </span>{" "}
                  de{" "}
                  <span className="font-bold text-stone-900">
                    {filteredCourses.length}
                  </span>{" "}
                  programas certificados
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Anterior</span>
                  </button>

                  <div className="flex items-center gap-1 text-xs">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer",
                          currentPage === page
                            ? "bg-[#151B2A] text-white"
                            : "text-stone-700 hover:bg-stone-100"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-xs"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
