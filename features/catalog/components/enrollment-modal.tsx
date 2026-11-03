"use client";

import { useState } from "react";
import {
  FileEdit,
  X,
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
  Loader2,
  Clock,
} from "lucide-react";
import { Course } from "../types";
import { requestEnrollmentAction } from "../actions";
import { toast } from "sonner";

interface PaymentEnrollmentData {
  enrollmentId: string;
  status: string;
  courseTitle: string;
  instructions: {
    yapeNumber: string;
    yapeName: string;
    bcpAccount: string;
    bcpCci: string;
    whatsappUrl: string;
    amountUsd: number;
    amountPen: number;
  };
}

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
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentEnrollmentData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await requestEnrollmentAction({
        courseId: course.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      if (!response.success || !response.data) {
        toast.error(response.error || "No se pudo registrar la solicitud");
        setIsLoading(false);
        return;
      }

      setPaymentData(response.data as PaymentEnrollmentData);
      setIsSubmitted(true);
      toast.success("Solicitud de matrícula generada");
    } catch {
      toast.error("Ocurrió un error al procesar la matrícula");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setPaymentData(null);
    setFormData({ name: "", email: "", phone: "" });
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
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 sm:p-8 flex flex-col gap-5 border border-stone-200/80 max-h-[90vh] overflow-y-auto"
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
                Solicitud de Matrícula
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
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSubmitted ? (
          <>
            {/* Nota de negocio */}
            <div className="p-3.5 rounded-xl bg-[#EFF4FF] text-stone-700 text-xs leading-relaxed border border-[#D5E3FD]/50">
              Ingresa tus datos para registrar tu solicitud. Tu matrícula quedará en estado{" "}
              <strong className="text-[#FD761A]">«Pendiente de activación»</strong>. Al enviar, recibirás las instrucciones para coordinar el abono manual con el docente.
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="student_name"
                  className="text-xs font-semibold text-stone-900"
                >
                  Nombre completo para la credencial
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
                  Correo electrónico
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

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="student_phone"
                  className="text-xs font-semibold text-stone-900"
                >
                  WhatsApp / Teléfono de contacto
                </label>
                <input
                  id="student_phone"
                  type="tel"
                  placeholder="+51 987 654 321"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FD761A]/30 focus:border-[#FD761A]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] disabled:opacity-60 text-white text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>Solicitar Matrícula</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* AC-11 / RF-20: Instrucciones de pago manual con estado PENDING */
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <Clock className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Matrícula Pendiente de Activación
                </h4>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Tu solicitud quedó registrada. El acceso a las lecciones del aula se activará una vez que el docente confirme el abono.
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="font-bold text-stone-700">Canales de abono manual:</span>
                <span className="text-[11px] font-extrabold text-[#FD761A]">
                  S/ {paymentData?.instructions?.amountPen || 680} PEN / $180 USD
                </span>
              </div>

              {/* Yape / Plin */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-stone-200">
                <div>
                  <p className="font-bold text-stone-900">Yape / Plin</p>
                  <p className="text-[11px] text-stone-500">
                    Número: <strong>{paymentData?.instructions?.yapeNumber || "999-999-999"}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(paymentData?.instructions?.yapeNumber || "999-999-999", "yape")
                  }
                  className="p-1.5 rounded-md hover:bg-stone-100 text-stone-500 transition-colors"
                  title="Copiar número"
                >
                  {copiedKey === "yape" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Transferencia BCP */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-stone-200">
                <div>
                  <p className="font-bold text-stone-900">BCP Soles</p>
                  <p className="text-[11px] text-stone-500 font-mono">
                    {paymentData?.instructions?.bcpAccount || "193-98402194-0-12"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(paymentData?.instructions?.bcpAccount || "193-98402194-0-12", "bcp")
                  }
                  className="p-1.5 rounded-md hover:bg-stone-100 text-stone-500 transition-colors"
                  title="Copiar cuenta"
                >
                  {copiedKey === "bcp" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón WhatsApp de notificación */}
            {paymentData?.instructions?.whatsappUrl && (
              <a
                href={paymentData.instructions.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Avisar abono por WhatsApp</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cerrar y continuar explorando
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
