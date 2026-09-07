"use client";

import { useState } from "react";
import { ChevronDown, AlertTriangle, Mail } from "lucide-react";

export function VerificationFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "¿Qué debo hacer si un certificado físico no cuenta con código CFX?",
      a: "Todos los certificados expedidos bajo el ecosistema Certifox desde enero de 2024 cuentan obligatoriamente con un código registral y un QR de seguridad. Si posees un documento previo sin este código, puedes solicitar la migración y revalidación digital contactando al centro de formación emisor o mediante el botón de asistencia en el pie de página.",
    },
    {
      q: "¿Cuánto tiempo permanece registrada una credencial en los servidores públicos?",
      a: "El registro es permanente e indefinido. Incluso cuando una certificación específica de seguridad industrial o técnica tenga una vigencia temporal (ej. 1 o 2 años para cursos de trabajo en altura o espacios confinados), el historial de emisión original permanece auditable como antecedente profesional vitalicio.",
    },
    {
      q: "¿Cómo se garantiza que un diploma PDF descargado no haya sido editado?",
      a: "Nuestra plataforma utiliza certificados digitales criptográficos Adobe CDS / AATL embebidos en el documento. Al abrir el archivo en lectores compatibles, el visor muestra una cinta verde confirmando la autenticidad del emisor. Si el contenido fue alterado posteriormente, el lector indicará inmediatamente que la firma es inválida.",
    },
    {
      q: "¿Puedo verificar credenciales emitidas en el extranjero?",
      a: "Sí. Cualquier centro de capacitación acreditado bajo la red de FoxCode International opera bajo el mismo registro global. El código CFX resolverá los datos del alumno y de la sede correspondiente con su huso horario y país de procedencia.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-16 md:py-24 bg-[#FFFDF9]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#45474C] uppercase tracking-wider">
            Centro de Soporte al Auditor
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1C2F] tracking-tight">
            Preguntas frecuentes sobre la verificación
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-white border border-stone-200/80 rounded-2xl shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-[#0D1C2F] hover:bg-stone-50/60 transition-colors gap-4"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#FD761A]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#45474C] leading-relaxed border-t border-stone-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* HR / Corporate Direct Contact Box */}
        <div className="bg-[#EFF4FF] border border-[#D5E3FD] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#0D1C2F] flex items-center justify-center sm:justify-start gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#FD761A]" />
              <span>¿Dudas con una credencial o sospecha de adulteración?</span>
            </h4>
            <p className="text-xs text-[#45474C]">
              Nuestro equipo de auditoría registral emite informes forenses en un
              plazo menor a 24 horas.
            </p>
          </div>
          <a
            href="mailto:auditoria@certifox.io?subject=Reporte%20de%20Anomalía%20Registral"
            className="px-4 py-2 bg-white text-[#0D1C2F] font-bold text-xs sm:text-sm rounded-xl shadow-xs border border-stone-200 hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-[#FD761A]" />
            <span>Reportar anomalía registral</span>
          </a>
        </div>
      </div>
    </section>
  );
}
