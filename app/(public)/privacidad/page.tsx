import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, FileText, ArrowLeft, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad y Protección de Datos | Certifox",
  description:
    "Tratamiento de datos personales bajo la Ley N° 29733, derechos ARCO y medidas de seguridad criptográfica en Certifox.",
};

export default function PrivacidadPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FD761A] text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Ley N° 29733 • República del Perú</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0D1C2F] tracking-tight">
            Política de Privacidad y Protección de Datos Personales
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Última actualización: 22 de octubre de 2026. Vigente para toda la plataforma y campus Certifox.
          </p>
        </div>

        {/* Content Body */}
        <div className="prose prose-stone max-w-none space-y-6 text-sm text-[#45474C] leading-relaxed">
          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-[#0D1C2F] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#FD761A]" />
              1. Marco Legal y Compromiso de Confidencialidad
            </h2>
            <p>
              En cumplimiento con la <strong>Ley N° 29733 (Ley de Protección de Datos Personales del Perú)</strong> y su reglamento aprobado mediante Decreto Supremo N° 003-2013-JUS, <strong>Certifox</strong> garantiza la seguridad, confidencialidad e inviolabilidad de los datos personales proporcionados por postulantes, estudiantes, docentes y representantes institucionales.
            </p>
            <p>
              Los bancos de datos personales bajo titularidad de Certifox son tratados con rigurosas medidas técnicas y organizativas para impedir su adulteración, pérdida, consulta o tratamiento no autorizado.
            </p>
          </section>

          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-[#0D1C2F] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FD761A]" />
              2. Datos Personales Recopilados y Finalidades
            </h2>
            <p>Certifox recopila y procesa exclusivamente los siguientes datos necesarios para la prestación del servicio educativo técnico:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Datos de Identidad:</strong> Nombres completos, tipo y número de documento oficial de identidad (DNI, Carné de Extranjería o Pasaporte), así como entidad laboral o de afiliación técnica.</li>
              <li><strong>Datos de Contacto y Acceso:</strong> Dirección de correo electrónico y contraseña encriptada (con hash seguro mediante Better Auth).</li>
              <li><strong>Datos Académicos y de Acreditación:</strong> Progreso de lecciones en el aula virtual, entregas de evaluaciones técnicas, calificaciones emitidas por instructores y certificados digitales otorgados.</li>
            </ul>
            <p>
              <strong>Enmascaramiento Obligatorio (RNF-03):</strong> El número de documento oficial de identidad se mantiene enmascarado en la verificación pública de credenciales (mostrando únicamente caracteres iniciales y finales, ej. <code>7****203</code>) para prevenir cualquier riesgo de suplantación de identidad o exposición no consentida.
            </p>
          </section>

          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-[#0D1C2F]">
              3. Verificación Pública y Sello Criptográfico
            </h2>
            <p>
              Los certificados emitidos incorporan un código único no secuencial con entropía criptográfica superior a 96 bits y un hash SHA-256 inmutable. Al consultar la URL de verificación pública o escanear el código QR impreso en el diploma, el sistema únicamente expone la confirmación de validez, el nombre del titular acreditado, el documento enmascarado y los datos del curso oficial.
            </p>
            <p>
              La plataforma nunca exhibe datos bancarios, números de teléfono ni domicilios en ningún registro público.
            </p>
          </section>

          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-[#0D1C2F]">
              4. Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
            </h2>
            <p>
              Conforme a los artículos 18 al 22 de la Ley N° 29733, los titulares de datos personales pueden ejercer en cualquier momento sus derechos de:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Acceso:</strong> Solicitar información sobre los datos personales objeto de tratamiento en la plataforma.</li>
              <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos.</li>
              <li><strong>Cancelación:</strong> Solicitar la supresión de datos cuando no sean necesarios para la relación contractual formativa.</li>
              <li><strong>Oposición:</strong> Oponerse al tratamiento de datos por motivos legítimos y fundados.</li>
            </ul>
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#FD761A] shrink-0" />
              <p className="text-xs">
                Para solicitar el ejercicio de derechos ARCO, remite tu solicitud formal a: <strong>privacidad@certifox.pe</strong> indicando tu nombre completo, copia digital de DNI y la precisión del derecho a ejercer.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
