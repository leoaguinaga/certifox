"use client";

import { useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  Send,
  Clock,
  Plus,
  LifeBuoy,
} from "lucide-react";
import { toast } from "sonner";
import { TicketDto } from "../types";
import { createTicketServerAction } from "../actions";

interface HelpDeskViewProps {
  initialTickets: TicketDto[];
}

export function HelpDeskView({ initialTickets }: HelpDeskViewProps) {
  const [tickets, setTickets] = useState<TicketDto[]>(initialTickets);
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Soporte Técnico");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Soporte Técnico",
    "Aula Virtual y Reproductor",
    "Validación de Pagos y Matrícula",
    "Certificados y Verificación QR",
    "Tutoría y Consultas al Docente",
  ];

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Por favor completa todos los campos del ticket.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createTicketServerAction({
        subject,
        category,
        message,
      });

      if (!res.success || !res.ticket) {
        toast.error(res.error || "No se pudo registrar el ticket.");
        return;
      }

      setTickets([res.ticket, ...tickets]);
      toast.success("Ticket de soporte registrado correctamente.");
      setShowModal(false);
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Error inesperado al crear el ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentFaqs = [
    {
      q: "¿Cuánto tiempo demora la confirmación de mi comprobante de pago?",
      a: "El docente o administrador valida los comprobantes en un plazo promedio de 2 a 12 horas hábiles. Una vez confirmado en el campus, el acceso a las lecciones se activa de inmediato.",
    },
    {
      q: "¿Cómo descargo mi certificado oficial una vez aprobado el curso?",
      a: "Al completar el 100% de las lecciones y aprobar la tarea evaluada con nota mínima de 14/20, el instructor emitirá tu certificado con código único inmutable y código QR escaneable directo a la verificación pública.",
    },
    {
      q: "¿Dónde consulto los datos oficiales que figurarán en mi diploma?",
      a: "En la sección 'Mi Perfil' puedes revisar tus nombres completos registrados y verificar que tu documento de identidad esté correctamente consignado.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#FD761A]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1C2F] tracking-tight">
              Mesa de Ayuda y Tutoría
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#45474C] mt-1">
            Canal directo de asistencia técnica, consultas académicas y soporte de plataforma.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#FD761A] hover:bg-[#E05E09] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Ticket de Ayuda</span>
        </button>
      </div>

      {/* Ticket History */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#FD761A]" />
            <h3 className="text-sm sm:text-base font-bold text-[#0D1C2F]">
              Historial de Tickets Registrados ({tickets.length})
            </h3>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-stone-200 rounded-xl space-y-3">
            <LifeBuoy className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-xs font-semibold text-stone-600">
              No tienes ningún ticket de ayuda abierto actualmente.
            </p>
            <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
              Si tienes problemas con la reproducción de videos, confirmación de pagos o certificados, crea un nuevo ticket.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 rounded-xl bg-[#F8F9FF] border border-stone-200/80 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#FD761A]">
                      {ticket.id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                      {ticket.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ticket.status === "OPEN"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {ticket.status === "OPEN" ? "Abierto • En atención" : "Cerrado / Resuelto"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#45474C]">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{new Date(ticket.createdAt).toLocaleDateString("es-PE")}</span>
                  </div>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-[#0D1C2F]">
                  {ticket.subject}
                </h4>
                <p className="text-xs text-[#45474C] leading-relaxed whitespace-pre-wrap">
                  {ticket.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-[#0D1C2F]">
          Preguntas Frecuentes de la Plataforma
        </h3>
        <div className="space-y-3">
          {studentFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-stone-100 bg-[#FFFDF9] space-y-1"
            >
              <h4 className="text-xs sm:text-sm font-bold text-[#0D1C2F]">
                {faq.q}
              </h4>
              <p className="text-xs text-[#45474C] leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-[#0D1C2F] text-base">
                Registrar Nuevo Ticket de Ayuda
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0D1C2F]">
                  Categoría de la Consulta
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FD761A]/30"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0D1C2F]">
                  Asunto Breve
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Ej. Problema al reproducir video del Módulo 2"
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FD761A]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0D1C2F]">
                  Detalle o Descripción del Problema
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe detalladamente lo que ocurre para que el equipo pueda asistirte..."
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FD761A]/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 font-bold text-xs hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#FD761A] hover:bg-[#E05E09] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Enviando..." : "Enviar Ticket"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
