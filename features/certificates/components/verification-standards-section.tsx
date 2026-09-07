import { Scale, Award, ShieldCheck, Lock } from "lucide-react";

export function VerificationStandardsSection() {
  const standards = [
    {
      icon: Scale,
      title: "Ley de Firmas Digitales",
      description:
        "Equivalencia jurídica y valor probatorio pleno según la legislación de firma electrónica avanzada.",
    },
    {
      icon: Award,
      title: "Estándar ISO/IEC 17024",
      description:
        "Alineado a normas globales de evaluación de conformidad para organismos que certifican personas.",
    },
    {
      icon: ShieldCheck,
      title: "Inmutabilidad SHA-256",
      description:
        "Huella digital irrepetible. Cualquier alteración de un solo píxel o letra invalida la certificación.",
    },
    {
      icon: Lock,
      title: "Privacidad de Datos (Habeas Data)",
      description:
        "Protección del titular con enmascaramiento selectivo de documentos de identidad en consultas públicas.",
    },
  ];

  return (
    <section id="marco-legal" className="w-full py-16 bg-[#EFF4FF] border-y border-[#D5E3FD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#45474C] uppercase tracking-wider">
              Marco Jurídico de Acreditación
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1C2F] tracking-tight">
              Estándares y homologación internacional
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#45474C] max-w-md leading-relaxed">
            Cada certificado emitido mediante Certifox cumple con estrictos
            criterios jurídicos de idoneidad técnica y trazabilidad de identidad.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {standards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white p-6 rounded-2xl shadow-xs border border-stone-200/80 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] flex items-center justify-center text-[#FD761A]">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#0D1C2F]">
                  {item.title}
                </h4>
                <p className="text-xs text-[#45474C] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
