"use client";

import { useState } from "react";
import {
  Handshake,
  ArrowRight,
  Infinity as InfinityIcon,
  CheckSquare,
  QrCode,
  Headset,
  Shield,
  Lock,
  Zap,
} from "lucide-react";
import { Course } from "../types";
import { EnrollmentModal } from "./enrollment-modal";

interface StickyEnrollmentCardProps {
  course: Course;
}

export function StickyEnrollmentCard({ course }: StickyEnrollmentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <aside className="lg:col-span-4 sticky top-24 flex flex-col gap-4">
        {/* Main Enrollment Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-stone-200/80 relative overflow-hidden">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FD761A]" />

          {/* Price Block */}
          <div className="flex flex-col mb-5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              Inversión del programa
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-stone-900 font-mono">
                {course.priceUsd} USD
              </span>
              <span className="text-xs text-stone-500 font-medium">
                pago único
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              Coordinado directamente con el centro acreditador. Sin cobros automáticos ocultos.
            </p>
          </div>

          {/* Notice Banner: Manual Confirmation Protocol */}
          <div className="rounded-xl bg-[#EFF4FF] p-3.5 mb-5 flex items-start gap-2.5 border border-[#D5E3FD]/60">
            <Handshake className="w-5 h-5 text-[#FD761A] shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-stone-900">
                Matrícula con confirmación manual
              </span>
              <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                Envía tu solicitud. El instructor o entidad coordinará tu pago y activará tu acceso inmediato a las clases.
              </p>
            </div>
          </div>

          {/* Primary CTA Action Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3.5 px-4 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] text-white text-xs sm:text-sm uppercase tracking-wider font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Solicitar matrícula en este curso</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Benefits Checklist */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col gap-3">
            <span className="text-xs font-bold text-stone-900">
              Esta acreditación incluye:
            </span>

            {course.includes ? (
              course.includes.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-stone-600">
                  <CheckSquare className="w-4 h-4 text-[#FD761A] shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-start gap-2 text-xs text-stone-600">
                  <InfinityIcon className="w-4 h-4 text-[#FD761A] shrink-0 mt-0.5" />
                  <span>Acceso vitalicio al contenido del curso y actualizaciones 2025</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-stone-600">
                  <CheckSquare className="w-4 h-4 text-[#FD761A] shrink-0 mt-0.5" />
                  <span>Examen de acreditación oficial con 2 intentos incluidos</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-stone-600">
                  <QrCode className="w-4 h-4 text-[#FD761A] shrink-0 mt-0.5" />
                  <span>Certificado con QR público verificable y descargable en PDF</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-stone-600">
                  <Headset className="w-4 h-4 text-[#FD761A] shrink-0 mt-0.5" />
                  <span>Soporte directo del docente mediante foro de consultas técnicas</span>
                </div>
              </>
            )}
          </div>

          {/* Institutional Guarantee Stamp */}
          <div className="mt-6 p-3 rounded-xl bg-[#f8f9ff] border border-stone-200 flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[#151B2A] shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-stone-900">
                Garantía Académica Foxcode
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                Protocolo auditado bajo estándar internacional
              </span>
            </div>
          </div>
        </div>

        {/* Micro Security Info Widget */}
        <div className="p-3.5 rounded-xl bg-[#EFF4FF]/70 border border-stone-200/60 flex items-center justify-between text-xs text-stone-600 font-medium">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-stone-500" />
            <span>Sin pasarelas ni tarjetas</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#FD761A]" />
            <span>Activación en &lt; 2h</span>
          </span>
        </div>
      </aside>

      {/* Modal instance */}
      <EnrollmentModal
        course={course}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
