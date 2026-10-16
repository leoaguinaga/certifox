import Link from "next/link";
import { Headphones, Mail } from "lucide-react";

export function StudentSupportSection() {
  return (
    <section
      id="soporte"
      className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 scroll-mt-20"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#EFF4FF] border border-[#D5E3FD] flex items-center justify-center shrink-0 text-[#FD761A]">
          <Headphones className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-[#0D1C2F]">
            ¿Necesitas soporte técnico o validar tus credenciales?
          </h3>
          <p className="text-xs sm:text-sm text-[#45474C] leading-relaxed max-w-xl">
            Nuestro centro de soporte académico responde consultas de inscripciones,
            problemas de acceso a video-clases y verificación con firma criptográfica en
            menos de 2 horas.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
        <Link
          href="/campus/mesa-de-ayuda"
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#151B2A] hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
        >
          <Mail className="w-4 h-4 text-[#FD761A]" />
          <span>Abrir ticket de soporte</span>
        </Link>
      </div>
    </section>
  );
}
