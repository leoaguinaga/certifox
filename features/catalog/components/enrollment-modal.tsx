"use client";

import { useState } from "react";
import { FileEdit, X, CheckCircle2, ArrowRight } from "lucide-react";
import { Course } from "../types";

interface EnrollmentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export function EnrollmentModal({
  course,
  isOpen,
  onClose,
}: EnrollmentModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setFormData({ name: "", email: "", phone: "", country: "" });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 sm:p-8 flex flex-col gap-5 border border-stone-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#FD761A]">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                Solicitar Matrícula
              </h3>
              <span className="text-xs text-stone-500 font-medium block truncate max-w-xs">
                {course.title}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSubmitted ? (
          <>
            {/* Business Policy Explanatory Note */}
            <div className="p-3.5 rounded-xl bg-[#EFF4FF] text-stone-700 text-xs leading-relaxed border border-[#D5E3FD]/50">
              Ingresa tus datos para registrar tu postulación. El equipo del{" "}
              <strong>{course.instructor.name}</strong> te contactará por correo/WhatsApp con los canales de abono local (
              <strong>{course.priceUsd} USD</strong>) para activar tu aula virtual de inmediato.
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="student_name"
                  className="text-xs font-semibold text-stone-900"
                >
                  Nombre completo para el certificado
                </label>
                <input
                  id="student_name"
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza Salas"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FD761A]/30 focus:border-[#FD761A]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="student_email"
                  className="text-xs font-semibold text-stone-900"
                >
                  Correo electrónico de contacto
                </label>
                <input
                  id="student_email"
                  type="email"
                  required
                  placeholder="carlos.mendoza@empresa.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FD761A]/30 focus:border-[#FD761A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="student_phone"
                    className="text-xs font-semibold text-stone-900"
                  >
                    WhatsApp / Teléfono
                  </label>
                  <input
                    id="student_phone"
                    type="tel"
                    required
                    placeholder="+51 987 654 321"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FD761A]/30 focus:border-[#FD761A]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="student_country"
                    className="text-xs font-semibold text-stone-900"
                  >
                    País de residencia
                  </label>
                  <input
                    id="student_country"
                    type="text"
                    required
                    placeholder="Perú / Chile / México"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FD761A]/30 focus:border-[#FD761A]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] text-white text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-1.5"
                >
                  <span>Enviar Solicitud</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Confirmation feedback state */
          <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-stone-900">
              ¡Solicitud Registrada!
            </h4>
            <p className="text-xs text-stone-600 max-w-sm leading-relaxed">
              Hemos notificado a la coordinación académica del curso. En breve recibirás los datos de abono bancario en{" "}
              <strong className="text-stone-900">{formData.email || "tu correo"}</strong>.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-[#151B2A] text-white text-xs font-bold hover:bg-stone-800 transition-colors"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
