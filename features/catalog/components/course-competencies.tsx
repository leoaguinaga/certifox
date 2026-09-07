import { CheckCircle2, Award } from "lucide-react";
import { Competency } from "../types";

interface CourseCompetenciesProps {
  competencies?: Competency[];
}

export function CourseCompetencies({ competencies }: CourseCompetenciesProps) {
  if (!competencies || competencies.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/80">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#FD761A]" />
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">
            Lo que aprenderás
          </h2>
        </div>
        <span className="text-xs font-semibold text-stone-500">
          {competencies.length} Competencias Auditables
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competencies.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-[#EFF4FF]/50 hover:bg-[#EFF4FF] transition-colors border border-[#D5E3FD]/40"
          >
            <CheckCircle2 className="w-4 h-4 text-[#FD761A] shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-stone-900 leading-snug">
                {item.title}
              </span>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
