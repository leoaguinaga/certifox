"use client";

import { Filter, Check, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CourseCatalogFiltersProps {
  totalCoursesCount: number;
  categoryCounts: Record<string, number>;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedLevel: string;
  onSelectLevel: (level: string) => void;
  durationPreset: string;
  onSelectDurationPreset: (preset: string) => void;
  isAsync: boolean;
  onToggleIsAsync: (val: boolean) => void;
  isLive: boolean;
  onToggleIsLive: (val: boolean) => void;
  onlyQr: boolean;
  onToggleOnlyQr: (val: boolean) => void;
  onResetFilters: () => void;
  className?: string;
}

const LEVELS = ["Principiante", "Intermedio", "Avanzado"] as const;

export function CourseCatalogFilters({
  totalCoursesCount,
  categoryCounts,
  selectedCategory,
  onSelectCategory,
  selectedLevel,
  onSelectLevel,
  durationPreset,
  onSelectDurationPreset,
  isAsync,
  onToggleIsAsync,
  isLive,
  onToggleIsLive,
  onlyQr,
  onToggleOnlyQr,
  onResetFilters,
  className,
}: CourseCatalogFiltersProps) {
  return (
    <aside
      className={cn(
        "bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 flex flex-col gap-6",
        className
      )}
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-[#FD761A]" />
          <span>Filtros</span>
        </h3>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs font-semibold text-[#FD761A] hover:underline cursor-pointer"
        >
          Limpiar
        </button>
      </div>

      {/* 1. Category Pills */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
            Especialidad / Área
          </span>
          <span className="text-[11px] text-stone-400 font-medium">
            {totalCoursesCount} disponibles
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {Object.entries(categoryCounts).map(([cat, count]) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
                  isActive
                    ? "bg-[#FD761A] text-white shadow-xs"
                    : "bg-[#EFF4FF] text-stone-700 hover:bg-stone-200"
                )}
              >
                <span>{cat}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-white text-stone-500"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Level Segmented Control */}
      <div className="flex flex-col gap-2 pt-2 border-t border-stone-100">
        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
          Nivel de Formación
        </span>
        <div className="grid grid-cols-3 bg-[#EFF4FF] p-1 rounded-xl gap-1 border border-stone-200">
          {LEVELS.map((lvl) => {
            const isSelected = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onSelectLevel(isSelected ? "Todos" : lvl)}
                className={cn(
                  "py-1.5 px-1 rounded-lg text-center text-[11px] font-semibold transition-colors cursor-pointer",
                  isSelected
                    ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                    : "text-stone-600 hover:text-stone-900"
                )}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Duration Preset Buttons */}
      <div className="flex flex-col gap-2 pt-2 border-t border-stone-100">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
            Duración Lectiva
          </span>
          <span className="text-xs font-bold text-[#FD761A]">
            {durationPreset === "<20"
              ? "< 20 hrs"
              : durationPreset === "20-50"
                ? "20 a 50 hrs"
                : durationPreset === ">50"
                  ? "> 50 hrs"
                  : "Todas"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() =>
              onSelectDurationPreset(durationPreset === "<20" ? "all" : "<20")
            }
            className={cn(
              "py-1.5 px-2 text-center rounded-lg border text-xs font-medium transition-colors cursor-pointer",
              durationPreset === "<20"
                ? "border-[#FD761A] bg-orange-50 text-[#FD761A] font-bold"
                : "border-stone-200 text-stone-600 hover:border-stone-300"
            )}
          >
            &lt; 20 hrs
          </button>
          <button
            type="button"
            onClick={() =>
              onSelectDurationPreset(durationPreset === "20-50" ? "all" : "20-50")
            }
            className={cn(
              "py-1.5 px-2 text-center rounded-lg border text-xs font-medium transition-colors cursor-pointer",
              durationPreset === "20-50"
                ? "border-[#FD761A] bg-orange-50 text-[#FD761A] font-bold"
                : "border-stone-200 text-stone-600 hover:border-stone-300"
            )}
          >
            20 a 50
          </button>
          <button
            type="button"
            onClick={() =>
              onSelectDurationPreset(durationPreset === ">50" ? "all" : ">50")
            }
            className={cn(
              "py-1.5 px-2 text-center rounded-lg border text-xs font-medium transition-colors cursor-pointer",
              durationPreset === ">50"
                ? "border-[#FD761A] bg-orange-50 text-[#FD761A] font-bold"
                : "border-stone-200 text-stone-600 hover:border-stone-300"
            )}
          >
            &gt; 50 hrs
          </button>
        </div>
      </div>

      {/* 4. Modality Toggles */}
      <div className="flex flex-col gap-3 pt-2 border-t border-stone-100">
        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
          Modalidad y Validación
        </span>

        {/* Toggle 1: Asynchronous */}
        <label className="flex items-center justify-between gap-2 cursor-pointer group">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-stone-800 group-hover:text-[#FD761A] transition-colors">
              Tutoría Asincrónica
            </span>
            <span className="text-[10px] text-stone-400">
              A tu propio ritmo con perito
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isAsync}
            onClick={() => onToggleIsAsync(!isAsync)}
            className={cn(
              "relative w-10 h-5 rounded-full transition-colors flex items-center p-0.5 cursor-pointer",
              isAsync ? "bg-[#FD761A]" : "bg-stone-200"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full bg-white shadow-xs transition-transform flex items-center justify-center",
                isAsync ? "translate-x-5" : "translate-x-0"
              )}
            >
              {isAsync && <Check className="w-2.5 h-2.5 text-[#FD761A]" />}
            </div>
          </button>
        </label>

        {/* Toggle 2: Clases en Vivo */}
        <label className="flex items-center justify-between gap-2 cursor-pointer group">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-stone-800 group-hover:text-[#FD761A] transition-colors">
              Clases en Vivo
            </span>
            <span className="text-[10px] text-stone-400">
              Sesiones sincrónicas fijadas
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isLive}
            onClick={() => onToggleIsLive(!isLive)}
            className={cn(
              "relative w-10 h-5 rounded-full transition-colors flex items-center p-0.5 cursor-pointer",
              isLive ? "bg-[#FD761A]" : "bg-stone-200"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full bg-white shadow-xs transition-transform flex items-center justify-center",
                isLive ? "translate-x-5" : "translate-x-0"
              )}
            >
              {isLive && <Check className="w-2.5 h-2.5 text-[#FD761A]" />}
            </div>
          </button>
        </label>

        {/* Toggle 3: Credencial QR */}
        <label className="flex items-center justify-between gap-2 cursor-pointer group">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-stone-800 flex items-center gap-1 group-hover:text-[#FD761A] transition-colors">
              <QrCode className="w-3.5 h-3.5 text-[#FD761A]" />
              Credencial QR inmediata
            </span>
            <span className="text-[10px] text-stone-400">
              Emisión criptográfica directa
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={onlyQr}
            onClick={() => onToggleOnlyQr(!onlyQr)}
            className={cn(
              "relative w-10 h-5 rounded-full transition-colors flex items-center p-0.5 cursor-pointer",
              onlyQr ? "bg-[#FD761A]" : "bg-stone-200"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full bg-white shadow-xs transition-transform flex items-center justify-center",
                onlyQr ? "translate-x-5" : "translate-x-0"
              )}
            >
              {onlyQr && <Check className="w-2.5 h-2.5 text-[#FD761A]" />}
            </div>
          </button>
        </label>
      </div>
    </aside>
  );
}
