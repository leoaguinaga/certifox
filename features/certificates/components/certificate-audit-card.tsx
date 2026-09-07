"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Certificate } from "@/features/certificates/types";
import { CertificateRevokedCard } from "./certificate-revoked-card";
import {
  ShieldCheck,
  Shield,
  Lock,
  Database,
  BadgeCheck,
  CheckCircle2,
  Download,
  Link as LinkIcon,
  Check,
  Search,
  Info,
  Printer,
  Building2,
  Code,
} from "lucide-react";

interface CertificateAuditCardProps {
  certificate: Certificate;
  alternateRevokedCertificate?: Certificate | null;
}

export function CertificateAuditCard({
  certificate,
  alternateRevokedCertificate,
}: CertificateAuditCardProps) {
  const router = useRouter();
  const [quickCode, setQuickCode] = useState(certificate.code);
  const [copied, setCopied] = useState(false);
  const [showRevokedDemo, setShowRevokedDemo] = useState(
    certificate.status === "revocado"
  );

  const handleQuickReverify = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickCode.trim().toUpperCase();
    if (!clean) return;
    router.push(`/verificar/${encodeURIComponent(clean)}`);
  };

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const activeCert = showRevokedDemo && alternateRevokedCertificate
    ? alternateRevokedCertificate
    : certificate;

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Status & Quick Re-Verification Bar */}
      <section className="w-full bg-[#EFF4FF] border-b border-[#D5E3FD] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#D5E3FD] text-[#0D1C2F]">
              <ShieldCheck className="w-5 h-5 text-[#FD761A]" />
            </span>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[#0D1C2F] leading-tight">
                Validador Oficial de Credenciales Académicas y Técnicas
              </h1>
              <p className="text-xs text-[#45474C] flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Respuesta en tiempo real: 140ms • Nodo Criptográfico Activo
                  (Red Lima-1)
                </span>
              </p>
            </div>
          </div>

          {/* Quick Query Input */}
          <form
            onSubmit={handleQuickReverify}
            className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value)}
                placeholder="Ingrese código de certificado..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-white text-[#0D1C2F] font-mono text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#FD761A] border border-stone-200 shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-[#151B2A] hover:bg-stone-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verificar otra</span>
            </button>
          </form>
        </div>
      </section>

      {/* Main Validation View Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full space-y-8">
        {showRevokedDemo && alternateRevokedCertificate ? (
          <CertificateRevokedCard
            certificate={alternateRevokedCertificate}
            onResetState={() => setShowRevokedDemo(false)}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 lg:p-10 relative overflow-hidden border border-stone-200/80">
          {/* Security Watermark Seal */}
          <div className="absolute -right-16 -top-16 w-80 h-80 opacity-[0.03] pointer-events-none select-none">
            <svg
              className="w-full h-full text-stone-900 fill-current"
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                fill="none"
                r="90"
                stroke="currentColor"
                strokeWidth="6"
              />
              <circle
                cx="100"
                cy="100"
                fill="none"
                r="75"
                stroke="currentColor"
                strokeDasharray="4,4"
                strokeWidth="2"
              />
              <path d="M100 25 L120 75 L175 75 L130 110 L150 160 L100 130 L50 160 L70 110 L25 75 L80 75 Z" />
            </svg>
          </div>

          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wide border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>{activeCert.statusLabel}</span>
              </span>
              {activeCert.complianceStandards.map((std) => (
                <span
                  key={std}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFF4FF] text-[#45474C] text-xs font-semibold border border-[#D5E3FD]"
                >
                  <Shield className="w-3.5 h-3.5 text-[#FD761A]" />
                  <span>{std}</span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[#45474C] text-[11px] font-bold uppercase tracking-wider">
              <Database className="w-3.5 h-3.5 text-[#FD761A]" />
              <span>Ledger ID: {activeCert.cryptography.ledgerId}</span>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            {/* Left Column: Official details */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[11px] font-bold text-[#9D4300] uppercase tracking-widest block mb-1">
                  Registro Oficial de Alumno
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1C2F] tracking-tight">
                  {activeCert.student.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#45474C]">
                  <span className="inline-flex items-center gap-1">
                    <BadgeCheck className="w-4 h-4 text-stone-500" />
                    <span>Doc. Identidad: </span>
                    <strong className="text-[#0D1C2F] font-mono">
                      {activeCert.student.documentMasked}
                    </strong>
                    <span>({activeCert.student.documentLawNotice})</span>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Identidad Biométrica Validada</span>
                  </span>
                </div>
              </div>

              {/* Course Specialty Panel */}
              <div className="bg-[#EFF4FF] p-6 rounded-2xl border border-[#D5E3FD] space-y-3">
                <span className="text-[11px] font-bold text-[#45474C] uppercase tracking-wider block">
                  Especialidad Certificada
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#0D1C2F]">
                  <Link
                    href={`/cursos/${activeCert.course.slug}`}
                    className="hover:text-[#FD761A] transition-colors"
                  >
                    {activeCert.course.title}
                  </Link>
                </h3>
                <p className="text-xs sm:text-sm text-[#45474C] leading-relaxed">
                  {activeCert.course.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-[11px] font-bold text-[#45474C] uppercase tracking-wider">
                      Entidad Acreditadora
                    </span>
                    <span className="font-bold text-[#0D1C2F]">
                      {activeCert.course.issuingEntity}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-[11px] font-bold text-[#45474C] uppercase tracking-wider">
                      Instructor Titular
                    </span>
                    <span className="font-bold text-[#0D1C2F]">
                      {activeCert.course.instructor.name}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {activeCert.course.instructor.license}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-[#F8F9FF] border border-stone-200/80 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-[#45474C] uppercase tracking-wider block">
                    Calificación Final
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-[#0D1C2F]">
                      {activeCert.evaluation.finalGrade.toFixed(1)}
                    </span>
                    <span className="text-xs text-stone-500">
                      / {activeCert.evaluation.maxGrade.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                    {activeCert.evaluation.gradeScale}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-[#45474C] uppercase tracking-wider block">
                    Carga Lectiva
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-[#0D1C2F]">
                      {activeCert.evaluation.hours}
                    </span>
                    <span className="text-xs text-stone-500">horas</span>
                  </div>
                  <span className="text-xs text-[#45474C]">
                    {activeCert.evaluation.hoursDescription}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-[#45474C] uppercase tracking-wider block">
                    Emisión & Validez
                  </span>
                  <span className="text-sm font-bold text-[#0D1C2F] block mt-1">
                    {activeCert.evaluation.issueDate}
                  </span>
                  <span className="text-xs text-[#45474C]">
                    {activeCert.evaluation.validity}
                  </span>
                </div>
              </div>

              {/* Cryptographic Fingerprint SHA-256 */}
              <div className="bg-[#151B2A] text-stone-200 p-5 rounded-2xl space-y-2 font-mono text-xs border border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFB690]">
                    HUELLA CRIPTOGRÁFICA SHA-256 (INMUTABLE)
                  </span>
                  <Lock className="w-3.5 h-3.5 text-[#FD761A]" />
                </div>
                <p className="text-[11px] break-all font-mono tracking-tight bg-black/40 p-2.5 rounded-lg text-emerald-400/90 border border-stone-800 select-all">
                  {activeCert.cryptography.sha256}
                </p>
                <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 pt-1 font-sans">
                  <span>Timestamp UTC: {activeCert.cryptography.timestampUtc}</span>
                  <span>
                    Bloque Transaccional:{" "}
                    {activeCert.cryptography.ledgerBlock}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Code badge, QR, Actions */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-6 bg-[#EFF4FF]/70 border border-[#D5E3FD] p-6 rounded-2xl">
              <div className="text-center space-y-4">
                <span className="text-[11px] font-bold text-[#45474C] uppercase tracking-wider block">
                  Código Único de Auditoría
                </span>
                <div className="inline-block px-4 py-2 rounded-xl bg-white border border-[#D5E3FD] font-mono font-bold text-xl text-[#0D1C2F] tracking-wider shadow-xs">
                  {activeCert.code}
                </div>

                {/* SVG QR Code */}
                <div className="w-48 h-48 mx-auto p-3.5 bg-white rounded-2xl shadow-sm border border-stone-200 flex items-center justify-center relative">
                  <svg
                    className="w-full h-full"
                    fill="none"
                    viewBox="0 0 160 160"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="10"
                      y="10"
                      width="40"
                      height="40"
                      rx="4"
                      fill="#0B1220"
                    />
                    <rect
                      x="18"
                      y="18"
                      width="24"
                      height="24"
                      fill="#FFFFFF"
                    />
                    <rect
                      x="22"
                      y="22"
                      width="16"
                      height="16"
                      fill="#0B1220"
                    />
                    <rect
                      x="110"
                      y="10"
                      width="40"
                      height="40"
                      rx="4"
                      fill="#0B1220"
                    />
                    <rect
                      x="118"
                      y="18"
                      width="24"
                      height="24"
                      fill="#FFFFFF"
                    />
                    <rect
                      x="122"
                      y="22"
                      width="16"
                      height="16"
                      fill="#0B1220"
                    />
                    <rect
                      x="10"
                      y="110"
                      width="40"
                      height="40"
                      rx="4"
                      fill="#0B1220"
                    />
                    <rect
                      x="18"
                      y="118"
                      width="24"
                      height="24"
                      fill="#FFFFFF"
                    />
                    <rect
                      x="22"
                      y="122"
                      width="16"
                      height="16"
                      fill="#0B1220"
                    />
                    {/* Simulated data pattern */}
                    <rect x="60" y="15" width="8" height="8" fill="#0B1220" />
                    <rect x="75" y="15" width="12" height="8" fill="#0B1220" />
                    <rect x="60" y="30" width="15" height="6" fill="#0B1220" />
                    <rect x="85" y="28" width="10" height="12" fill="#0B1220" />
                    <rect x="65" y="45" width="8" height="15" fill="#0B1220" />
                    <rect x="15" y="65" width="8" height="8" fill="#0B1220" />
                    <rect x="30" y="60" width="12" height="12" fill="#0B1220" />
                    <rect x="15" y="80" width="15" height="6" fill="#0B1220" />
                    <rect x="35" y="78" width="10" height="14" fill="#0B1220" />
                    {/* Fox orange badge in center */}
                    <rect
                      x="65"
                      y="65"
                      width="30"
                      height="30"
                      rx="6"
                      fill="#FD761A"
                    />
                    <path
                      d="M72 73 L80 87 L88 73 L80 77 Z"
                      fill="#FFFFFF"
                    />
                    <rect x="105" y="65" width="14" height="8" fill="#0B1220" />
                    <rect x="125" y="70" width="8" height="14" fill="#0B1220" />
                    <rect x="110" y="85" width="20" height="8" fill="#0B1220" />
                    <rect x="135" y="80" width="12" height="12" fill="#0B1220" />
                    <rect x="60" y="110" width="10" height="15" fill="#0B1220" />
                    <rect x="75" y="115" width="15" height="8" fill="#0B1220" />
                    <rect x="65" y="130" width="25" height="10" fill="#0B1220" />
                    <rect x="100" y="110" width="12" height="12" fill="#0B1220" />
                    <rect x="120" y="115" width="20" height="8" fill="#0B1220" />
                    <rect x="105" y="130" width="10" height="14" fill="#0B1220" />
                    <rect x="125" y="130" width="15" height="12" fill="#0B1220" />
                  </svg>
                </div>
                <p className="text-[11px] text-[#45474C] leading-tight">
                  Escanear con cualquier cámara de smartphone para auditar
                  autenticidad al instante.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href="#descargar-pdf"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      `Descargando diploma oficial en PDF firmado con certificado CDS: ${activeCert.code}.pdf`
                    );
                  }}
                  className="w-full h-11 px-4 rounded-xl bg-[#FD761A] hover:bg-[#E05E09] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF Oficial Firmado</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full h-11 px-4 rounded-xl bg-white text-[#0D1C2F] font-semibold text-xs sm:text-sm border border-stone-200 flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">¡Enlace copiado!</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4 text-stone-500" />
                      <span>Copiar Enlace de Verificación</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    `https://certifox.io/verificar/${activeCert.code}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 px-4 rounded-xl bg-white text-[#0D1C2F] font-semibold text-xs sm:text-sm border border-stone-200 flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span>Añadir a Perfil de LinkedIn</span>
                </a>
              </div>
            </div>
          </div>

          {/* Competencies Rubric Grid */}
          <div className="mt-8 pt-8 border-t border-stone-200/80 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h4 className="text-lg font-bold text-[#0D1C2F]">
                  Rúbrica de Competencias Evaluadas y Aprobadas
                </h4>
                <p className="text-xs text-[#45474C]">
                  Conforme a lineamientos sectoriales y estándares
                  internacionales de evaluación por competencias.
                </p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#EFF4FF] text-[#45474C] border border-[#D5E3FD] self-start md:self-auto">
                Auditado por Tercero Imparcial
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeCert.competencies.map((comp) => (
                <div
                  key={comp.title}
                  className="p-5 rounded-xl bg-[#EFF4FF] border border-[#D5E3FD] space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{comp.title}</span>
                    </div>
                    <p className="text-xs text-[#45474C] leading-relaxed">
                      {comp.description}
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] font-mono text-[#0D1C2F] font-bold border-t border-[#D5E3FD]/60">
                    {comp.score}
                  </div>
                </div>
              ))}
            </div>

            {/* Corporate Notice & Print */}
            <div className="p-5 rounded-2xl bg-[#F8F9FF] border border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-[#FD761A] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-[#0D1C2F]">
                    Validez Institucional para Contratistas y Mineras
                  </h5>
                  <p className="text-xs text-[#45474C] max-w-3xl leading-relaxed">
                    Esta credencial posee plena validez legal y técnica conforme
                    a la Ley de Firmas y Certificados Digitales. Las áreas de RRHH
                    y Seguridad (HSE) pueden homologar este certificado
                    inmediatamente sin requerir trámites notariales adicionales.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="h-10 px-4 rounded-xl bg-white hover:bg-stone-50 text-[#0D1C2F] font-bold text-xs border border-stone-200 inline-flex items-center gap-2 transition-colors whitespace-nowrap shadow-xs shrink-0"
              >
                <Printer className="w-4 h-4 text-[#FD761A]" />
                <span>Imprimir Acta</span>
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Verification Help Banner for Recruiters & Enterprises */}
        <section className="bg-[#151B2A] text-white rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wider font-semibold uppercase bg-[#FD761A] text-white">
                Módulo B2B • Verificación Masiva
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                ¿Representa a un Departamento de Recursos Humanos o Contratista?
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Consulte nuestro servicio de validación por API o envíe un lote de DNI / Códigos para
                recibir un informe pericial homologado con transcripción académica oficial en menos de 2
                horas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <a
                href="mailto:empresas@certifox.io?subject=Solicitud%20de%20Transcripción%20Masiva"
                className="h-11 px-5 rounded-xl bg-[#FD761A] hover:bg-[#E05E09] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-md text-center"
              >
                <Building2 className="w-4 h-4" />
                <span>Solicitar Transcripción Masiva</span>
              </a>
              <a
                href="#api-docs"
                className="h-11 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors text-center border border-white/10"
              >
                <Code className="w-4 h-4" />
                <span>Documentación API</span>
              </a>
            </div>
          </div>
        </section>

        {/* Alternate Demo Switcher (if alternate revoked exists) */}
        {alternateRevokedCertificate && (
          <div className="pt-2 flex flex-col items-center">
            <div className="flex items-center gap-2 text-xs text-[#45474C]">
              <Info className="w-4 h-4 text-stone-400" />
              <span>Demostración para Evaluadores Técnicos:</span>
              <button
                type="button"
                onClick={() => setShowRevokedDemo(!showRevokedDemo)}
                className="font-bold text-[#FD761A] hover:underline"
              >
                {showRevokedDemo
                  ? "Volver a credencial válida"
                  : "Alternar a ejemplo de Credencial Revocada o Expirada"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
