import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="py-16 bg-[#EFF4FF] border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-3 tracking-tight">
          Comienza hoy tu formación técnica respaldada.
        </h2>
        <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto mb-8 leading-relaxed">
          Únete a los miles de especialistas que impulsan su carrera con credenciales auditables y seguras.
        </p>
        <div className="flex justify-center">
          <Link
            href="#cursos"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FD761A] text-white text-sm font-semibold rounded-xl hover:bg-[#e05d04] transition-colors shadow-sm group"
          >
            <span>Explorar cursos técnicos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
