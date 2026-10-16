"use client";

import Link from "next/link";
import Image from "next/image";
import {
  PlayCircle,
  ArrowRight,
  BookOpen,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Video,
  Layers,
  Calendar,
  Share2,
  Compass,
} from "lucide-react";

export function StudentDashboardView() {
  return (
    <div className="space-y-6">
      {/* HERO: Reanudar Sesión Prioritaria */}
      <section className="bg-[#151B2A] rounded-2xl p-6 lg:p-7 text-white shadow-lg relative overflow-hidden border border-stone-800">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-br from-[#FD761A]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FD761A]/20 border border-[#FD761A]/40 text-[#FD761A] text-[11px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#FD761A] animate-pulse" />
                Último curso visitado
              </span>
              <span className="text-stone-400 text-xs font-semibold">
                • Norma ISO 17024 / OSHA 1926
              </span>
              <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Credencial Oficial
              </span>
            </div>

            <div>
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white leading-tight">
                Seguridad Operativa en Maquinaria Pesada
              </h2>
              <p className="text-stone-300 text-xs lg:text-sm mt-1.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-stone-400 shrink-0" />
                <span>
                  Módulo 3: Maniobras críticas y análisis de estabilidad en taludes dinámicos
                </span>
              </p>
            </div>

            {/* Next Lesson Box */}
            <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-700/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-white min-w-0">
                  <PlayCircle className="w-4.5 h-4.5 text-[#FD761A] shrink-0" />
                  <div className="truncate">
                    <span className="text-stone-400">Siguiente lección: </span>
                    <strong className="text-white font-semibold">
                      3.1 Ángulos de ataque y centro de gravedad
                    </strong>
                  </div>
                </div>
                <span className="text-[#FD761A] font-bold shrink-0 ml-2">
                  65% completado
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-950/80 h-2 rounded-full overflow-hidden p-0.5 border border-stone-800">
                <div
                  className="bg-[#FD761A] h-full rounded-full transition-all duration-500"
                  style={{ width: "65%" }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 gap-2 pt-0.5">
                <span>Lección 1 de 4 del módulo • Faltan 7 módulos prácticos</span>
                <span className="inline-flex items-center gap-1 text-stone-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#FD761A]" />
                  Rúbrica de taludes vence en 4 días
                </span>
              </div>
            </div>
          </div>

          {/* Thumbnail & Quick Play CTA */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="rounded-xl overflow-hidden border border-stone-700/70 bg-stone-900/90 shadow-md relative group">
              <div className="relative h-36 w-full bg-stone-800 overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAvX4TcTCSemDECZ148in6OsZ51c_aVuyuFgGS3YhOLDpGgtAovJxto1zrhW7aZbzW6PdNaLL9SNKO8B8xO02NoOUqNe9LbKpXzH22pG2yk0YDSNiJoQ0PQUmjE3BAxqk3o6yEsLJS85jA1818UB7Bi2wdsYeUbEzdch1bSuR-1IFKXZjJL__DghKivBRt91iyvH4uqD5m-rUpfDhjZMofq8Gf-X4wI1anIZQW5OWHL34t6gyucUD5"
                  alt="Operador técnico de maquinaria pesada"
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/40 to-transparent" />

                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#FD761A]" />
                  24 min restantes
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#FD761A] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="p-3.5 space-y-2.5 bg-stone-900/95">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-medium truncate">
                    Instructor: Ing. Marco Viteri
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Simulador listo
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/campus/cursos/OP-601"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#FD761A] hover:bg-[#e05d04] text-white font-bold text-xs transition-all shadow-sm"
                  >
                    <span>Continuar lección</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/campus/cursos/OP-601"
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
                  2 cursos
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold">
                <button className="px-3 py-1 rounded-md bg-[#151B2A] text-white font-bold">
                  Todos (2)
                </button>
                <button className="px-3 py-1 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                  Rutas
                </button>
                <button className="px-3 py-1 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                  Finalizados (1)
                </button>
              </div>
            </div>

            {/* Curso 1 */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 hover:border-stone-300 dark:hover:border-stone-700 transition-all flex flex-col sm:flex-row gap-4 items-center shadow-2xs">
              <div className="w-full sm:w-44 h-28 rounded-lg overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800 relative">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAvX4TcTCSemDECZ148in6OsZ51c_aVuyuFgGS3YhOLDpGgtAovJxto1zrhW7aZbzW6PdNaLL9SNKO8B8xO02NoOUqNe9LbKpXzH22pG2yk0YDSNiJoQ0PQUmjE3BAxqk3o6yEsLJS85jA1818UB7Bi2wdsYeUbEzdch1bSuR-1IFKXZjJL__DghKivBRt91iyvH4uqD5m-rUpfDhjZMofq8Gf-X4wI1anIZQW5OWHL34t6gyucUD5"
                  alt="Termografía industrial"
                  fill
                  sizes="(max-width: 640px) 100vw, 176px"
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#151B2A]/90 text-white text-[9px] font-bold uppercase tracking-wide">
                  Técnico
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#FD761A] uppercase tracking-wider">
                    Módulo 2 de 5 en progreso
                  </span>
                  <span className="text-xs font-bold text-stone-900 dark:text-white">
                    30%
                  </span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                  Mantenimiento Predictivo y Termografía Industrial
                </h4>

                <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FD761A] h-full rounded-full"
                    style={{ width: "30%" }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 truncate">
                    <PlayCircle className="w-3.5 h-3.5 text-[#FD761A]" />
                    Próxima clase: <strong>Termografía Nivel I</strong>
                  </span>
                  <Link
                    href="/campus/cursos/IND-5402"
                    className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-white font-bold text-xs transition-colors shrink-0"
                  >
                    Reanudar
                  </Link>
                </div>
              </div>
            </div>

            {/* Curso 2 */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 hover:border-stone-300 dark:hover:border-stone-700 transition-all flex flex-col sm:flex-row gap-4 items-center shadow-2xs">
              <div className="w-full sm:w-44 h-28 rounded-lg overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800 relative">
                <Image
                  src="https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=600&auto=format&fit=crop"
                  alt="Perforación minera"
                  fill
                  sizes="(max-width: 640px) 100vw, 176px"
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-stone-800/90 text-white text-[9px] font-bold uppercase tracking-wide">
                  Matriculado
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    Inicia el 15 de Noviembre
                  </span>
                  <span className="text-xs text-stone-500">5 Módulos</span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                  Inspección de Equipos de Perforación Minera
                </h4>

                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                  Protocolos no destructivos y evaluación estructural conforme al código API Spec 4F.
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Requisitos previos completados
                  </span>
                  <Link
                    href="/campus/cursos/MIN-402"
                    className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-900 dark:text-white font-semibold text-xs transition-colors shrink-0"
                  >
                    Ver temario
                  </Link>
                </div>
              </div>
            </div>
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
                  Explora más de 40 certificaciones alineadas a estándares internacionales ISO y OSHA.
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
                Horas Acreditadas
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-stone-900 dark:text-white">
                  42
                </span>
                <span className="text-xs text-stone-400">/ 60 h</span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-800 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#151B2A] dark:bg-stone-200 h-full rounded-full"
                  style={{ width: "70%" }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                Racha de Estudio
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xl font-bold text-[#FD761A]">5 días</span>
                <Flame className="w-4.5 h-4.5 text-[#FD761A] fill-[#FD761A]" />
              </div>
              <span className="text-[10px] text-stone-400 mt-2">
                ¡Sigue con el ritmo!
              </span>
            </div>
          </div>

          {/* Agenda Operativa: Eventos y Entregas */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FD761A]" />
                Próximos eventos
              </h3>
              <span className="text-[10px] font-bold text-stone-500">
                Esta semana
              </span>
            </div>

            <div className="space-y-3">
              {/* Evento 1 */}
              <div className="p-3 rounded-lg bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/70 dark:border-orange-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#FD761A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FD761A] animate-ping" />
                    Hoy • 18:00 hrs
                  </span>
                  <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-400">
                    En 2 horas
                  </span>
                </div>

                <div className="text-xs font-bold text-stone-900 dark:text-white leading-snug">
                  Sesión en vivo Q&A: Dudas de Estabilidad
                </div>

                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  Con el Ing. Marco Viteri. Revisión técnica del Módulo 3.
                </p>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-md bg-[#FD761A] hover:bg-[#e05d04] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Unirse a la sesión</span>
                </button>
              </div>

              {/* Evento 2 */}
              <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">
                    Jueves • 23:59 hrs
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                    Tarea
                  </span>
                </div>

                <div className="text-xs font-bold text-stone-900 dark:text-white">
                  Entrega: Informe Técnico Práctico 3.1
                </div>

                <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Vence en 3 días</span>
                </div>
              </div>
            </div>
          </div>

          {/* Logros Recientes / Certificado */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FD761A]" />
                Logros recientes
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                Oficial
              </span>
            </div>

            <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-800/40 space-y-2.5">
              <div className="flex items-start gap-3">
                {/* QR Symbol */}
                <div className="p-2 bg-white dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-700 shrink-0 text-stone-900 dark:text-white">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v4h-2v-4zm-4-2h4v2h-4v-2zm2 4h4v2h-4v-2zm-2-4h2v2h-2v-2zm4-4h2v2h-2v-2zm-4 0h2v2h-2v-2zm6 2h2v2h-2v-2z" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                    Gestión de Riesgos Laborales en Minería
                  </h4>
                  <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                    Norma ISO 45001 • ID FX-8849-CL
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Aprobado con Distinción (19/20)
                  </span>
                </div>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <Link
                  href="/verificar/CFX-2025-9831"
                  className="flex-1 py-1.5 px-2.5 text-center text-xs font-bold rounded-lg bg-[#151B2A] hover:bg-stone-800 text-white transition-colors"
                >
                  Ver credencial
                </Link>
                <button
                  type="button"
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                  title="Compartir credencial oficial"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
