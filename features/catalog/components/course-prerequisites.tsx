import { Award, HardHat, Laptop } from "lucide-react";
import { Prerequisite } from "../types";

interface CoursePrerequisitesProps {
  prerequisites?: Prerequisite[];
}

export function CoursePrerequisites({
  prerequisites,
}: CoursePrerequisitesProps) {
  if (!prerequisites || prerequisites.length === 0) return null;

  const renderIcon = (iconName: Prerequisite["iconName"]) => {
    switch (iconName) {
      case "badge":
        return <Award className="w-5 h-5 text-[#151B2A]" />;
      case "engineering":
        return <HardHat className="w-5 h-5 text-[#151B2A]" />;
      case "devices":
        return <Laptop className="w-5 h-5 text-[#151B2A]" />;
      default:
        return <Award className="w-5 h-5 text-[#151B2A]" />;
    }
  };

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/80">
      <h2 className="text-lg sm:text-xl font-bold text-stone-900 mb-5">
        Requisitos previos del postulante
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {prerequisites.map((req, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[#f8f9ff] border border-stone-200/60 flex flex-col gap-2"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center">
              {renderIcon(req.iconName)}
            </div>
            <span className="text-sm font-bold text-stone-900 leading-snug">
              {req.title}
            </span>
            <p className="text-xs text-stone-600 leading-relaxed">
              {req.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
