"use client";

import { useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  ChevronDown,
} from "lucide-react";
import { mockTickets } from "@/data/student";

export function HelpDeskView() {
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("laboratorio");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject("");
      setMessage("");
    }, 4000);
  };

  const studentFaqs = [
    {
      q: "¿Cuánto tiempo demora la confirmación de mi comprobante de pago?",
      a: "El equipo docente o administrativo valida los comprobantes en un plazo promedio de 2 a 12 horas hábiles. Una vez aprobado, el acceso a los módulos se activa de inmediato.",
    },
    {
      q: "¿Cómo descargo mi certificado oficial una vez aprobado el curso?",
      a: "Al alcanzar el 100% de las lecciones y aprobar la evaluación final con nota mínima de 70/100, la pestaña 'Mis certificados' generará tu documento con código inmutable y sello QR SHA-256.",
    },
    {
      q: "¿Qué sucede si no puedo ingresar a una sesión en vivo o sincrónica?",
      a: "Todas las clases grabadas quedan disponibles en el aula virtual durante los 12 meses posteriores a tu matrícula, junto con el material descargable y las diapositivas técnicas.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-[#FD761A]" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1C2F] tracking-tight">
            Mesa de Ayuda y Tutoría
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#45474C] mt-1">
          Canal directo de asistencia técnica, consultas académicas con docentes y validación de inscripciones.
        </p>
      </div>

      {/* Ticket History */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-[#0D1C2F]">
          Tus Consultas y Tickets Recientes
        </h3>

        <div className="space-y-3">
          {mockTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 rounded-xl bg-[#F8F9FF] border border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#FD761A]">
                    {ticket.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.status === "answered"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-stone-100 text-[#45474C]"
                    }`}
                  >
                    {ticket.statusLabel}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#0D1C2F]">
                  {ticket.subject}
                </h4>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#45474C]">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{ticket.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create New Ticket */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-[#0D1C2F] flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#FD761A]" />
          <span>Crear Nueva Consulta al Instructor o Soporte</span>
        </h3>

        {submitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ticket recibido. Un tutor responderá en un plazo menor a 2 horas.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0D1C2F]">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-medium focus:outline-none focus:bg-white"
                >
                  <option value="laboratorio">Duda técnica / Laboratorios</option>
                  <option value="matricula">Comprobante / Validación de matrícula</option>
                  <option value="certificado">Emisión de Certificado Oficial</option>
                  <option value="plataforma">Acceso a lecciones y videos</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0D1C2F]">
                  Asunto breve
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: Consulta sobre prueba del Módulo 3"
                  required
                  className="w-full h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-medium focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#0D1C2F]">
                Detalle de la consulta
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe aquí tu duda o adjunta referencias para que el docente te oriente..."
                required
                rows={4}
                className="w-full p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-medium focus:outline-none focus:bg-white resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#FD761A] hover:bg-[#E05E09] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Consulta</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Student FAQ */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 space-y-3">
        <h3 className="text-sm font-bold text-[#0D1C2F] pb-2 border-b border-stone-100">
          Preguntas Frecuentes del Estudiante
        </h3>

        <div className="space-y-2">
          {studentFaqs.map((faq) => (
            <details
              key={faq.q}
              className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/70 text-xs group transition-all"
            >
              <summary className="font-bold text-[#0D1C2F] cursor-pointer flex items-center justify-between list-none">
                <span>{faq.q}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-2 text-[#45474C] leading-relaxed pt-2 border-t border-stone-200/50">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
