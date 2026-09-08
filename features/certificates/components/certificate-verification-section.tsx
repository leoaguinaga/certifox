"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Search } from "lucide-react";
import { CertificatePreviewCard } from "./certificate-preview-card";

export function CertificateVerificationSection() {
  const router = useRouter();
  const [code, setCode] = useState("CFX-2025-9831");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsVerifying(true);
    // Simulate instantaneous verification feedback and navigation
    setTimeout(() => {
      setIsVerifying(false);
      router.push(`/verificar/${encodeURIComponent(code.trim().toUpperCase())}`);
    }, 400);
  };

  return (
    <section id="verificacion" className="py-20 bg-background-foreground relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Form & Audit Explanation */}
          <div className="lg:col-span-5">
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight mt-1 mb-4 leading-tight">
              Cero falsificaciones. Confianza institucional absoluta.
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mb-8 leading-relaxed">
              Cualquier empleador o entidad puede ingresar el código de credencial o escanear el QR para auditar la vigencia, notas y horas pedagógicas aprobadas.
            </p>

            {/* Verification Form Box */}
            <div className="bg-[#EFF4FF] p-6 rounded-2xl shadow-xs border border-stone-200/80">
              <form onSubmit={handleVerify}>
                <label
                  htmlFor="cert-code-input"
                  className="block text-xs font-bold text-stone-900 mb-2 uppercase tracking-wider"
                >
                  Ingresa código de credencial
                </label>
                <div className="flex gap-2">
                  <input
                    id="cert-code-input"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ej. CFX-2025-9831"
                    className="flex-1 px-3.5 py-2.5 bg-white text-stone-900 font-mono text-sm rounded-xl outline-none shadow-xs border border-stone-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all uppercase placeholder:normal-case placeholder:font-sans"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="px-5 py-2.5 bg-[#151B2A] text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-stone-800 transition-colors shadow-xs flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-75"
                  >
                    {isVerifying ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Comprobar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <p className="text-[11px] font-medium text-stone-600 mt-3 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#FD761A] shrink-0" />
                <span>Respuesta instantánea con firma digital SHA-256</span>
              </p>
            </div>
          </div>

          {/* Right Column: Realist Certificate Preview */}
          <div className="lg:col-span-7">
            <CertificatePreviewCard code={code || "CFX-2025-9831"} />
          </div>
        </div>
      </div>
    </section>
  );
}
