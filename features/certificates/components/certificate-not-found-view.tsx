"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  FileCheck,
  Gavel,
  XCircle,
  QrCode,
  Edit3,
  AlertOctagon,
  HelpCircle,
  FileText,
  Camera,
  Upload,
  Building2,
  Lock,
  Mail,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface CertificateNotFoundViewProps {
  code: string;
}

export function CertificateNotFoundView({
  code,
}: CertificateNotFoundViewProps) {
  const router = useRouter();
  const [searchCode, setSearchCode] = useState(code);
  const [b2bSubmitted, setB2bSubmitted] = useState(false);
  const [b2bLoading, setB2bLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchCode.trim().toUpperCase();
    if (!clean) return;
    router.push(`/verificar/${encodeURIComponent(clean)}`);
  };

  const handleB2bSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setB2bLoading(true);
    setTimeout(() => {
      setB2bLoading(false);
      setB2bSubmitted(true);
    }, 1000);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Persistent Active Search Bar - Centered */}
      <section className="w-full bg-[#EFF4FF] border-b border-[#D5E3FD] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-3.5 text-center">
          <form
            onSubmit={handleSearch}
            className="bg-white p-2 rounded-2xl shadow-sm border border-stone-200/80 flex flex-col sm:flex-row gap-2 items-stretch"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 absolute left-3.5 text-stone-400" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Ej: CFX-2025-9831"
                className="w-full h-11 pl-11 pr-4 bg-transparent rounded-xl font-mono text-base font-bold text-rose-600 uppercase tracking-wider focus:outline-none focus:bg-stone-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="h-11 px-5 bg-[#151B2A] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-xs shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Buscar nuevamente</span>
              </button>
              <button
                type="button"
                onClick={() => setSearchCode("")}
                title="Limpiar código"
                className="h-11 px-3 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center shrink-0"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick simulation buttons - Centered */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-[#45474C] text-center">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              Entorno de prueba / simulación pericial:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/verificar/CFX-2025-9831"
                className="px-3 py-1 rounded-full bg-white border border-stone-200 font-semibold hover:bg-stone-50 transition-colors flex items-center gap-1.5 text-[#0D1C2F] shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ver Certificado Válido (CFX-2025-9831)</span>
              </Link>
              <Link
                href="/verificar/CFX-2024-0042"
                className="px-3 py-1 rounded-full bg-white border border-stone-200 font-semibold hover:bg-stone-50 transition-colors flex items-center gap-1.5 text-rose-700 shadow-2xs"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Ver Revocado (CFX-2024-0042)</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Negative Result Card */}
      <section className="w-full pt-10 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 border border-stone-200/80 overflow-hidden relative">
            {/* Decorative accent top strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-[#FD761A] to-rose-600" />

            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span>Estado: Credencial No Registrada en Ledger Oficial</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#45474C] text-[11px] font-bold uppercase tracking-wider">
                <Gavel className="w-4 h-4 text-[#FD761A]" />
                <span>Dictamen Pericial de Firma Digital</span>
              </div>
            </div>

            {/* Hero Negative Block */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-3 flex justify-center md:justify-start">
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                  <SearchX className="w-14 h-14 text-rose-600" />
                  <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[#151B2A] text-white flex items-center justify-center shadow-md">
                    <ShieldAlert className="w-4 h-4 text-[#FD761A]" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-9 space-y-2">
                <div className="inline-block px-2.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-700 tracking-wider uppercase">
                  Inconsistencia de Registro
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1C2F] tracking-tight">
                  No se encontró ningún registro para el código:
                  <span className="text-rose-600 font-mono tracking-normal block mt-1">
                    {code}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-[#45474C] leading-relaxed">
                  El identificador ingresado{" "}
                  <span className="font-bold text-[#0D1C2F]">
                    no coincide con ninguna credencial técnica o académica
                  </span>{" "}
                  emitida por entidades autorizadas en la red Certifox FoxCode.
                  Esta ausencia de registro puede deberse a una equivocación al
                  transcribir los caracteres o a un intento de emisión apócrifa o
                  no autorizada.
                </p>
              </div>
            </div>

            {/* Hash Technical State Matrix */}
            <div className="mt-8 p-5 rounded-xl bg-[#EFF4FF] border border-[#D5E3FD] grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#45474C] uppercase tracking-wider block">
                  Identificador Solicitado
                </span>
                <div className="text-sm font-mono font-bold text-[#0D1C2F]">
                  {code}
                </div>
                <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Clave inexistente
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#45474C] uppercase tracking-wider block">
                  Criptograma SHA-256
                </span>
                <div className="text-sm font-mono font-bold text-stone-500">
                  NO_EMITTED_HASH
                </div>
                <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Sin bloque en cadena
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#45474C] uppercase tracking-wider block">
                  Validez Jurídica / Laboral
                </span>
                <div className="text-sm font-bold text-rose-600">
                  NULA / NO AUDITABLE
                </div>
                <span className="text-xs text-stone-500">
                  Sin efecto para homologación
                </span>
              </div>
            </div>

            {/* Direct Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full sm:w-auto h-11 px-5 bg-[#151B2A] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Edit3 className="w-4 h-4" />
                <span>Corregir código en buscador</span>
              </button>

              <Link
                href="/verificar"
                className="w-full sm:w-auto h-11 px-5 bg-white text-[#0D1C2F] font-bold text-xs sm:text-sm rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4 text-[#FD761A]" />
                <span>Escanear código QR con cámara</span>
              </Link>

              <a
                href="#report-integrity"
                className="w-full sm:w-auto h-11 px-4 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors sm:ml-auto"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Denunciar posible falsificación</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostic Guide (3 Points) */}
      <section className="w-full py-8 md:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#FD761A] uppercase tracking-wider">
                Protocolo de Asistencia
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0D1C2F]">
                Guía de diagnóstico y verificación pericial
              </h2>
            </div>
            <HelpCircle className="w-6 h-6 text-stone-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Point 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-stone-200/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFF4FF] flex items-center justify-center font-bold text-sm text-[#0D1C2F]">
                  01
                </div>
                <h3 className="text-sm font-bold text-[#0D1C2F]">
                  Revisa la digitación del código
                </h3>
                <p className="text-xs text-[#45474C] leading-relaxed">
                  Asegúrate de ingresar la estructura alfanumérica estándar de
                  Certifox:{" "}
                  <strong className="text-[#0D1C2F]">
                    3 letras, guion, año y 4 dígitos
                  </strong>{" "}
                  (por ejemplo:{" "}
                  <span className="font-mono text-[#FD761A]">CFX-2025-9831</span>
                  ).
                </p>
              </div>
              <div className="bg-[#EFF4FF] p-3 rounded-xl text-[11px] text-[#45474C]">
                Comprueba confusiones comunes entre el número{" "}
                <strong className="text-[#0D1C2F]">0</strong> y la letra{" "}
                <strong className="text-[#0D1C2F]">O</strong>, o entre{" "}
                <strong className="text-[#0D1C2F]">1</strong> e{" "}
                <strong className="text-[#0D1C2F]">I</strong>.
              </div>
            </div>

            {/* Point 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-stone-200/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFF4FF] flex items-center justify-center font-bold text-sm text-[#0D1C2F]">
                  02
                </div>
                <h3 className="text-sm font-bold text-[#0D1C2F]">
                  Emisión bajo entidad asociada
                </h3>
                <p className="text-xs text-[#45474C] leading-relaxed">
                  Si la capacitación fue tomada a través de un convenio gremial o
                  cámara empresarial sin integración en caliente, solicite a la
                  institución el{" "}
                  <strong className="text-[#0D1C2F]">
                    enlace directo con firma URI
                  </strong>
                  .
                </p>
              </div>
              <div className="bg-[#EFF4FF] p-3 rounded-xl text-[11px] text-[#45474C]">
                Los lotes de certificación presencial pueden demorar hasta 4 horas
                hábiles en sincronizarse con la red principal.
              </div>
            </div>

            {/* Point 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-stone-200/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFF4FF] flex items-center justify-center font-bold text-sm text-[#0D1C2F]">
                  03
                </div>
                <h3 className="text-sm font-bold text-[#0D1C2F]">
                  Alerta contra diplomas apócrifos
                </h3>
                <p className="text-xs text-[#45474C] leading-relaxed">
                  Todo certificado oficial emitido por Certifox incluye
                  obligatoriamente un{" "}
                  <strong className="text-[#0D1C2F]">
                    código QR dinámico
                  </strong>{" "}
                  que resuelve a este dominio oficial seguro bajo certificado SSL
                  SHA-256.
                </p>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-[11px] text-rose-800">
                Si el documento físico carece de QR o redirige a un dominio ajeno,
                desestime de inmediato su autenticidad.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Optical Inspection Section */}
      <section className="w-full py-8 md:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#EFF4FF] border border-[#D5E3FD] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <span className="text-[11px] font-bold text-[#45474C] uppercase tracking-wider">
                Validación Óptica Directa
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#0D1C2F]">
                ¿Tiene el diploma impreso o en formato PDF?
              </h3>
              <p className="text-xs sm:text-sm text-[#45474C] leading-relaxed">
                Apunte la cámara de su dispositivo móvil o lector pericial al
                código QR localizado en la esquina inferior derecha del documento
                físico para consultar directamente la transacción de expedición.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/verificar"
                  className="h-10 px-4 bg-[#FD761A] hover:bg-[#E05E09] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>Activar Escáner Óptico</span>
                </Link>
                <label className="h-10 px-4 bg-white text-[#0D1C2F] font-bold text-xs rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer flex items-center gap-2 transition-colors shadow-xs">
                  <Upload className="w-4 h-4 text-stone-500" />
                  <span>Subir PDF para análisis de metadatos</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={() => router.push("/verificar/CFX-2025-9831")}
                  />
                </label>
              </div>
            </div>

            <div className="md:col-span-4 flex justify-center">
              <div className="p-4 bg-white rounded-xl shadow-xs border border-stone-200 text-center space-y-2 max-w-xs">
                <div className="w-32 h-32 mx-auto bg-stone-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <QrCode className="w-24 h-24 text-stone-300" />
                  <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-rose-600" />
                  </div>
                </div>
                <div className="text-[11px] font-bold text-rose-600 uppercase">
                  QR Sin Concordancia
                </div>
                <div className="text-[10px] text-stone-500">
                  Ubicación referencial en base de diplomas
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Division Module - Full Width without outer card borders */}
      <section className="w-full bg-[#E6EEFF] py-14 md:py-18 px-4 sm:px-6 lg:px-8 border-none my-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#151B2A] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-[#FD761A]" />
                <span>División de Auditoría Corporativa y Prevención de Fraude</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1C2F] tracking-tight leading-tight">
                ¿Representa a un Departamento de Recursos Humanos, Minería o
                Construcción?
              </h2>
              <p className="text-sm text-[#45474C] leading-relaxed">
                Si está llevando a cabo un proceso de homologación de contratistas o
                validación masiva de legajos y sospecha de documentos
                falsificados presentados por postulantes, nuestra unidad pericial puede generar una{" "}
                <strong className="text-[#0D1C2F]">
                  auditoría forense por lote
                </strong>{" "}
                o proveer acceso a la{" "}
                <strong className="text-[#0D1C2F]">
                  API de Validación en Tiempo Real
                </strong>
                .
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/80 border border-[#D5E3FD] flex items-center justify-center shrink-0 text-[#FD761A]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0D1C2F]">
                      Peritaje Rápido
                    </h4>
                    <p className="text-[11px] text-[#45474C] leading-snug">
                      Dictamen de autenticidad en menos de 2 horas para licitaciones.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/80 border border-[#D5E3FD] flex items-center justify-center shrink-0 text-[#FD761A]">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0D1C2F]">
                      API REST Empresarial
                    </h4>
                    <p className="text-[11px] text-[#45474C] leading-snug">
                      Conexión con SAP SuccessFactors, Workday y sistemas ERP.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/80 border border-[#D5E3FD] flex items-center justify-center shrink-0 text-[#FD761A]">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0D1C2F]">
                      Bloqueo Notarial
                    </h4>
                    <p className="text-[11px] text-[#45474C] leading-snug">
                      Informe con firma digital pericial con validez ante juzgados y consorcios.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200/80 space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#0D1C2F]">
                  Solicitud de Dictamen Pericial
                </h3>
                <p className="text-xs text-[#45474C] mt-1 leading-relaxed">
                  Adjunte el código dudoso o suba el certificado observado para informe técnico formal con copia a la
                  entidad emisora.
                </p>
              </div>

              {b2bSubmitted ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1.5">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                  <div className="text-xs font-bold text-emerald-800">
                    Solicitud Recibida
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Un oficial de cumplimiento de Certifox se contactará en breve con el dictamen.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleB2bSubmit} className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="RUC o Nombre de Empresa"
                    required
                    className="w-full h-10 px-3.5 bg-stone-50 rounded-xl text-xs text-[#0D1C2F] border border-stone-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FD761A]/30 transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Correo corporativo (ej: auditoria@empresa.com)"
                    required
                    className="w-full h-10 px-3.5 bg-stone-50 rounded-xl text-xs text-[#0D1C2F] border border-stone-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FD761A]/30 transition-all"
                  />
                  <input
                    type="text"
                    readOnly
                    value={code}
                    className="w-full h-10 px-3.5 bg-rose-50/50 rounded-xl font-mono text-xs text-rose-600 font-bold border border-rose-100 cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={b2bLoading}
                    className="w-full h-11 bg-[#151B2A] hover:bg-stone-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-75"
                  >
                    {b2bLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#FD761A]" />
                    ) : (
                      <>
                        <FileText className="w-4 h-4 text-[#FD761A]" />
                        <span>Solicitar Dictamen Institucional</span>
                      </>
                    )}
                  </button>
                  <div className="text-center text-[10px] font-bold text-[#45474C] uppercase tracking-wider pt-1">
                    Atención prioritaria para contratistas y minería
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Integrity & Fraud Reporting Section */}
      <section
        id="report-integrity"
        className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8 pb-16 md:pb-24"
      >
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                Protocolo de Integridad Académica
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#0D1C2F]">
                Reporte confidencial de certificados adulterados
              </h3>
              <p className="text-xs sm:text-sm text-[#45474C] leading-relaxed">
                Certifox mantiene tolerancia cero ante la suplantación y la
                falsificación de credenciales técnicas. Si usted fue víctima de
                estafa por parte de un centro formativo no acreditado que emitió
                documentos bajo nuestra marca, complete la denuncia para activar la
                custodia de evidencia y notificación legal.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                <a
                  href={`mailto:integridad@certifox.org?subject=Alerta%20de%20Fraude%20${encodeURIComponent(
                    code
                  )}`}
                  className="font-bold text-[#0D1C2F] hover:text-[#FD761A] hover:underline flex items-center gap-1"
                >
                  <Mail className="w-4 h-4 text-[#FD761A]" />
                  <span>Enviar caso a integridad@certifox.org</span>
                </a>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500">
                  Línea de custodia de evidencia criptográfica activa
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
