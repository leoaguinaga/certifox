"use client";

import Link from "next/link";
import {
  Video,
  Users,
  FileCheck,
  ArrowRight,
  MessageSquare,
  Layers,
} from "lucide-react";

export function TeacherDashboardView() {
  return (
    <div className="space-y-6">
      {/* HERO: Próxima Sesión a Dictar */}
      <section className="bg-[#151B2A] rounded-2xl p-6 lg:p-7 text-white shadow-lg relative overflow-hidden border border-stone-800">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-br from-[#FD761A]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FD761A]/20 border border-[#FD761A]/40 text-[#FD761A] text-[11px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#FD761A] animate-ping" />
                Sala Virtual • En 2 Horas
              </span>
              <span className="text-stone-400 text-xs font-semibold">
                • 24 Estudiantes inscritos
              </span>
            </div>

            <div>
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white leading-tight">
                Sesión en Vivo: Dudas de Estabilidad y Maniobras Críticas
              </h2>
              <p className="text-stone-300 text-xs lg:text-sm mt-1.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Curso: Seguridad Operativa en Maquinaria Pesada (Módulo 3)</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Horario programado:</span>
                <strong className="text-white font-semibold">
                  Hoy • 18:00 - 19:30 hrs (GMT-5)
                </strong>
              </div>
              <p className="text-[11px] text-stone-400">
                La sala Zoom/Meet se habilitará 10 minutos antes para comprobación de audio y pizarra digital.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="rounded-xl border border-stone-700/80 bg-stone-900/95 p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-medium">Estado del enlace:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Listo para transmitir
                </span>
              </div>

              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] text-white font-bold text-sm transition-all shadow-sm cursor-pointer"
              >
                <Video className="w-4.5 h-4.5" />
                <span>Iniciar Sala de Clase</span>
              </button>

              <div className="flex items-center justify-between pt-1 text-[11px] text-stone-400 border-t border-stone-800">
                <span>Grabación en la nube: Automática</span>
                <Link
                  href="/campus/cursos/OP-601"
                  className="text-[#FD761A] hover:underline font-semibold"
                >
                  Ver rúbrica
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID EN 2 COLUMNAS (65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA PRINCIPAL (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Cursos Asignados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Cursos a mi cargo
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold">
                  3 activos
                </span>
              </div>

              <Link
                href="/campus/cursos"
                className="text-xs font-bold text-[#FD761A] hover:underline flex items-center gap-1"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Curso 1 */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#FD761A] uppercase tracking-wider">
                  Cohorte 2025-II • 32 Alumnos
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  Avance promedio: 68%
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                Seguridad Operativa en Maquinaria Pesada (OP-601)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                  <span className="text-[11px] text-stone-500 block">Entregas recibidas</span>
                  <strong className="text-sm font-bold text-stone-900 dark:text-white">
                    28 / 32
                  </strong>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                  <span className="text-[11px] text-stone-500 block">Por calificar</span>
                  <strong className="text-sm font-bold text-[#FD761A]">4 pendientes</strong>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                  <span className="text-[11px] text-stone-500 block">Siguiente clase</span>
                  <strong className="text-sm font-bold text-stone-900 dark:text-white">
                    Hoy 18:00
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 border-t border-stone-100 dark:border-stone-800">
                <Link
                  href="/campus/cursos/OP-601"
                  className="px-3 py-1.5 rounded-lg bg-[#151B2A] hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
                >
                  Gestionar temario
                </Link>
                <Link
                  href="/campus/tareas"
                  className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs transition-colors"
                >
                  Calificar rúbricas
                </Link>
              </div>
            </div>

            {/* Curso 2 */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Cohorte 2025-II • 24 Alumnos
                </span>
                <span className="text-xs font-bold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                  Avance promedio: 35%
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                Mantenimiento Predictivo Industrial (IND-5402)
              </h4>

              <div className="pt-1 flex items-center gap-2">
                <Link
                  href="/campus/cursos/IND-5402"
                  className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-white font-semibold text-xs transition-colors"
                >
                  Ver grupo
                </Link>
                <span className="text-xs text-stone-500">2 tareas pendientes</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA LATERAL (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Métricas Docentes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                Alumnos Activos
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xl font-bold text-stone-900 dark:text-white">
                  84
                </span>
                <Users className="w-4 h-4 text-stone-400" />
              </div>
              <span className="text-[10px] text-stone-400 mt-2">En 3 cohortes</span>
            </div>

            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                Por Calificar
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xl font-bold text-[#FD761A]">6</span>
                <FileCheck className="w-4 h-4 text-[#FD761A]" />
              </div>
              <span className="text-[10px] text-stone-400 mt-2">Rúbricas ISO</span>
            </div>
          </div>

          {/* Dudas y Preguntas de Alumnos */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#FD761A]" />
                Preguntas de Alumnos
              </h3>
              <span className="text-[10px] font-bold text-[#FD761A] bg-orange-100 dark:bg-orange-950/60 px-1.5 py-0.5 rounded">
                2 nuevas
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 dark:text-white">
                    Carlos Mendoza
                  </span>
                  <span className="text-[10px] text-stone-400">Hace 30m</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2">
                  ¿El factor de seguridad en taludes con pendiente &gt; 35° requiere simulación previa?
                </p>
                <Link
                  href="/campus/comunidad"
                  className="inline-block text-[11px] font-bold text-[#FD761A] hover:underline pt-0.5"
                >
                  Responder al alumno →
                </Link>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 dark:text-white">
                    Brunella E.
                  </span>
                  <span className="text-[10px] text-stone-400">Hace 2h</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2">
                  Consulta sobre la entrega de la rúbrica 3.1 en formato PDF homologado.
                </p>
                <Link
                  href="/campus/comunidad"
                  className="inline-block text-[11px] font-bold text-[#FD761A] hover:underline pt-0.5"
                >
                  Responder al alumno →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
