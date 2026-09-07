import { Zap, Clock } from "lucide-react";
import { StudentProfile } from "@/features/learning/types";

interface StudentMetricsHeaderProps {
  student: StudentProfile;
}

export function StudentMetricsHeader({ student }: StudentMetricsHeaderProps) {
  const firstName = student.name.split(" ")[0];

  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-stone-100">
      <div>
        <span className="text-[11px] font-bold text-[#9D4300] uppercase tracking-widest block mb-1">
          Campus Académico Certifox
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1C2F] tracking-tight">
          Hola {firstName}, continúa tu formación técnica.
        </h1>
        <p className="text-xs sm:text-sm text-[#45474C] mt-1">
          Mantienes un ritmo constante: {student.totalCertificates} certificación oficial lista y 2 programas en curso.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white rounded-xl shadow-xs border border-stone-200/80">
          <div className="w-8 h-8 rounded-lg bg-[#FFDBCA] flex items-center justify-center text-[#FD761A]">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#45474C] uppercase tracking-wider block">
              Racha
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#0D1C2F]">
              {student.streakDays} días activos
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white rounded-xl shadow-xs border border-stone-200/80">
          <div className="w-8 h-8 rounded-lg bg-[#EFF4FF] flex items-center justify-center text-stone-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#45474C] uppercase tracking-wider block">
              Dedicación
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#0D1C2F]">
              {student.totalHours} hrs
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
