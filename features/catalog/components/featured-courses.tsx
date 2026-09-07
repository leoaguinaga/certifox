"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  LockOpen,
  ArrowLeftRight,
  CheckSquare,
  Award,
  BadgeCheck,
  QrCode,
} from "lucide-react";

const STEP_PILLS = [
  "01. Selección y Solicitud",
  "02. Validación Docente",
  "03. Práctica & Rúbricas",
  "04. Credencial QR Inviolable",
];

export function FeaturedCourses() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Scroll carousel to a specific card index
  const scrollToStep = (index: number) => {
    const container = carouselRef.current;
    if (!container) return;
    const cards = container.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
      setActiveStep(index);
    }
  };

  const scrollPrev = () => {
    const nextIdx = Math.max(0, activeStep - 1);
    scrollToStep(nextIdx);
  };

  const scrollNext = () => {
    const nextIdx = Math.min(STEP_PILLS.length - 1, activeStep + 1);
    scrollToStep(nextIdx);
  };

  // Sync active pill when user manually scrolls or swipes
  const handleScroll = useCallback(() => {
    const container = carouselRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const cardWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth + 24 // card width + gap (gap-space-lg = 24px)
      : 420;

    const newIndex = Math.min(
      STEP_PILLS.length - 1,
      Math.max(0, Math.round(scrollLeft / cardWidth))
    );
    setActiveStep(newIndex);
  }, []);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 50);
    };

    container.addEventListener("scroll", debouncedScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  return (
    <section className="py-space-3xl bg-background relative overflow-hidden" id="como-funciona">
      {/* Subtle technical grid decoration background */}
      {/* <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#0d1c2f 0.75px, transparent 0.75px)",
          backgroundSize: "28px 28px",
        }}
      /> */}

      <div className="relative max-w-max-width-content mx-auto px-grid-margin-mobile lg:px-grid-margin-desktop">
        {/* Editorial Header with Section Meta, Headline & Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
          <div className="max-w-2xl">
            <h2 className="font-headline-xl text-headline-xl md:font-display-hero md:text-display-hero text-on-surface tracking-tight mt-1 mb-space-xs leading-tight">
              Cómo funciona Certifox
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Diseñado para una formación técnica ágil, auditable y sin comisiones abusivas: desde la postulación directa hasta la credencial inviolable.
            </p>
          </div>

          {/* Interactive Scroll Arrows & Hint */}
          <div className="flex items-center gap-space-sm">
            <div className="flex items-center gap-2">
              <button
                id="step-scroll-prev"
                aria-label="Paso anterior"
                onClick={scrollPrev}
                disabled={activeStep === 0}
                className="w-10 h-10 rounded-full border border-surface-container bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container hover:text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                id="step-scroll-next"
                aria-label="Paso siguiente"
                onClick={scrollNext}
                disabled={activeStep === STEP_PILLS.length - 1}
                className="w-10 h-10 rounded-full border border-surface-container bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container hover:text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Step Filter / Navigation Pills */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-space-sm mb-space-lg no-scrollbar"
        >
          {STEP_PILLS.map((pillLabel, index) => {
            const isActive = activeStep === index;
            return (
              <button
                key={pillLabel}
                onClick={() => scrollToStep(index)}
                className={`px-space-md py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-all cursor-pointer ${isActive
                  ? "bg-primary-container text-surface-container-lowest shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
              >
                {pillLabel}
              </button>
            );
          })}
        </div>

        {/* Horizontal Snap Scroll Container */}
        <div
          ref={carouselRef}
          id="cards-carousel"
          className="flex gap-space-lg overflow-x-auto pb-space-xl snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {/* CARD 01: Solicitud y Selección Directa */}
          <div className="min-w-[340px] sm:min-w-[400px] lg:min-w-[420px] max-w-[440px] shrink-0 snap-start flex flex-col justify-between rounded-2xl p-space-xl bg-[#0F172A] text-white shadow-xl border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Top metadata row */}
              <div className="flex items-center justify-between mb-space-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="w-8 h-8 rounded-lg bg-secondary-container text-white font-headline-sm font-bold flex items-center justify-center text-sm">
                    01
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold">
                    ETAPA INICIAL
                  </span>
                </div>
              </div>

              {/* Headline / Key Statement */}
              <h3 className="text-2xl font-bold text-white tracking-tight mb-space-sm leading-snug">
                Explora el programa y postula sin comisiones abusivas.
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-space-lg">
                Selecciona especializaciones homologadas con temarios técnicos certificados. Acuerdas el pago directo con el formador y reservas tu cupo en tiempo récord.
              </p>

              {/* Graphic/Interactive Preview Micro-Card */}
              <div className="p-space-md rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 mb-space-md">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>PLAN DE ESTUDIOS HOMOLOGADO</span>
                </div>
                <div className="flex items-center gap-space-xs text-white text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-secondary-container shrink-0" />
                  <span>Temario práctico con horas de maquinaria</span>
                </div>
                <div className="flex items-center gap-space-xs text-white text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-secondary-container shrink-0" />
                  <span>Sin pasarelas bancarias retenedoras (0% fee)</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-space-md border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-secondary-container shrink-0" />
                Tiempo: ~2 minutos
              </span>
              <span className="text-secondary-container font-semibold">Paso 1 de 4</span>
            </div>
          </div>

          {/* CARD 02: Confirmación Directa y Cupo Inmediato */}
          <div className="min-w-[340px] sm:min-w-[400px] lg:min-w-[420px] max-w-[440px] shrink-0 snap-start flex flex-col justify-between rounded-2xl p-space-xl bg-[#0F172A] text-white shadow-xl border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Top metadata row */}
              <div className="flex items-center justify-between mb-space-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="w-8 h-8 rounded-lg bg-slate-800 text-white font-headline-sm font-bold flex items-center justify-center text-sm border border-slate-700">
                    02
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold">
                    AUTORIZACIÓN
                  </span>
                </div>
              </div>

              {/* Headline / Key Statement */}
              <h3 className="text-2xl font-bold text-white tracking-tight mb-space-sm leading-snug">
                Validación docente persona a persona sin demoras.
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-space-lg">
                El instructor valida tu postulación, recibe el comprobante directo y te activa la plataforma en su panel de administración de un solo clic.
              </p>

              {/* Graphic/Interactive Preview Micro-Card */}
              <div className="p-space-md rounded-xl bg-slate-900/90 border border-slate-800 mb-space-md">
                <div className="flex items-center gap-space-sm mb-2 pb-2 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-white text-xs font-bold shrink-0">
                    DR
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">Ing. Daniela Ramos</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">Termografía &amp; Mtto. Industrial</p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
                    Aprobado
                  </span>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <LockOpen className="w-3.5 h-3.5 text-secondary-container shrink-0" />
                  <span>Enlace y accesos al simulador remitidos</span>
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-space-md border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-slate-300">
                <ArrowLeftRight className="w-3.5 h-3.5 text-secondary-container shrink-0" />
                Directo con instructor
              </span>
              <span className="text-secondary-container font-semibold">Paso 2 de 4</span>
            </div>
          </div>

          {/* CARD 03: Aula Práctica y Evaluación Rigurosa */}
          <div className="min-w-[340px] sm:min-w-[400px] lg:min-w-[420px] max-w-[440px] shrink-0 snap-start flex flex-col justify-between rounded-2xl p-space-xl bg-[#0F172A] text-white shadow-xl border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Top metadata row */}
              <div className="flex items-center justify-between mb-space-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="w-8 h-8 rounded-lg bg-slate-800 text-white font-headline-sm font-bold flex items-center justify-center text-sm border border-slate-700">
                    03
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold">
                    FORMACIÓN &amp; RÚBRICA
                  </span>
                </div>
              </div>

              {/* Headline / Key Statement */}
              <h3 className="text-2xl font-bold text-white tracking-tight mb-space-sm leading-snug">
                Talleres aplicados y evaluaciones con trazabilidad.
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-space-lg">
                Participa de clases en vivo o en taller presencial. Cada tarea y examen de competencia es calificado bajo los estándares exigidos por la industria.
              </p>

              {/* Graphic/Interactive Preview Micro-Card */}
              <div className="p-space-md rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 mb-space-md font-mono text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    Módulo Práctico de Campo
                  </span>
                  <span className="text-sky-400 font-bold">100%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full w-full rounded-full" />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Asistencia Auditada: 48/48 hrs</span>
                  <span className="text-emerald-400 font-semibold">Aprobado</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-space-md border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-slate-300">
                <Award className="w-3.5 h-3.5 text-secondary-container shrink-0" />
                Rúbrica ISO 17024
              </span>
              <span className="text-secondary-container font-semibold">Paso 3 de 4</span>
            </div>
          </div>

          {/* CARD 04: Credencial Criptográfica con QR Inviolable */}
          <div className="min-w-[340px] sm:min-w-[400px] lg:min-w-[420px] max-w-[440px] shrink-0 snap-start flex flex-col justify-between rounded-2xl p-space-xl bg-[#0F172A] text-white shadow-xl border border-emerald-500/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Top metadata row */}
              <div className="flex items-center justify-between mb-space-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-headline-sm font-bold flex items-center justify-center text-sm">
                    04
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                    ACREDITACIÓN FINAL
                  </span>
                </div>
              </div>

              {/* Headline / Key Statement */}
              <h3 className="text-2xl font-bold text-white tracking-tight mb-space-sm leading-snug">
                Emisión de credencial digital con QR inviolable.
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-space-lg">
                Al graduarte obtienes un certificado oficial permanente con código registral único indexado en la base de datos pública para consulta de empleadores.
              </p>

              {/* Graphic/Interactive Preview Micro-Card */}
              <div className="p-space-md rounded-xl bg-slate-900/90 border border-emerald-500/20 flex items-center justify-between mb-space-md">
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">ID REGISTRAL INMUTABLE</p>
                  <p className="text-sm font-mono text-white font-bold tracking-wider">CFX-2025-9831</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 mt-1">
                    <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                    Verificable de por vida
                  </span>
                </div>
                <div className="w-12 h-12 bg-white p-1 rounded flex items-center justify-center shrink-0">
                  <svg className="w-full h-full text-slate-950" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v4h-4v-4zm-4-2h2v2h-2v-2zm4 4v4h2v-4h-2zm-6-2h2v4h-2v-4zm4-2h4v2h-4v-2zm-8-8h2v2H8V6zm0 12h2v2H8v-2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-space-md border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <QrCode className="w-3.5 h-3.5 shrink-0" />
                Validez Nacional e Internacional
              </span>
              <span className="text-emerald-400 font-semibold">Completado</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const HowItWorksSection = FeaturedCourses;
