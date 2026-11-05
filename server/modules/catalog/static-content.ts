import type { CourseFaq, Prerequisite } from "@/features/catalog/types";

/** Contenido institucional común a todos los cursos (describe el proceso real de la plataforma). */
export const DEFAULT_PREREQUISITES: Prerequisite[] = [
  {
    iconName: "badge",
    title: "Documento de identidad vigente",
    description: "DNI, carnet de extranjería o pasaporte para el registro y la emisión del certificado.",
  },
  {
    iconName: "devices",
    title: "Dispositivo con conexión",
    description: "Navegador web en smartphone, tablet o computadora.",
  },
];

export const DEFAULT_COURSE_FAQS: CourseFaq[] = [
  {
    question: "¿Cómo recibo mi certificado?",
    answer:
      "Al completar todas las lecciones y aprobar las evaluaciones, la institución emite tu certificado digital con código único, QR y verificación pública.",
  },
  {
    question: "¿Cómo pago mi matrícula?",
    answer:
      "Al solicitar la matrícula verás los medios de pago habilitados por la institución. El acceso al aula se activa cuando confirman tu abono.",
  },
];
