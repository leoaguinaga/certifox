import { Metadata } from "next";
import Link from "next/link";
import { Scale, CheckCircle2, AlertTriangle, ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos y Condiciones de Uso | Certifox",
  description:
    "Términos del servicio educativo, validez de certificados digitales, políticas de matrícula y uso del Campus Certifox.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#FD761A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="space-y-3 pb-6 border-b border-stone-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Scale className="w-4 h-4" />
            <span>Marco Contractual Formativo</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0D1C2F] tracking-tight">
            Términos y Condiciones del Servicio Educativo
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Última actualización: 22 de octubre de 2026. Aplicable para el acceso al catálogo público y al campus virtual Certifox.
          </p>
        </div>

        {/* Content Body */}
        <div className="prose prose-stone max-w-none space-y-6 text-sm text-[#45474C] leading-relaxed">
          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-[#0D1C2F] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#FD761A]" />
              1. Aceptación de los Términos
            </h2>
            <p>
              El registro, navegación o interacción en la plataforma web y campus virtual <strong>Certifox</strong> implica la aceptación plena e incondicional de los presentes Términos y Condiciones. Cualquier usuario que no esté de acuerdo con estas disposiciones debe abstenerse de utilizar el servicio.
            </p>
          </section>

          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-[#0D1C2F]">
              2. Matrícula y Procedimiento de Activación Manual
            </h2>
            <p>
              En el modelo formativo Certifox, la solicitud de matrícula realizada a través de la plataforma sitúa la inscripción en estado <strong>Pendiente de Activación (<code>PENDING</code>)</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Las transferencias o transacciones bancarias (Yape, Plin, BCP, Interbank) se realizan fuera del sistema directamente con el instructor o entidad titular del curso.</li>
              <li>La plataforma Certifox no almacena ni procesa vouchers ni números de tarjeta de crédito (R4).</li>
              <li>El instructor responsable revisa y confirma manualmente la habilitación del curso. Únicamente tras la confirmación formal (estado <code>ACTIVE</code>), el estudiante obtiene acceso al reproductor de lecciones y materiales técnicos.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-[#0D1C2F] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              3. Criterios de Acreditación y Emisión de Certificados
            </h2>
            <p>
              Para obtener la certificación oficial con respaldo criptográfico y código QR de verificación, el estudiante debe satisfacer la totalidad de los requisitos pedagógicos:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Completar el 100% de las lecciones registradas en el aula virtual.</li>
              <li>Presentar las evaluaciones o informes técnicos requeridos y obtener una calificación aprobatoria igual o mayor a <strong>14/20</strong> (o el equivalente estipulado por el programa).</li>
            </ol>
            <p>
              Una vez completados los requisitos y alcanzado el estado <code>COMPLETED</code>, el instructor procede a la emisión del diploma. Cada certificado emitido es inmutable, cuenta con un código único de alta entropía (≥ 96 bits) y un hash de integridad SHA-256 (AC-16).
            </p>
          </section>

          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-[#0D1C2F] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              4. Revocación de Certificados y Auditoría
            </h2>
            <p>
              Certifox y los instructores acreditados se reservan el derecho irrevocable de revocar certificados emitidos en casos de:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Plagio acreditado en informes o entregas técnicas.</li>
              <li>Suplantación de identidad en evaluaciones o asistencia.</li>
              <li>Error material debidamente sustentado en el registro académico.</li>
            </ul>
            <p>
              Toda revocación exige la consignación obligatoria de un motivo fundado y queda inscrita de forma inmutable en el registro de auditoría del sistema (<code>AuditLog</code>, AC-17), actualizando de inmediato la respuesta en la verificación pública.
            </p>
          </section>

          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-[#0D1C2F]">
              5. Legislación Aplicable y Jurisdicción
            </h2>
            <p>
              Los presentes Términos y Condiciones se rigen e interpretan bajo las leyes de la República del Perú. Cualquier controversia derivada del acceso o uso de la plataforma será sometida a la jurisdicción de los juzgados y tribunales de la ciudad de Lima, Perú.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
