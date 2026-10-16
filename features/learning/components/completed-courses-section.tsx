"use client";

import Link from "next/link";
import { CheckCircle2, Award, Share2, Medal } from "lucide-react";
import { EnrolledCourse } from "@/features/learning/types";

interface CompletedCoursesSectionProps {
  courses: EnrolledCourse[];
}

export function CompletedCoursesSection({ courses }: CompletedCoursesSectionProps) {
  const handleShare = (courseTitle: string, certCode?: string) => {
    const text = `¡Certificación aprobada con éxito en ${courseTitle}! Código de auditoría: ${certCode || "Certifox"}`;
    if (navigator.share) {
      navigator.share({ title: courseTitle, text, url: window.location.origin + `/verificar/${certCode}` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + `/verificar/${certCode}`);
      alert("Enlace oficial de certificación copiado al portapapeles para compartir en LinkedIn o redes profesionales.");
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Medal className="w-5 h-5 text-[#0D1C2F]" />
          <h2 className="text-lg sm:text-xl font-bold text-[#0D1C2F]">
            Cursos Finalizados
          </h2>
        </div>
        <Link
          href="/campus/certificados"
          className="text-xs font-bold text-[#FD761A] hover:underline"
        >
          Ver registro histórico
        </Link>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <article
            key={course.id}
            className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF4FF] border border-[#D5E3FD] flex items-center justify-center shrink-0 text-[#FD761A]">
                <Award className="w-7 h-7" />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Aprobado • Calificación {course.score}/100</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#45474C]">
                    Finalizado el {course.completedDate}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#0D1C2F]">
                  {course.title}
                </h3>

                <p className="text-xs text-[#45474C] leading-relaxed max-w-2xl">
                  {course.accreditationNorm ||
                    "Acreditado por Certifox Academy en conformidad con las normas internacionales de certificación por competencias."}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
              <Link
                href={`/verificar/${course.certificateCode || "CFX-2025-9831"}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#151B2A] hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
              >
                <Award className="w-4 h-4 text-[#FD761A]" />
                <span>Ver certificado obtenido</span>
              </Link>

              <button
                type="button"
                onClick={() => handleShare(course.title, course.certificateCode)}
                title="Compartir en LinkedIn"
                className="inline-flex items-center justify-center p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#0D1C2F] font-bold text-xs transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
