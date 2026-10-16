"use client";

import { MessageSquare } from "lucide-react";

export default function CampusComunidadPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              Comunidad & Preguntas Técnicas (Q&A)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-[#FD761A] border border-orange-200 dark:border-orange-900/60">
              Próximamente
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Espacio de debate técnico, consultas con instructores y resolución de dudas sobre normas y simuladores.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-3">
        <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FD761A] flex items-center justify-center mx-auto">
          <MessageSquare className="size-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900 dark:text-white">
          Foros Técnicos por Módulo (En desarrollo)
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
          Mientras habilitamos los foros por módulo, puedes enviar consultas técnicas o académicas desde la Mesa de Ayuda.
        </p>
      </div>
    </div>
  );
}
