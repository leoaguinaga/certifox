import { Certificate } from "@/features/certificates/types";
import { AlertTriangle, ShieldAlert, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CertificateRevokedCardProps {
  certificate: Certificate;
  onResetState?: () => void;
}

export function CertificateRevokedCard({
  certificate,
  onResetState,
}: CertificateRevokedCardProps) {
  const { revocationDetails } = certificate;

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border-l-4 border-l-rose-600 border border-stone-200/80 space-y-6">
      {/* Header status pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold tracking-wide border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            <span>● Estado: Credencial Revocada / No Vigente</span>
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-rose-700 text-xs font-bold border border-rose-100">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Invalidez Operativa Declarada</span>
          </span>
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#45474C]">
          Motivo: {revocationDetails?.reason || "Revocación Administrativa"}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        {/* Left Column: Forensic Audit */}
        <div className="lg:col-span-8 space-y-5">
          <div>
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-widest block mb-1">
              Auditoría Forense de Estado
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0D1C2F]">
              {certificate.course.title}
            </h3>
            <p className="text-sm text-[#45474C] mt-2 leading-relaxed">
              Esta credencial ({certificate.code}) fue emitida previamente para{" "}
              <strong>{certificate.student.name}</strong> pero ha sido{" "}
              <strong className="text-rose-600">revocada formalmente</strong>{" "}
              por la autoridad reguladora y el comité de acreditación
              competente.
            </p>
          </div>

          {/* Critical Warning Callout */}
          <div className="p-4 sm:p-5 bg-rose-50/80 border border-rose-200 rounded-xl space-y-2 text-rose-950 text-xs sm:text-sm">
            <div className="font-bold flex items-center gap-1.5 text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Instrucción Crítica para Oficiales de Seguridad y Supervisores de
                Contrato
              </span>
            </div>
            <p className="leading-relaxed">
              {revocationDetails?.instruction ||
                "No se autoriza el ejercicio de actividades bajo esta serie registral. Cualquier documento impreso carece de validez legal."}
            </p>
          </div>

          {/* Resolution Metadatas */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-xs text-[#45474C]">
            <div>
              <strong>Fecha de Revocación:</strong>{" "}
              {revocationDetails?.revocationDate || "31 de Enero de 2025"}
            </div>
            <div>
              <strong>Resolución Técnica:</strong>{" "}
              {revocationDetails?.resolution || "REV-MAQOPS-2025-09"}
            </div>
            <div>
              <strong>Responsable:</strong>{" "}
              {revocationDetails?.auditorResponsible ||
                "Comité Técnico de Calidad"}
            </div>
          </div>
        </div>

        {/* Right Column: Code Struck and Actions */}
        <div className="lg:col-span-4 bg-[#EFF4FF]/60 border border-[#D5E3FD] p-6 rounded-2xl flex flex-col justify-between text-center space-y-6">
          <div>
            <span className="text-[11px] font-bold text-[#45474C] uppercase tracking-wider block mb-2">
              Código Auditado
            </span>
            <div className="inline-block px-4 py-2 rounded-xl bg-white border border-rose-200 font-mono text-xl text-rose-600 font-bold line-through tracking-wider shadow-xs">
              {certificate.code}
            </div>
            <p className="text-xs text-[#45474C] mt-3">
              Firma digital bloqueada por la Autoridad Certificadora.
            </p>
          </div>

          <div className="space-y-2">
            <Link
              href="/cursos"
              className="w-full h-10 rounded-xl bg-[#0D1C2F] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-stone-800 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#FD761A]" />
              <span>Solicitar Recertificación</span>
            </Link>

            {onResetState && (
              <button
                type="button"
                onClick={onResetState}
                className="w-full h-10 rounded-xl bg-white text-[#0D1C2F] text-xs sm:text-sm font-semibold border border-stone-200 flex items-center justify-center gap-1.5 hover:bg-stone-50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la Credencial Válida</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
