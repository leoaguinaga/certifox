"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Hash,
  QrCode,
  Search,
  ArrowRight,
  Info,
  Eye,
  CheckCircle2,
  Camera,
  Upload,
  Lock,
  ExternalLink,
  X,
} from "lucide-react";

interface VerificationHeroSearchProps {
  initialCode?: string;
}

export function VerificationHeroSearch({
  initialCode = "",
}: VerificationHeroSearchProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"code" | "qr">("code");
  const [code, setCode] = useState(initialCode);
  const [showVisualExample, setShowVisualExample] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      router.push(`/verificar/${encodeURIComponent(cleanCode)}`);
    }, 250);
  };

  const handleQuickFill = (testCode: string) => {
    setCode(testCode);
    setActiveTab("code");
  };

  const handleSimulateScan = () => {
    setCameraActive(true);
    setTimeout(() => {
      setCameraActive(false);
      router.push("/verificar/CFX-2025-9831");
    }, 1400);
  };

  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        router.push("/verificar/CFX-2025-9831");
      }, 800);
    }
  };

  return (
    <section className="w-full py-16 md:py-24 lg:py-30 relative overflow-hidden bg-[#F8F9FF]">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-8">
        {/* Badge & Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0D1C2F] tracking-tight leading-tight">
            Valida la autenticidad de cualquier credencial académica o técnica
          </h1>

          <p className="text-base sm:text-lg text-[#45474C] max-w-2xl mx-auto leading-relaxed">
            Ingresa el código alfanumérico único impreso en el certificado
            oficial o utiliza el lector de código QR para auditar competencias,
            horas lectivas y estado registral en tiempo real.
          </p>
        </div>

        {/* Central Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200/80 p-5 sm:p-8 text-left space-y-6">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-[#EFF4FF] p-1.5 rounded-xl w-fit border border-[#D5E3FD]">
            <button
              type="button"
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === "code"
                ? "bg-white text-[#0D1C2F] shadow-xs"
                : "text-[#45474C] hover:text-[#0D1C2F]"
                }`}
            >
              <Hash className="w-4 h-4 text-[#FD761A]" />
              <span>Búsqueda por Código Alfanumérico</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("qr")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === "qr"
                ? "bg-white text-[#0D1C2F] shadow-xs"
                : "text-[#45474C] hover:text-[#0D1C2F]"
                }`}
            >
              <QrCode className="w-4 h-4 text-[#45474C]" />
              <span>Escanear con Cámara / QR</span>
            </button>
          </div>

          {/* Panel 1: Code Search */}
          {activeTab === "code" && (
            <div className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <label
                  htmlFor="cert-code-input"
                  className="block text-xs font-bold text-[#0D1C2F] uppercase tracking-wider"
                >
                  Identificador Registral del Certificado (CFX-ID)
                </label>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Search className="w-5 h-5 text-stone-400" />
                    </div>
                    <input
                      id="cert-code-input"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Ej. CFX-2025-9831 o CFX-2024-MIN-0092"
                      className="w-full h-12 pl-11 pr-4 bg-white font-mono text-base font-semibold text-[#0D1C2F] placeholder:text-stone-400 rounded-xl shadow-xs border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#FD761A] focus:border-transparent transition-all uppercase tracking-wide"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSearching}
                    className="h-12 px-6 bg-[#FD761A] hover:bg-[#E05E09] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md active:scale-95 shrink-0 disabled:opacity-75"
                  >
                    {isSearching ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verificar credencial</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Help & Visual Example Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-xs text-[#45474C]">
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#FD761A] shrink-0" />
                  <span>
                    <strong>¿Dónde ubico el código?</strong> En el margen
                    inferior o pie del diploma oficial, bajo el sello QR.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVisualExample(!showVisualExample)}
                  className="font-semibold text-[#9D4300] hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>{showVisualExample ? "Ocultar ejemplo" : "Ver ejemplo visual"}</span>
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Visual Example Drawer */}
              {showVisualExample && (
                <div className="bg-[#EFF4FF] border border-[#D5E3FD] rounded-xl p-4 sm:p-5 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs sm:text-sm font-bold text-[#0D1C2F]">
                      Ubicación física en Certificados Oficiales Certifox
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowVisualExample(false)}
                      className="text-stone-400 hover:text-[#0D1C2F]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="rounded-lg overflow-hidden bg-stone-100 border border-stone-200 relative h-36 flex items-center justify-center">
                      <Image
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRPpgZkPA3K1Lbeeowwf6HqT-7LV_bCnI-AwrCLpNCle66LwnJQj-cb4fJ4ZOmUDHnUBECOcuB8N6JjD87xxV-O8e8kWrHWwSjRIsmz5-c48YKXleWwmLU7PQuJnd-sg1yV8In7CB0Rrol1RlxRIbukTO6xzj5PYAxITuIuHEsP8AtR4eagkq5FGxs8f9uifDUEeHc8HbJ3KN8c6M_xkQk18lGqoXf3J7zXBgM4Kc8wa3oKcPxc8LZ"
                        alt="Ubicación de código en diploma oficial Certifox"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2 text-xs text-[#45474C]">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#FD761A] mt-0.5 shrink-0" />
                        <p>
                          <strong>Certificado físico impreso:</strong> Se localiza
                          en la esquina inferior izquierda con la leyenda{" "}
                          <em>&ldquo;Registro Criptográfico Nacional&rdquo;</em>.
                        </p>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#FD761A] mt-0.5 shrink-0" />
                        <p>
                          <strong>Credencial PDF / Digital:</strong> Código
                          hipervinculado en el pie de página de la hoja técnica de
                          competencias.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick test chips */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-[#45474C] uppercase tracking-wider">
                  Pruebas rápidas:
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickFill("CFX-2025-9831")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>CFX-2025-9831 (Válido / Minería)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("CFX-2024-0042")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-xs font-semibold hover:bg-rose-100 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>CFX-2024-0042 (Observado)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("CFX-9999-0000")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-700 border border-stone-200 rounded-full text-xs font-semibold hover:bg-stone-200 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                  <span>CFX-9999-0000 (Inexistente)</span>
                </button>
              </div>
            </div>
          )}

          {/* Panel 2: QR Scanner / Camera */}
          {activeTab === "qr" && (
            <div className="space-y-4">
              <div className="bg-[#EFF4FF] border border-[#D5E3FD] rounded-xl p-6 sm:p-8 text-center space-y-4">
                <div className="max-w-xs mx-auto aspect-square bg-white rounded-xl shadow-inner border border-stone-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                  {/* Framing viewfinder */}
                  <div className="w-44 h-44 relative flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-dashed border-[#FD761A]/40 rounded-xl animate-pulse" />
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#FD761A] rounded-tl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#FD761A] rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#FD761A] rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#FD761A] rounded-br" />

                    {cameraActive ? (
                      <div className="text-center space-y-2">
                        <div className="w-10 h-10 border-4 border-[#FD761A] border-t-transparent rounded-full animate-spin mx-auto" />
                        <span className="text-xs font-mono font-bold text-[#FD761A]">
                          Escaneando credencial...
                        </span>
                      </div>
                    ) : (
                      <>
                        <QrCode className="w-28 h-28 text-stone-700 opacity-70" />
                        <div className="absolute inset-x-2 h-0.5 bg-[#FD761A] shadow-[0_0_8px_rgba(253,118,26,0.8)] animate-bounce" />
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-[#0D1C2F]">
                    Coloca el código QR frente a la cámara
                  </h3>
                  <p className="text-xs sm:text-sm text-[#45474C]">
                    Permite el acceso a tu cámara para auditoría instantánea o
                    arrastra una captura de pantalla del certificado oficial.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    disabled={cameraActive}
                    className="px-5 py-2.5 bg-[#151B2A] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-stone-800 flex items-center gap-2 transition-colors shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>
                      {cameraActive ? "Leyendo código..." : "Activar cámara web"}
                    </span>
                  </button>

                  <label className="px-5 py-2.5 bg-white text-[#0D1C2F] text-xs sm:text-sm font-semibold rounded-xl shadow-xs border border-stone-200 hover:bg-stone-50 cursor-pointer flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-[#FD761A]" />
                    <span>Cargar imagen o PDF</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleSimulateFileUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* PKI Footer Note */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-[#EFF4FF]/60 border border-[#D5E3FD]/60 p-3.5 rounded-xl text-xs text-[#45474C]">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FD761A] shrink-0" />
              <span>
                Firmas respaldadas por infraestructura de clave pública (PKI) y
                registro inmutable en ledger central.
              </span>
            </div>
            <a
              href="#marco-legal"
              className="font-bold text-[#0D1C2F] hover:underline flex items-center gap-1"
            >
              <span>Política de verificación pública</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
