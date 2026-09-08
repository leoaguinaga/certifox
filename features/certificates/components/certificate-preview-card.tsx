interface CertificatePreviewCardProps {
  code?: string;
  studentName?: string;
  courseTitle?: string;
  issueDate?: string;
  hours?: number;
  statusText?: string;
}

export function CertificatePreviewCard({
  code = "CFX-2025-9831",
  studentName = "Alejandro Morales Peñaloza",
  courseTitle = "Seguridad Operativa en Maquinaria Pesada",
  issueDate = "14 OCT 2024",
  hours = 48,
  statusText = "Estado: Válido",
}: CertificatePreviewCardProps) {
  return (
    <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-stone-200/80 max-w-2xl mx-auto overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-orange-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Certificate Frame with subtle double border */}
      <div className="p-6 sm:p-7 rounded-xl bg-[#FFFDF9] border border-stone-200/70 relative flex flex-col justify-between">
        {/* Top Header of Certificate */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-stone-200/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#151B2A] text-white flex items-center justify-center font-extrabold text-sm tracking-tight shadow-xs shrink-0">
              CFX
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 tracking-tight leading-tight">
                CERTIFOX ACADEMIC AUDIT
              </h4>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Sistema Nacional de Certificación Técnica
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1FAE5] text-[#065F46] text-xs font-semibold shadow-xs border border-[#A7F3D0]">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            <span>{statusText}</span>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="my-6 text-center py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5">
            Se otorga la presente certificación a
          </p>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mb-2">
            {studentName}
          </h3>
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            Por haber cumplido y superado satisfactoriamente los requerimientos teórico-prácticos del programa:
          </p>
          <p className="text-sm sm:text-base font-bold text-[#FD761A] mt-2">
            {courseTitle}
          </p>
        </div>

        {/* Certificate Footer with QR and Code */}
        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-end justify-between bg-white p-4 rounded-xl border border-stone-200/70 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              Código Único Registral
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-stone-900 tracking-wider">
              {code}
            </span>
            <p className="text-[11px] font-medium text-stone-500 mt-0.5">
              EMISIÓN: {issueDate} • CARGA: {hours} HORAS
            </p>
          </div>

          {/* Stylized QR Simulation */}
          <div className="flex sm:flex-col items-center gap-2 self-end sm:self-auto">
            <div className="size-15 bg-stone-900 p-1.5 rounded-lg text-white shadow-xs">
              <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v4h-4v-4zm-4-2h2v2h-2v-2zm4 4v4h2v-4h-2zm-6-2h2v4h-2v-4zm4-2h4v2h-4v-2zm-8-8h2v2H8V6zm0 12h2v2H8v-2z" />
              </svg>
            </div>
            {/* <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
              Escanear validación
            </span> */}
          </div>
        </div>
      </div>
    </div>
  );
}
