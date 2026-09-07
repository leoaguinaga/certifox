import Link from "next/link";
import { ArrowRight, ShieldCheck, QrCode, CheckCircle2, Banknote } from "lucide-react";
import { InteractivePreviewWindow } from "./interactive-preview-window";
import { MetricStrip } from "./metric-strip";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#FFFDF9] pt-14 pb-20 lg:pt-20 lg:pb-28">
      {/* Subtle Assemble horizontal linear grid background */}
      {/* <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: "linear-gradient(to bottom, transparent 39px, #EAE5DE 40px)",
          backgroundSize: "100% 40px",
        }}
      /> */}

      {/* Radial ambient gradient */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_35%,rgba(255,247,237,0.75)_0%,rgba(255,253,249,0)_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Floating badge 1 (Top Left) */}
          <div className="hidden lg:flex absolute -left-12 top-4 flex-col items-center bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-stone-200/80 -rotate-3 transition-transform hover:rotate-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs font-bold text-stone-800">ISO 17024</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider mt-0.5">
              Compliant System
            </span>
          </div>

          {/* Floating badge 2 (Mid Left) */}
          <div className="hidden md:flex absolute -left-20 top-36 items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-[0_10px_35px_rgb(0,0,0,0.06)] border border-stone-200/80 rotate-3 transition-transform hover:rotate-0">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FD761A] flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-stone-900 leading-tight">Código QR 2025</p>
              <p className="text-[10px] text-stone-500 font-medium">Validación Instantánea</p>
            </div>
          </div>

          {/* Floating badge 3 (Top Right) */}
          <div className="hidden lg:flex absolute -right-10 top-6 items-center gap-2.5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-stone-200/80 rotate-6 transition-transform hover:rotate-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <div className="text-left">
              <p className="text-xs font-bold text-stone-900 leading-tight">SHA-256 Inmutable</p>
              <p className="text-[10px] text-stone-500 font-mono">8a9f..c24e</p>
            </div>
          </div>

          {/* Floating badge 4 (Mid Right) */}
          <div className="hidden md:flex absolute -right-20 top-40 items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-[0_10px_35px_rgb(0,0,0,0.06)] border border-stone-200/80 -rotate-2 transition-transform hover:rotate-0">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FD761A] flex items-center justify-center font-bold">
              <Banknote className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-stone-900">0% Comisiones</p>
              <p className="text-[10px] text-stone-500 font-medium">Cobros P2P Directos</p>
            </div>
          </div>

          {/* Central Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-xs mb-8 hover:border-orange-200 transition-all cursor-pointer">
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FD761A] text-xs font-bold tracking-tight">
              Novedad
            </span>
            <span className="text-xs sm:text-sm font-semibold text-stone-700">
              Acreditación técnica instantánea con FoxCode 2025
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
          </div>

          {/* Main Display Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[56px] lg:leading-[64px] text-stone-900 tracking-tight max-w-3xl mb-6 font-extrabold font-sans">
            Aprende, demuestra y{" "}
            <span className="inline-block relative px-3 py-0.5 rounded-xl bg-orange-100 text-[#FD761A] font-extrabold">
              certifica
            </span>{" "}
            tus habilidades.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mb-10 leading-relaxed">
            Cursos técnicos y vocacionales dictados por instructores calificados. Sin pasarelas de pago invasivas ni comisiones arbitrarias.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              href="#cursos"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-[#0D1C2F] text-white text-sm font-semibold hover:bg-stone-800 transition-all shadow-[0_6px_20px_rgba(13,28,47,0.2)] gap-2.5 group"
            >
              <span>Comenzar formación</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="#verificacion"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white text-stone-800 text-sm font-semibold hover:bg-stone-100 border border-stone-200 shadow-xs transition-all gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-stone-600" />
              <span>Verificar certificado</span>
            </Link>
          </div>

          {/* Assemble-style Spatial Floating Window Preview */}
          <InteractivePreviewWindow />

          {/* Metrics Strip */}
          <MetricStrip />
        </div>
      </div>
    </section>
  );
}
