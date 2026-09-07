"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, PlayCircle, ArrowRight, Download } from "lucide-react";
import { EnrolledCourse } from "@/features/learning/types";

interface StudentHeroPriorityCardProps {
  course: EnrolledCourse;
}

export function StudentHeroPriorityCard({ course }: StudentHeroPriorityCardProps) {
  return (
    <section className="bg-white rounded-2xl shadow-md border border-stone-200/80 overflow-hidden relative">
      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Imagen Contextual con Scrim */}
        <div className="md:col-span-5 relative min-h-[220px] md:min-h-[300px]">
          <Image
            src={course.image}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#151B2A]/80 via-[#151B2A]/30 to-transparent" />
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#0D1C2F] font-bold text-xs shadow-xs flex items-center gap-2 border border-stone-200">
              <span className="w-2 h-2 rounded-full bg-[#FD761A] animate-pulse" />
              <span>Prioridad en curso</span>
            </span>
          </div>
        </div>

        {/* Contenido de Continuación de Estudio */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FD761A]" />
              <span className="text-[11px] font-bold text-[#9D4300] uppercase tracking-wider">
                {course.categoryLabel}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0D1C2F] tracking-tight">
              {course.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#45474C]">
              Instructor a cargo: {course.instructorName} • {course.school}
            </p>
          </div>

          {/* Indicador y Barra de Progreso Dinámica */}
          <div className="bg-[#EFF4FF] border border-[#D5E3FD] p-4 rounded-xl space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#45474C] font-medium">
                Progreso curricular
              </span>
              <span className="text-[#0D1C2F] font-bold">
                {course.progressPercentage}% completado • {course.lessonsCompleted} de {course.totalLessons} lecciones
              </span>
            </div>

            <div className="w-full h-2.5 bg-[#D5E3FD] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FD761A] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${course.progressPercentage}%` }}
              />
            </div>

            {course.nextLessonTitle && (
              <div className="flex items-start gap-2 pt-1 text-[#0D1C2F]">
                <PlayCircle className="w-4 h-4 text-[#FD761A] shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <span className="font-bold text-[#0D1C2F] block">
                    Próxima actividad pendiente:
                  </span>
                  <span className="text-[#45474C]">
                    {course.nextLessonTitle}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Link
              href={`/cursos/${course.slug}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FD761A] hover:bg-[#E05E09] text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Continuar al aula</span>
            </Link>

            <a
              href="#temario-pdf"
              onClick={(e) => {
                e.preventDefault();
                alert("Descargando temario analítico y cronograma del curso...");
              }}
              className="font-bold text-xs text-[#45474C] hover:text-[#0D1C2F] inline-flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-stone-400" />
              <span>Descargar temario PDF</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
