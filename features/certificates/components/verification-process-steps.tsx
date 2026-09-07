import { Search, Fingerprint, Award } from "lucide-react";

export function VerificationProcessSteps() {
  const steps = [
    {
      num: "01",
      icon: Search,
      title: "Localiza el código o QR",
      description: (
        <>
          Revisa el margen inferior del documento físico o abre el archivo PDF
          homologado expedido por la institución. El identificador sigue el
          formato estandarizado{" "}
          <code className="bg-[#E6EEFF] px-1.5 py-0.5 rounded text-[#0D1C2F] font-mono text-xs font-semibold">
            CFX-AÑO-XXXX
          </code>
          .
        </>
      ),
      numBg: "bg-[#E6EEFF] text-[#0D1C2F]",
      iconColor: "text-stone-500",
    },
    {
      num: "02",
      icon: Fingerprint,
      title: "Consulta el ledger criptográfico",
      description:
        "Nuestros nodos validadores contrastan el hash criptográfico SHA-256 original con los registros oficiales de firmas digitales del cuerpo académico e instructores autorizados.",
      numBg: "bg-[#FFDBCA] text-[#341100]",
      iconColor: "text-[#FD761A]",
    },
    {
      num: "03",
      icon: Award,
      title: "Descarga el acta de autenticidad",
      description:
        "Visualiza en pantalla la ficha técnica completa: estudiante, horas cronológicas, competencias aprobadas, vigencia reglamentaria y descarga la constancia PDF con validez probatoria.",
      numBg: "bg-[#E6EEFF] text-[#0D1C2F]",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-[#F8F9FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#FD761A] uppercase tracking-wider">
            Protocolo de Confianza Cero
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1C2F] tracking-tight">
            Cómo funciona la validación pública
          </h2>
          <p className="text-sm sm:text-base text-[#45474C]">
            El proceso toma menos de 3 segundos y garantiza que la credencial no
            ha sufrido adulteraciones físicas o lógicas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/70 space-y-4 relative flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${step.numBg}`}
                  >
                    {step.num}
                  </span>
                  <Icon className={`w-6 h-6 ${step.iconColor}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#0D1C2F]">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#45474C] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
