import { ShieldCheck } from "lucide-react";

export function CatalogHeader() {
  return (
    <section className="w-full bg-[#EFF4FF] py-10 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        {/* <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-4"
        >
          <Link
            href="/"
            className="hover:text-stone-900 transition-colors flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-stone-900 font-semibold">Catálogo</span>
        </nav> */}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#FD761A] block mb-1.5 font-sans">
              Acreditación Técnica y Universitaria
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Catálogo de Programas y Certificaciones
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl shadow-xs border border-stone-200/80">
              <ShieldCheck className="w-4 h-4 text-[#FD761A] shrink-0" />
              <span className="text-xs font-semibold text-stone-800">
                Validación de firmas con hash criptográfico
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
