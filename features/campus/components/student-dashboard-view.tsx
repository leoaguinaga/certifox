"use client";

import Link from "next/link";
import Image from "next/image";
import { sanitizeMediaUrl } from "@/lib/image-utils";
import {
  PlayCircle,
  ArrowRight,
  BookOpen,
  Clock,
  ShieldCheck,
  Flame,
  Video,
  Layers,
  Calendar,
  Compass,
} from "lucide-react";
import { StudentProfile, EnrolledCourse } from "@/features/learning/types";

interface StudentDashboardViewProps {
  initialProfile?: StudentProfile;
  initialCourses?: EnrolledCourse[];
}

export function StudentDashboardView({
  initialProfile,
  initialCourses = [],
}: StudentDashboardViewProps) {
  const activeCourses = initialCourses.filter((c) => c.status !== "completed");
  const completedCourses = initialCourses.filter((c) => c.status === "completed");
  const priorityCourse =
    initialCourses.find((c) => c.status === "in_progress") || initialCourses[0];

  return (
    <div className="space-y-6">
      {/* HERO: Reanudar Sesión Prioritaria */}
      {priorityCourse ? (
        <section className="bg-[#151B2A] rounded-2xl p-6 lg:p-7 text-white shadow-lg relative overflow-hidden border border-stone-800">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-br from-[#FD761A]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Main Info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FD761A]/20 border border-[#FD761A]/40 text-[#FD761A] text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#FD761A] animate-pulse" />
                  {priorityCourse.status === "pending_confirmation"
                    ? "Matrícula en validación"
                    : "Curso en desarrollo"}
                </span>
                <span className="text-stone-400 text-xs font-semibold">
                  • {priorityCourse.categoryLabel}
                </span>
                <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Credencial Oficial
                </span>
              </div>

              <div>
                <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white leading-tight">
                  {priorityCourse.title}
                </h2>
                <p className="text-stone-300 text-xs lg:text-sm mt-1.5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>
                    Docente: {priorityCourse.instructorName} • {priorityCourse.school}
                  </span>
                </p>
              </div>

              {/* Progress Box */}
              <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-700/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white min-w-0">
                    <PlayCircle className="w-4.5 h-4.5 text-[#FD761A] shrink-0" />
                    <div className="truncate">
                      <span className="text-stone-400">Próxima lección: </span>
                      <strong className="text-white font-semibold">
                        {priorityCourse.nextLessonTitle || "Continuar temario"}
                      </strong>
                    </div>
                  </div>
                  <span className="text-[#FD761A] font-bold shrink-0 ml-2 font-mono">
                    {priorityCourse.progressPercentage}% completado
                  </span>
                </div>

                {/* Progress Bar (AC-13) */}
                <div className="w-full bg-stone-950/80 h-2 rounded-full overflow-hidden p-0.5 border border-stone-800">
                  <div
                    className="bg-[#FD761A] h-full rounded-full transition-all duration-500"
                    style={{ width: `${priorityCourse.progressPercentage}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 gap-2 pt-0.5">
                  <span>
                    {priorityCourse.lessonsCompleted} de {priorityCourse.totalLessons} lecciones completadas
                  </span>
                  <span className="inline-flex items-center gap-1 text-stone-300 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#FD761A]" />
                    {priorityCourse.status === "completed"
                      ? "Programa finalizado con éxito"
                      : "Avance persistente en tiempo real"}
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnail & Quick Play CTA */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="rounded-xl overflow-hidden border border-stone-700/70 bg-stone-900/90 shadow-md relative group">
                <div className="relative h-36 w-full bg-stone-800 overflow-hidden">
                  <Image
                    src={sanitizeMediaUrl(priorityCourse.image)}
                    alt={priorityCourse.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/40 to-transparent" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#FD761A] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 space-y-2.5 bg-stone-900/95">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-medium truncate">
                      {priorityCourse.school}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Aula habilitada
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/campus/cursos/${priorityCourse.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#FD761A] hover:bg-[#e05d04] text-white font-bold text-xs transition-all shadow-sm"
                    >
                      <span>
                        {priorityCourse.status === "completed"
                          ? "Repasar lecciones"
                          : "Entrar al aula"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/campus/cursos/${priorityCourse.slug}`}
                      title="Ver temario y recursos"
                      className="p-2.5 rounded-lg border border-stone-700 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors shrink-0"
                    >
                      <BookOpen className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white dark:bg-stone-900 rounded-2xl p-8 border border-stone-200 dark:border-stone-800 text-center space-y-4">
          <div className="size-16 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#FD761A] flex items-center justify-center mx-auto">
            <BookOpen className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">
            ¡Bienvenido a tu Campus Virtual Certifox!
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Aquí podrás seguir el avance de tus certificaciones, reproducir clases técnicas y gestionar tus credenciales oficiales.
          </p>
          <div>
            <Link
              href="/cursos"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] text-white text-xs font-bold transition-colors shadow-sm"
            >
              <span>Explorar catálogo de cursos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* GRID OPERATIVO EN 2 COLUMNAS (65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA PRINCIPAL (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Cursos en Progreso */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  En progreso
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold">
                  {activeCourses.length} cursos
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold">
                <span className="px-3 py-1 rounded-md bg-[#151B2A] text-white font-bold">
                  Activos ({activeCourses.length})
                </span>
                <Link
                  href="/campus/cursos"
                  className="px-3 py-1 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Finalizados ({completedCourses.length})
                </Link>
              </div>
            </div>

            {activeCourses.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                No tienes programas pendientes en este momento.
              </div>
            ) : (
              activeCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 hover:border-stone-300 dark:hover:border-stone-700 transition-all flex flex-col sm:flex-row gap-4 items-center shadow-2xs"
                >
                  <div className="w-full sm:w-44 h-28 rounded-lg overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800 relative">
                    <Image
                      src={sanitizeMediaUrl(course.image)}
                      alt={course.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 176px"
                      className="object-cover"
                    />
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#151B2A]/90 text-white text-[9px] font-bold uppercase tracking-wide">
                      {course.category}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#FD761A] uppercase tracking-wider">
                        {course.lessonsCompleted} de {course.totalLessons} lecciones
                      </span>
                      <span className="text-xs font-bold text-stone-900 dark:text-white font-mono">
                        {course.progressPercentage}%
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                      {course.title}
                    </h4>

                    {/* Progress Bar (AC-13) */}
                    <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#FD761A] h-full rounded-full transition-all duration-300"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 truncate">
                        <PlayCircle className="w-3.5 h-3.5 text-[#FD761A]" />
                        <span>{course.nextLessonTitle || "Continuar clase"}</span>
                      </span>
                      <Link
                        href={`/campus/cursos/${course.slug}`}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-white font-bold text-xs transition-colors shrink-0"
                      >
                        {course.status === "pending_confirmation" ? "Ver estado" : "Reanudar"}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Banner Catálogo */}
          <div className="p-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900 flex items-center justify-center text-[#FD761A] shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-stone-900 dark:text-white">
                  ¿Deseas ampliar tu perfil técnico?
                </h5>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Explora certificaciones alineadas a estándares internacionales ISO y OSHA.
                </p>
              </div>
            </div>

            <Link
              href="/cursos"
              className="text-xs font-bold text-[#FD761A] hover:underline flex items-center gap-1 shrink-0 ml-4"
            >
              <span>Explorar catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* COLUMNA LATERAL (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Métricas compactas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                Horas Estimadas
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-stone-900 dark:text-white">
                  {initialProfile?.totalHours || 0}
                </span>
                <span className="text-xs text-stone-400">h</span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-800 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#151B2A] dark:bg-stone-200 h-full rounded-full"
                  style={{ width: "60%" }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                Certificados
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xl font-bold text-[#FD761A]">
                  {initialProfile?.totalCertificates || 0}
                </span>
                <Flame className="w-4.5 h-4.5 text-[#FD761A] fill-[#FD761A]" />
              </div>
              <span className="text-[10px] text-stone-400 mt-2">
                Aprobados oficialmente
              </span>
            </div>
          </div>

          {/* Agenda Operativa: Eventos y Entregas */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FD761A]" />
                Evaluaciones & Tareas
              </h3>
              <Link
                href="/campus/tareas"
                className="text-[10px] font-bold text-[#FD761A] hover:underline"
              >
                Ver todas
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/70 dark:border-orange-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#FD761A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FD761A] animate-ping" />
                    Evaluación Continua
                  </span>
                  <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-400">
                    Activa
                  </span>
                </div>

                <div className="text-xs font-bold text-stone-900 dark:text-white leading-snug">
                  Informe Técnico & Rúbrica Práctica
                </div>

                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  Entrega tus evidencias de campo en la sección de Tareas para completar el curso.
                </p>

                <Link
                  href="/campus/tareas"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-md bg-[#FD761A] hover:bg-[#e05d04] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <Video className="w-4 h-4" />
                  <span>Ir a entregar tarea</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

