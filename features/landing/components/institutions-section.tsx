import Image from "next/image";
import Link from "next/link";
import { Briefcase, Award, WalletCards, ArrowRight } from "lucide-react";

export function InstitutionsSection() {
  return (
    <section className="py-20 bg-[#151B2A] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white mb-6 border border-white/10">
              <Briefcase className="w-4 h-4 text-[#FD761A]" />
              <span className="text-xs uppercase font-bold tracking-wider">
                Ecosistema Institucional
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Gestiona tus propios cursos, control de alumnos y emisión instantánea sin costes ocultos.
            </h2>

            <p className="text-sm sm:text-base text-stone-300 mb-8 max-w-2xl leading-relaxed">
              Diseñado para academias técnicas, asociaciones industriales e instructores independientes que buscan autonomía sin lidiar con integraciones bancarias complejas ni retenciones arbitrarias.
            </p>

            {/* Feature Mini Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-xs">
                <Award className="w-6 h-6 text-[#FD761A] mb-3" />
                <h4 className="text-base font-bold text-white mb-1.5">
                  Generador de Firmas en Lote
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Firma y emite cientos de certificados homologados con un solo clic tras auditar asistencias.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-xs">
                <WalletCards className="w-6 h-6 text-[#FD761A] mb-3" />
                <h4 className="text-base font-bold text-white mb-1.5">
                  Cobros directos a tu cuenta
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Tus alumnos te transfieren directamente; tú apruebas su ingreso desde la consola de control.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="#"
                className="px-6 py-3 bg-[#FD761A] hover:bg-[#e05d04] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <span>Solicitar acceso de instructor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors"
              >
                Conocer planes y volumen
              </Link>
            </div>
          </div>

          {/* Right Column: Instructor Photo & Testimonial */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative bg-stone-900">
              <div className="relative h-72 sm:h-80 w-full">
                <Image
                  src="/images/courses/course-iso9001.svg"
                  alt="Instructor y docente en taller técnico"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6 bg-[#EFF4FF] text-stone-900">
                <blockquote className="text-sm sm:text-base font-semibold italic text-stone-800 leading-snug">
                  &ldquo;Certifox eliminó semanas de burocracia para emitir credenciales a nuestros técnicos mecánicos.&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FD761A] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    MV
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Ing. Marco Viteri</p>
                    <p className="text-[11px] font-medium text-stone-500">
                      Director Técnico - MaqOps Latam
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

