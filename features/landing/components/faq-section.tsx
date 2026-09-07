"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Headphones,
  ShieldCheck,
  Wallet,
  CalendarCheck,
  GraduationCap,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    id: "faq-1",
    question: "¿Cómo se valida la autenticidad de un certificado?",
    icon: ShieldCheck,
    answer:
      "Cada certificado emitido cuenta con un código alfanumérico inmutable y un código QR que apunta a la base de datos oficial de Certifox. Cualquier empleador puede consultar el enlace público y validar las horas lectivas, instructor y fecha de expedición en tiempo real.",
  },
  {
    id: "faq-2",
    question: "¿Por qué no utilizan pasarelas de pago automatizadas?",
    icon: Wallet,
    answer:
      "Nuestros instructores y centros asociados gestionan directamente sus pagos mediante transferencias locales o convenios corporativos. Esto reduce comisiones bancarias del 7% al 0% y permite validar cupos técnicos de forma rigurosa.",
  },
  {
    id: "faq-3",
    question: "¿Los certificados tienen fecha de caducidad?",
    icon: CalendarCheck,
    answer:
      "La credencial emitida en Certifox permanece registrada permanentemente. No obstante, ciertos cursos de seguridad industrial (como Minería o Maquinaria) exhiben un período de recertificación recomendado según normativas laborales vigentes.",
  },
  {
    id: "faq-4",
    question: "¿Cómo puedo publicar mis propios cursos como instructor?",
    icon: GraduationCap,
    answer:
      "Debes postular en la sección de instructores presentando tus acreditaciones técnicas o institucionales. Tras la revisión del comité técnico, tendrás acceso a tu panel de control para enrolar alumnos y emitir credenciales.",
  },
];

export function FaqSection() {
  // Start with first FAQ open by default like in mockup
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-20 bg-[#FFFDF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Heading & Support Contact Box */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF4FF] text-[#FD761A] mb-4 border border-stone-200/60 shadow-xs">
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-wider">
                Resolvemos tus dudas
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-3">
              Preguntas Frecuentes
            </h2>

            <p className="text-sm sm:text-base text-stone-600 mb-8 leading-relaxed">
              Descubre cómo funciona la validación descentralizada, los cobros directos sin intermediarios y las normativas que respaldan cada certificado emitido en Certifox.
            </p>

            {/* Support Box */}
            <div className="w-full bg-[#EFF4FF] p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#FD761A]">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-stone-900">
                ¿Tienes una consulta específica?
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Habla directamente con nuestro equipo de soporte institucional y auditoría técnica para resolver cualquier inquietud.
              </p>
              <Link
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FD761A] hover:text-[#e05d04] mt-1 group"
              >
                <span>Contactar soporte institucional</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Accordion Items */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {FAQS.map((faq) => {
              const isOpen = openId === faq.id;
              const Icon = faq.icon;

              return (
                <div
                  key={faq.id}
                  className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow border border-stone-200/80"
                >
                  <button
                    type="button"
                    onClick={() => toggle(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-start justify-between gap-4 text-left cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center text-[#FD761A] shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-stone-900 pt-1 leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-stone-400 shrink-0 mt-1.5 transition-transform duration-200",
                        isOpen && "rotate-180 text-stone-700"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-3.5 pl-12 pr-2 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3 animate-in fade-in duration-200">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
