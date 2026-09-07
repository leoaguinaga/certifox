"use client";

import { QrCode, Building2, ArrowRight, Code } from "lucide-react";

interface VerificationChannelsSectionProps {
  onSelectQrMode?: () => void;
}

export function VerificationChannelsSection({
  onSelectQrMode,
}: VerificationChannelsSectionProps) {
  return (
    <section className="w-full py-16 bg-white border-y border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card A: Field Mobile QR Audit */}
          <div className="bg-[#EFF4FF] border border-[#D5E3FD] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-[#D5E3FD] flex items-center justify-center text-[#FD761A]">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#45474C] uppercase tracking-wider">
                  Auditoría en Campo
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0D1C2F] tracking-tight">
                  Verificación instantánea con Código QR
                </h2>
              </div>
              <p className="text-sm text-[#45474C] leading-relaxed">
                Especialmente diseñado para inspectores en obra, supervisores HSE
                en campamentos mineros e ingenieros de planta que necesitan
                comprobar permisos de trabajo de alto riesgo (SST) sin conexión
                compleja.
              </p>
            </div>

            <div className="pt-4 border-t border-[#D5E3FD]/80 flex items-center justify-between relative z-10">
              <button
                type="button"
                onClick={() => {
                  if (onSelectQrMode) {
                    onSelectQrMode();
                  } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#FD761A] hover:text-[#9D4300] transition-colors group-hover:translate-x-0.5 transition-transform"
              >
                <span>Abrir lector óptico de credenciales</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-medium text-stone-500">
                Compatible con iOS y Android
              </span>
            </div>
          </div>

          {/* Card B: Mass Enterprise & API Validation */}
          <div className="bg-[#151B2A] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-md">
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#233144] flex items-center justify-center text-[#FD761A]">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#FFB690] uppercase tracking-wider">
                  Recursos Humanos y Contratistas
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Auditoría masiva para empresas
                </h2>
              </div>
              <p className="text-sm text-stone-300 leading-relaxed">
                ¿Gestionas cuadrillas de más de 50 técnicos? Sube una nómina en
                formato CSV con códigos registrales o integra tu software
                ERP/HRMS mediante nuestra API REST certificada para auditorías
                continuas.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-700/80 flex flex-wrap items-center gap-3 relative z-10">
              <a
                href="mailto:empresas@certifox.io?subject=Consulta%20Servicio%20B2B%20Certifox"
                className="px-4 py-2 bg-[#FD761A] hover:bg-[#E05E09] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs"
              >
                Consultar servicio B2B
              </a>
              <a
                href="#api-docs"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Descargando especificación Swagger / OpenAPI de Certifox...");
                }}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-stone-700"
              >
                <Code className="w-3.5 h-3.5 text-[#FD761A]" />
                <span>Documentación API</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
