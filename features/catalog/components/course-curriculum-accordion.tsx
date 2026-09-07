"use client";

import { useState } from "react";
import {
  PlayCircle,
  HelpCircle,
  FileCheck,
  Award,
  ChevronDown,
} from "lucide-react";
import { CurriculumModule, Lesson } from "../types";
import { cn } from "@/lib/utils";

interface CourseCurriculumAccordionProps {
  curriculum?: CurriculumModule[];
}

export function CourseCurriculumAccordion({
  curriculum,
}: CourseCurriculumAccordionProps) {
  // Open first module by default
  const [openModules, setOpenModules] = useState<string[]>(() =>
    curriculum && curriculum.length > 0 ? [curriculum[0].moduleNumber] : []
  );

  if (!curriculum || curriculum.length === 0) return null;

  const toggleModule = (moduleNum: string) => {
    setOpenModules((prev) =>
      prev.includes(moduleNum)
        ? prev.filter((n) => n !== moduleNum)
        : [...prev, moduleNum]
    );
  };

  const toggleAll = () => {
    if (openModules.length === curriculum.length) {
      setOpenModules([]);
    } else {
      setOpenModules(curriculum.map((m) => m.moduleNumber));
    }
  };

  const totalLessons = curriculum.reduce((acc, m) => acc + m.lessons.length, 0);
  const allOpen = openModules.length === curriculum.length;

  const renderLessonIcon = (type: Lesson["type"]) => {
    switch (type) {
      case "video":
        return <PlayCircle className="w-4 h-4 text-stone-400 shrink-0" />;
      case "quiz":
        return <HelpCircle className="w-4 h-4 text-[#FD761A] shrink-0" />;
      case "assignment":
        return <FileCheck className="w-4 h-4 text-[#FD761A] shrink-0" />;
      case "exam":
        return <Award className="w-4 h-4 text-[#059669] shrink-0" />;
      default:
        return <PlayCircle className="w-4 h-4 text-stone-400 shrink-0" />;
    }
  };

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-stone-100 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">
            Plan de estudios
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {curriculum.length} módulos estructurados • {totalLessons} lecciones y evaluaciones auditadas
          </p>
        </div>

        <button
          type="button"
          onClick={toggleAll}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#EFF4FF] hover:bg-stone-200 text-xs font-semibold text-stone-800 transition-colors cursor-pointer"
        >
          {allOpen ? "Colapsar todos" : "Alternar todos"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {curriculum.map((module) => {
          const isOpen = openModules.includes(module.moduleNumber);

          return (
            <div
              key={module.moduleNumber}
              className="rounded-xl bg-[#f8f9ff] overflow-hidden border border-stone-200/70 transition-all"
            >
              {/* Module Header Button */}
              <button
                type="button"
                onClick={() => toggleModule(module.moduleNumber)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-[#EFF4FF]/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-[#151B2A] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
                    {module.moduleNumber}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm sm:text-base font-bold text-stone-900 leading-snug truncate">
                      {module.title}
                    </span>
                    <span className="text-xs text-stone-500 mt-0.5 truncate">
                      {module.summary}
                    </span>
                  </div>
                </div>

                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-stone-400 shrink-0 ml-2 transition-transform duration-200",
                    isOpen && "rotate-180 text-stone-700"
                  )}
                />
              </button>

              {/* Lessons List */}
              {isOpen && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex flex-col gap-2 border-t border-stone-200/50 pt-3 animate-in fade-in duration-150">
                  {module.lessons.map((lesson, lIdx) => (
                    <div
                      key={lIdx}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors",
                        lesson.type === "exam"
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold"
                          : lesson.type === "quiz" || lesson.type === "assignment"
                          ? "bg-orange-50/70 border border-orange-200/60 text-stone-900 font-medium"
                          : "bg-white border border-stone-100 text-stone-800"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {renderLessonIcon(lesson.type)}
                        <span className="truncate">{lesson.title}</span>
                      </div>

                      <div className="shrink-0 text-right">
                        {lesson.duration && (
                          <span className="text-stone-500 font-mono text-[11px]">
                            {lesson.duration}
                          </span>
                        )}
                        {lesson.meta && (
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                              lesson.type === "exam"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-orange-100 text-[#FD761A]"
                            )}
                          >
                            {lesson.meta}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
