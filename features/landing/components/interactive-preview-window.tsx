import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Lock, Search } from "lucide-react";

export function InteractivePreviewWindow() {
  return (
    <div className="w-full relative mx-auto rounded-3xl bg-stone-900/5 p-2 sm:p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] border border-stone-200/80">
      <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-xs">
        {/* Window Top Navigation Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200/80">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            <span className="ml-2 font-mono text-[11px] text-stone-500 font-medium">
              certifox.app/acreditacion/CFX-2025-9831
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Registro Activo
            </span>
          </div>
        </div>

        {/* Split Window Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 text-left divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
          {/* Left Panel: Classroom Progress Track */}
          <div className="lg:col-span-7 p-5 sm:p-7 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-orange-100 text-[#FD761A] flex items-center justify-center font-bold text-xs">
                  01
                </span>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Aula Técnica en Vivo</h4>
                  <p className="text-xs text-stone-500">Módulo 4: Protocolos Críticos de Maquinaria</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-stone-100 px-2.5 py-1 rounded-md text-stone-700">
                Progreso 100%
              </span>
            </div>

            {/* Modules Timeline Rows */}
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/70 hover:bg-orange-50/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-stone-800">
                    Inspección Preoperacional &amp; Checklists ISO
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 font-mono">12 hrs • Aprobado</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/70 hover:bg-orange-50/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-stone-800">
                    Diagnóstico Hidráulico en Terreno
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 font-mono">18 hrs • Aprobado</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/60 border border-orange-200/70">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#FD761A] shrink-0" />
                  <span className="text-xs font-bold text-stone-900">
                    Auditoría Final de Competencias Prácticas
                  </span>
                </div>
                <span className="text-[11px] font-bold text-orange-700 bg-white px-2 py-0.5 rounded border border-orange-200">
                  Nota: 19.4/20
                </span>
              </div>
            </div>

            {/* Instructor Signature Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0">
                  <Image
                    src="https://lh3.googleusercontent.com/aida/AEtjO1UcsVlSjtfMChF53ZjY37UWU4UWV9CbuOqwVdB1xtHh4iX7QJDEO2JY3N3oR803kNIXE-PCzpaC4yj1tIziPVjphxRlHMfzpyUCME7gFRxIVtp3ZGGowIcziwTZfZWWuR6Y3LxbhmgtofvYEPC1-lTOAyn53-D3IECneVotkyIDRJ8Ub-NZebhsrFx4iG7IqAW7uR-BmluYkN0wlQ7WEbY9PN77NdblwNCmEc5K2t8x7B6P_hih7ahf-Q"
                    alt="Ing. Marco Viteri"
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 leading-none">Ing. Marco Viteri</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">Instructor Homologado MaqOps</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-stone-600 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                Firma Digital Verificada
              </span>
            </div>
          </div>

          {/* Right Panel: Live Mini Certificate Preview */}
          <div className="lg:col-span-5 p-5 sm:p-7 bg-[#FFFDF9] flex flex-col justify-between">
            <div className="border border-stone-200 rounded-xl p-4 bg-white shadow-xs relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-bold block">
                    Acreditación Pública
                  </span>
                  <h5 className="text-xs font-extrabold text-stone-900">CERTIFOX AUDIT REGISTRY</h5>
                </div>
                <div className="w-6 h-6 rounded-md bg-[#151B2A] text-white flex items-center justify-center text-[10px] font-extrabold shadow-xs">
                  C
                </div>
              </div>
              <div className="my-2 py-2 border-y border-stone-100">
                <p className="text-[10px] text-stone-500">Estudiante acreditado:</p>
                <p className="text-sm font-extrabold text-stone-900">Alejandro Morales P.</p>
                <p className="text-[11px] font-semibold text-[#FD761A] mt-0.5">
                  Seguridad Operativa en Maquinaria Pesada
                </p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[9px] text-stone-400 font-mono block">CÓDIGO ÚNICO</span>
                  <span className="text-xs font-mono font-bold text-stone-900">CFX-2025-9831</span>
                  <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">
                    ● Válido sin expiración
                  </span>
                </div>
                <div className="p-1 bg-[#151B2A] rounded-lg text-white">
                  <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v4h-4v-4zm-4-2h2v2h-2v-2zm4 4v4h2v-4h-2zm-6-2h2v4h-2v-4zm4-2h4v2h-4v-2zm-8-8h2v2H8V6zm0 12h2v2H8v-2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <Link
              href="#verificacion"
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-[#FD761A]" />
              <span>Probar visor de auditoría en vivo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
