import Image from "next/image";
import { Award, Star, ShieldCheck } from "lucide-react";
import { CourseInstructor } from "../types";

interface CourseInstructorProfileProps {
  instructor: CourseInstructor;
}

export function CourseInstructorProfile({
  instructor,
}: CourseInstructorProfileProps) {
  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/80">
      <h2 className="text-lg sm:text-xl font-bold text-stone-900 mb-6">
        Instructor titular
      </h2>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar */}
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-md shrink-0 border border-stone-200">
          <Image
            src={instructor.avatarUrl}
            alt={instructor.name}
            fill
            sizes="112px"
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-stone-900">
              {instructor.name}
            </h3>
            {instructor.cipNumber && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#EFF4FF] font-mono text-[11px] font-bold text-stone-700 border border-stone-200">
                {instructor.cipNumber}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm font-semibold text-[#FD761A]">
            {instructor.role}
          </p>

          {instructor.bio && (
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1">
              {instructor.bio}
            </p>
          )}

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-stone-100 text-xs text-stone-600 font-medium">
            {instructor.accreditedStudents && (
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#FD761A]" />
                <span>{instructor.accreditedStudents.toLocaleString()} Alumnos Acreditados</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-[#FD761A] text-[#FD761A]" />
              <span>{instructor.rating || 4.9}/5.0 Calificación Docente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Firma Digital Oficial Registrada</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
