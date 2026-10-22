"use client";

import Link from "next/link";
import {
  FolderOpen,
  Clock,
  ChevronRight,
  Receipt,
  Info,
  AlertCircle,
} from "lucide-react";
import { EnrolledCourse } from "@/features/learning/types";

interface ActiveCoursesGridProps {
  courses: EnrolledCourse[];
}

export function ActiveCoursesGrid({ courses }: ActiveCoursesGridProps) {
  const handleViewReceipt = (courseCode: string) => {
    alert(
      `Comprobante para el curso ${courseCode} recibido.\nEstado: En bandeja del instructor.\nPlazo de validación: Menos de 12 horas laborables.`
    );
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-[#0D1C2F]" />
          <h2 className="text-lg sm:text-xl font-bold text-[#0D1C2F]">
            Mis Cursos Activos
          </h2>
        </div>
        <span className="text-[11px] font-bold text-[#45474C] uppercase tracking-wider">
          {courses.length} Programas en proceso
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => {
          const isPending = course.status === "pending_confirmation";

          return (
            <article
              key={course.id}
              className="bg-white rounded-2xl shadow-xs border border-stone-200/80 flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6 flex flex-col gap-4">
                {/* Status Badges */}
                <div className="flex items-start justify-between gap-2">
                  {isPending ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold inline-flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pendiente de confirmación</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-[#EFF4FF] text-[#0D1C2F] border border-[#D5E3FD] text-xs font-bold inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FD761A]" />
                      <span>{course.statusLabel}</span>
                    </span>
                  )}
                  <span className="text-[11px] font-mono font-bold text-[#45474C]">
                    ID: {course.code}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0D1C2F]">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#45474C] mt-1.5 line-clamp-2 leading-relaxed">
                    {course.categoryLabel} • Instructor: {course.instructorName}
                  </p>
                </div>

                {/* Progress Bar (if in progress) */}
                {!isPending && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex justify-between text-xs text-[#45474C]">
                      <span>Avance académico</span>
                      <span className="font-bold text-[#0D1C2F]">
                        {course.lessonsCompleted} / {course.totalLessons} lecciones
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FD761A] rounded-full"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Pending Confirmation Callout */}
                {isPending && (
                  <div className="bg-[#EFF4FF] p-3.5 rounded-xl border border-[#D5E3FD] flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-[#FD761A] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#0D1C2F]">
                      <span className="font-bold block">
                        Validación de inscripción
                      </span>
                      <p className="text-[#45474C] mt-0.5 leading-snug">
                        {course.pendingNotice ||
                          "El docente habilitará tus lecciones tras validar tu comprobante de pago."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card Action Strip */}
              <div className="bg-[#F8F9FF] px-6 py-3 border-t border-stone-100 flex items-center justify-between text-xs">
                {isPending ? (
                  <>
                    <span className="text-[#45474C]">
                      {course.submissionTimeAgo || "Enviado recientemente"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleViewReceipt(course.code)}
                      className="inline-flex items-center gap-1.5 font-bold text-[#0D1C2F] hover:text-[#FD761A] transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Ver comprobante</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 text-[#45474C]">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Último acceso: {course.lastAccess || "Reciente"}</span>
                    </div>
                    <Link
                      href={`/campus/cursos/${course.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-[#FD761A] hover:text-[#9D4300] transition-colors"
                    >
                      <span>Ir al curso</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
