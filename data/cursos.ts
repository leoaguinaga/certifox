import { Course } from "@/features/catalog/types";

export const CURSOS: Course[] = [
  {
    id: "OP-601",
    code: "OP-601",
    slug: "seguridad-operativa-maquinaria-pesada",
    title: "Seguridad Operativa en Maquinaria Pesada",
    shortDescription:
      "Protocolos integrales de mitigación de fatalidades, inspección pre-operativa de equipos de línea amarilla y maniobras certificadas.",
    fullDescription:
      "Protocolos integrales de mitigación de fatalidades, inspección pre-operativa de equipos de línea amarilla y maniobras certificadas bajo marcos internacionales de seguridad ocupacional.",
    category: "Maquinaria",
    level: "Intermedio",
    hours: 48,
    lessonsCount: 11,
    priceUsd: 180,
    rating: 4.9,
    reviewsCount: 120,
    accessNote: "Acceso previa confirmación",
    hasVerifiableCertificate: true,
    hasQrCertificate: true,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBATXmZ_lcK_1sJzzOeIvRjWlAYN9zXPN_FKWSlt9C2eH_Ne4dVjlIHETJ3yZI3rg3HKYtD_r9e2crodOweebnB3EFP9bEZ1T07FzI-hEqYhjLz8IqLIf3Lc0OUEZhiWb1Tfh9UQjSu6AWajdpgcDJC5pumGMceZVwpiwlr8VkAWyRke_iuhxCDC1_R-hQ2j45lTJKy8CyRLAvoX_6ZdEH4MGi5ThcFuZ6BOxKtjaX47jYXRy5aXANf",
    imageAlt: "Operación de excavadoras y maquinaria pesada en terreno industrial",
    backdropUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBUYnN5Uq14HwaXIqv4bej8-sdax2ycFEiz-SJcAM14AZAzOLlGc_vcyxgI4VSYCiM6Z5Gmw1oDSP1EG9k1oON8TdAHGzt_vUx0Bc2Uu-g0Eo2Oy8lygp1B6KOVM2KUcC9aAQLHNO1s2CVg1aH9V2elm0aTFf_aBB7Qm55mLsNd4i9jFo-1Sm6pSpAU4lK0CGRDXHj0SFuvQTozJf5-ypYcThSRv0om2oPZNZm97v6Lu90yEhSNRljR",
    instructorName: "Ing. Marco Viteri",
    instructor: {
      name: "Ing. Marco Viteri Valdivia",
      role: "Especialista en Gestión de Riesgo y Operaciones de Línea Amarilla • 16 años de experiencia",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBp8fbSmmUjxZ-hl58gG_g56pRgHYV1jWDgwvgcHEsxrQSOo9iGqLnJ86bRsnf-EvcC_-HvC-3-fXwtbDQ27r2uXqnJ8iU0ERaXL1umXXw0ZCI49QQeKy7F9r7Ai8B2xmjccScuea7DHslp2p8VqJQ9FsqhozIKpckAiLdYc6DNuUDRUIN2JYcZeHiUvtqsrRjpV2KDrTRqQQT8yTTilFItFlCsffouF0ffAt9oKeczc369aB4B9m-_",
      cipNumber: "CIP Nº 182944",
      bio: "Ingeniero de Minas con posgrado en Prevención de Riesgos Operacionales en Minería de Gran Superficie. Con más de 16 años liderando programas de cero fatalidades en flotas Komatsu y Caterpillar en Chile y Perú. Ex-instructor técnico sénior para contratistas de tajo abierto.",
      accreditedStudents: 1420,
      rating: 4.9,
    },
    competencies: [
      {
        title: "Auditoría Pre-arranque",
        description: "Checklist certificado en fluidos, fugas hidráulicas, frenos y tren de rodaje en cargadores 950H+.",
      },
      {
        title: "Marco Legal OSHA & ISO 45001",
        description: "Aplicación de responsabilidades de mando, permisos de alto riesgo (PETAR) y análisis AST/IPERC.",
      },
      {
        title: "Delimitación de Zonas Ciegas",
        description: "Modelado de radio de giro, ángulo muerto y radio de expulsión en excavadoras de más de 30 toneladas.",
      },
      {
        title: "Estabilidad en Taludes Críticos",
        description: "Cálculo de centro de gravedad dinámico en pendientes > 25° y proximidad a excavaciones abiertas.",
      },
      {
        title: "Gestión de Zonas Confinadas",
        description: "Protocolos de escape, ventilación forzada y señalética unificada de rigger en maniobras cerradas.",
      },
      {
        title: "Protocolo de Bloqueo LOTO",
        description: "Disipación de energía residual hidráulica, neumática y eléctrica antes del mantenimiento en campo.",
      },
    ],
    curriculum: [
      {
        moduleNumber: "01",
        title: "Módulo 1: Marco normativo y estándares OSHA/ISO",
        summary: "3 lecciones • 1 cuestionario de afianzamiento • 10 horas",
        hours: 10,
        lessons: [
          {
            title: "1.1 Legislación internacional sobre maquinaria pesada (OSHA 1926 Subpart O)",
            duration: "35 min",
            type: "video",
          },
          {
            title: "1.2 Responsabilidad penal y administrativa en siniestros mineros y viales",
            duration: "42 min",
            type: "video",
          },
          {
            title: "1.3 Formulación de Matrices IPERC Continuo y Análisis Seguro de Trabajo (AST)",
            duration: "50 min",
            type: "video",
          },
          {
            title: "Cuestionario de Afianzamiento: Estándares y Normas Aplicadas",
            meta: "15 Preguntas",
            type: "quiz",
          },
        ],
      },
      {
        moduleNumber: "02",
        title: "Módulo 2: Inspección pre-operacional en excavadoras y cargadores",
        summary: "4 lecciones • 1 tarea práctica evaluada • 14 horas",
        hours: 14,
        lessons: [
          {
            title: "2.1 Procedimiento de inspección alrededor del equipo (Walk-Around Inspection)",
            duration: "48 min",
            type: "video",
          },
          {
            title: "2.2 Diagnóstico preventivo de líneas presurizadas y sellos de vástago",
            duration: "55 min",
            type: "video",
          },
          {
            title: "2.3 Comprobación del sistema de frenado secundario y parada de emergencia (E-Stop)",
            duration: "38 min",
            type: "video",
          },
          {
            title: "2.4 Estructuras ROPS / FOPS: Criterios de rechazo y fatiga estructural",
            duration: "40 min",
            type: "video",
          },
          {
            title: "Tarea Práctica: Llenado y firma de cartilla pre-uso con hallazgo crítico",
            meta: "Revisión docente",
            type: "assignment",
          },
        ],
      },
      {
        moduleNumber: "03",
        title: "Módulo 3: Maniobras en taludes y zonas confinadas",
        summary: "3 lecciones • Simulador de incidentes • 12 horas",
        hours: 12,
        lessons: [
          {
            title: "3.1 Dinámica de volteo y preservación de bermas de seguridad",
            duration: "52 min",
            type: "video",
          },
          {
            title: "3.2 Coordinación radial de tráfico pesado y radio de giro simultáneo",
            duration: "45 min",
            type: "video",
          },
          {
            title: "3.3 Trabajos en zanjas: Distancias seguras a líneas eléctricas de alta tensión",
            duration: "40 min",
            type: "video",
          },
        ],
      },
      {
        moduleNumber: "04",
        title: "Módulo 4: Evaluación final y certificación",
        summary: "Examen teórico 25 preguntas • Emisión de credencial digital • 12 horas",
        hours: 12,
        lessons: [
          {
            title: "4.1 Repaso guiado y banco de casos de siniestralidad real",
            duration: "30 min",
            type: "video",
          },
          {
            title: "Examen Teórico Oficial de Acreditación (25 preguntas - Nota mínima 80%)",
            meta: "Auditado",
            type: "exam",
          },
        ],
      },
    ],
    prerequisites: [
      {
        iconName: "badge",
        title: "Licencia Vigente",
        description: "Deseable brevete profesional A-IIIb / A-IIIc o certificación de operador básico.",
      },
      {
        iconName: "engineering",
        title: "Experiencia de Campo",
        description: "Mínimo 6 meses en operaciones mineras, viales o de movimiento de tierras masivo.",
      },
      {
        iconName: "devices",
        title: "Conectividad Básica",
        description: "Dispositivo móvil o PC con conexión para visualización de esquemas y rendición de test.",
      },
    ],
    faqs: [
      {
        question: "¿Cómo y cuándo recibo mi certificado?",
        answer:
          "Una vez aprobado el examen del Módulo 4 con 80% o más, el sistema genera de forma automática tu diploma con código criptográfico único FoxID y código QR de validación pública. Podrás descargarlo inmediatamente en formato PDF de alta resolución.",
      },
      {
        question: "¿Cómo valida una empresa contratista mi certificado?",
        answer:
          "Cualquier departamento de RRHH o Seguridad puede ingresar al Verificador Público de Certifox o escanear el QR con su teléfono para corroborar el estado en tiempo real (Válido, Nombre del alumno, Nota final y Horas lectivas respaldadas).",
      },
      {
        question: "¿Qué significa que la matrícula tiene confirmación manual?",
        answer:
          "Certifox no almacena tarjetas de crédito ni procesa transacciones bancarias directas en esta instancia. Tu solicitud llega directamente a la coordinación académica de la entidad, quienes se contactarán para concertar el método de pago local (transferencia, factura o depósito) y habilitar tu aula en menos de 2 horas hábiles.",
      },
    ],
    includes: [
      "Acceso vitalicio al contenido del curso y actualizaciones 2025",
      "Examen de acreditación oficial con 2 intentos incluidos",
      "Certificado con QR público verificable y descargable en PDF",
      "Soporte directo del docente mediante foro de consultas técnicas",
    ],
  },
  {
    id: "MIN-402",
    code: "MIN-402",
    slug: "supervisor-seguridad-salud-mineria-subterranea",
    title: "Supervisor de Seguridad y Salud en Minería Subterránea",
    shortDescription:
      "Normativa técnica de ventilación, sostenimiento de labores y supervisión de cuadrillas bajo estándares ISO 45001 y DS-024.",
    fullDescription:
      "Capacitación avanzada para supervisores de mina enfocada en la mitigación de riesgos críticos de caída de rocas, gaseamiento y transporte en interior mina.",
    category: "Seguridad y Minería",
    level: "Avanzado",
    hours: 40,
    lessonsCount: 10,
    priceUsd: 149,
    rating: 4.9,
    reviewsCount: 120,
    accessNote: "Acceso previa confirmación",
    hasVerifiableCertificate: true,
    hasQrCertificate: true,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBvWNGjsOPNawrld9IwTQZuIua8MtysjmDdDHE3VU0C6NeospXxh09zKO80W-jVgZdVaT4aOqKoN4idFA-XTavOFjL4E1d62jKBB9uZGKW5-2b7PEX33P-g7U5CuWV3eOe7Bze_sO_D5JVECtV_Y9F7xwrJiNj-OLafDz-BP7CNKMlO8ePx80jOXqK38ru5Sd0gINys6DAAdAxcl4VVqn2yoE8ZoCnt59DG_qVaaRUTWarV5tRNnlVe",
    imageAlt: "Supervisor de seguridad en mina subterránea con casco y chaleco reflectivo",
    backdropUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCa37R4MbafIZQpc12n9lMo3itB21MaI2LvpnEbNcpskd1hH3hMls7VsjE7TQti3iQCR5BHawxzZ_BdVKqTKzqjwga5K9dzopo806sjaw5g-gTbqagor3CTQXHvOuMpARSzfpU8fnqvTz4Ufx4ePcRdcBWDeUISn9TgdLFBxZg0NeB_nSPJUxKN5TLE-_jBmMqsQRkv4GRPaWZ_24pXewUb94FVOTuas7fSm6GwiEOEPoFh88m1V0qq",
    instructorName: "Ing. Carlos Morales",
    instructor: {
      name: "Ing. Carlos Morales",
      role: "Auditor Líder en Seguridad Minera e Higiene Industrial • 14 años en minería de socavón",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBgeHGoYSgtEWnjrWSngdZmYfgT1qxr1JFccX1ewQtgm6sOvbrUL17SvUL-UzqrPVWiEtM8bQ1ebu_JQe1MTlXyiDNrOOLhPw0gYa3AoSKjXaSxzkiDHyn7sbPw2S__XBjf5Zy9-lA0HSjPuGNnxW2pLD4OJ8UFu3yrEsOszr3NLv2-Q43QO9vO_xtdsEz0_6vDkCzJ_nF0NCWL_OEuHHJpdEHmh7B1jR7JfiXdfwmC0wJhQmEBjzTD",
      cipNumber: "CIP Nº 152831",
      bio: "Ingeniero de Minas con especialización en Geomecánica y Gestión de Desastres Mineros. Ha liderado comités paritarios y auditorías para las principales compañías mineras polimetálicas de la región.",
      accreditedStudents: 980,
      rating: 4.9,
    },
    competencies: [
      {
        title: "Diagnóstico Geomecánico",
        description: "Clasificación de macizos rocosos (RMR / Q de Barton) e inspección de pernos y mallas.",
      },
      {
        title: "Monitoreo Atmosférico",
        description: "Detección de gases letales (CO, NOX, H2S) y control de caudales de ventilación principal.",
      },
      {
        title: "Respuesta ante Emergencias",
        description: "Comando de brigadas de rescate minero y refugios móviles de supervivencia.",
      },
    ],
    curriculum: [
      {
        moduleNumber: "01",
        title: "Módulo 1: Marco normativo minero y fiscalización",
        summary: "3 lecciones • 10 horas",
        hours: 10,
        lessons: [
          { title: "1.1 Estándares de seguridad según D.S. 024-2016-EM", duration: "45 min", type: "video" },
          { title: "1.2 Gestión de incidentes y fiscalización laboral", duration: "50 min", type: "video" },
        ],
      },
      {
        moduleNumber: "02",
        title: "Módulo 2: Sostenimiento y control geomecánico",
        summary: "3 lecciones • 12 horas",
        hours: 12,
        lessons: [
          { title: "2.1 Técnicas de desate de rocas mecanizado y manual", duration: "60 min", type: "video" },
          { title: "2.2 Instalación certificada de pernos helicoidales y shotcrete", duration: "45 min", type: "video" },
        ],
      },
    ],
    prerequisites: [
      {
        iconName: "badge",
        title: "Experiencia Minera",
        description: "Experiencia previa en faenas de socavón o estudios técnicos concluidos.",
      },
      {
        iconName: "engineering",
        title: "EPP Certificado",
        description: "Conocimiento de protocolos de protección personal nivel 3.",
      },
      {
        iconName: "devices",
        title: "Acceso Digital",
        description: "Conexión a internet para el aula virtual y evaluaciones en línea.",
      },
    ],
    faqs: [
      {
        question: "¿El certificado sirve para postular a empresas contratistas?",
        answer: "Sí, la credencial Certifox cuenta con validación pública con código QR inmutable y es ampliamente reconocida por unidades mineras.",
      },
    ],
    includes: [
      "Acceso vitalicio al material de estudio",
      "Evaluación y certificación digital auditada",
      "Soporte directo del docente",
    ],
  },
  {
    id: "ELE-305",
    code: "ELE-305",
    slug: "programacion-diagnostico-plc-siemens",
    title: "Programación y Diagnóstico de Controladores Lógicos (PLC Siemens)",
    shortDescription:
      "Arquitectura TIA Portal, redes industriales PROFINET, lógica ladder y depuración en plantas automatizadas.",
    fullDescription:
      "Domina el entorno TIA Portal v18 para la configuración de controladores S7-1200 y S7-1500, diseño de pantallas HMI y diagnóstico de fallas de comunicación industrial.",
    category: "Electricidad",
    level: "Intermedio",
    hours: 36,
    lessonsCount: 10,
    priceUsd: 165,
    rating: 4.9,
    reviewsCount: 120,
    accessNote: "Acceso previa confirmación",
    hasVerifiableCertificate: true,
    hasQrCertificate: true,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAYQ21XphGr5_1HwWU0l41H54aPbHh5i_csTjL2EQ8yw4L_sWB59GrR6nADw7v3o-JZbdRo3OvpXq95UQcdIPdMOL79bIVlD7Fx_GIIofwbvLNOgUP4ktDHhohRej-ChGj9LaZxFye_sCvXgR0j4leVo3cH64Wu7L9-JOQ58KV6Z73AALOSYk9fWN-Zx4EfhGaDeN9X0Iw1t1X5gOezXoJB7ctVVUkBXWVgYCSpNL8NEuOhPlA1t_em",
    imageAlt: "Tablero eléctrico industrial de automatización con PLC Siemens y cableado estructurado",
    backdropUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAYQ21XphGr5_1HwWU0l41H54aPbHh5i_csTjL2EQ8yw4L_sWB59GrR6nADw7v3o-JZbdRo3OvpXq95UQcdIPdMOL79bIVlD7Fx_GIIofwbvLNOgUP4ktDHhohRej-ChGj9LaZxFye_sCvXgR0j4leVo3cH64Wu7L9-JOQ58KV6Z73AALOSYk9fWN-Zx4EfhGaDeN9X0Iw1t1X5gOezXoJB7ctVVUkBXWVgYCSpNL8NEuOhPlA1t_em",
    instructorName: "Ing. Elena Rojas",
    instructor: {
      name: "Ing. Elena Rojas",
      role: "Especialista en Automatización Industrial y Sistemas SCADA • Siemens Certified Professional",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBIWdxP5tHuXjiLhjq75uR4va-YYj1dxknBzsHE4FOQr6-ZGENhIR5zej1qeVeGM2funQ4ulZHq08jmdluP358E_Fw1aZ7UwpN-a_GDOPJwDFHOtWv4KkPWRHaQElwksI9O70wg7RuN0gF7Hl8SicTFLXmx0r-HuhmaMkof1Nl2rSypU-xoTJni6xep9LNJwh3gCKVI3X__JOB9CF9LBTxBnq_yhod6d0rxXFM8JW6OM_jG-DqKBHB_",
      cipNumber: "CIP Nº 194120",
      bio: "Ingeniera Electrónica con más de 12 años integrando líneas de embotellado, fajas transportadoras y plantas de tratamiento de agua con controladores Siemens y Rockwell.",
      accreditedStudents: 850,
      rating: 4.9,
    },
    competencies: [
      {
        title: "Programación en TIA Portal",
        description: "Estructuración en bloques FB, FC, DB y lenguajes Ladder / SCL.",
      },
      {
        title: "Redes PROFINET y Modbus",
        description: "Configuración de topologías de comunicación industrial y enlaces I/O distribuidos.",
      },
      {
        title: "Diagnóstico en Línea",
        description: "Uso de buffers de diagnóstico de CPU y tablas de observación en tiempo real.",
      },
    ],
    includes: [
      "Simuladores de PLC (PLCSIM) y plantillas de proyecto",
      "Certificado con código único y validación QR",
      "Resolución de dudas en foro técnico",
    ],
  },
  {
    id: "ISO-450",
    code: "ISO-450",
    slug: "auditor-interno-iso-45001-2018",
    title: "Auditor Interno de Sistemas de Gestión ISO 45001:2018",
    shortDescription:
      "Técnicas de auditoría según ISO 19011, redacción de no conformidades y planes de acción correctiva.",
    fullDescription:
      "Formación integral para profesionales responsables de la verificación y mejora continua del sistema de gestión de seguridad y salud en el trabajo bajo la norma ISO 45001:2018.",
    category: "Gestión e ISO",
    level: "Intermedio",
    hours: 48,
    lessonsCount: 12,
    priceUsd: 135,
    rating: 4.9,
    reviewsCount: 120,
    accessNote: "Acceso previa confirmación",
    hasVerifiableCertificate: true,
    hasQrCertificate: true,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAU00WRuV6tyXS-M4pFMqjIv3cKxovIWH3kq0QirLEHdaxiN_7yNFzZKWQgPFKJ3KqCYQ107Jl6WRatfVo-CYbsj3I8mDyXZlzni2vkpp0cvmIcO-kKSXn1J4hplrjTWe-XGpicG0Wu25_L5TijB9iIDUZyAXWDy_-Y3PrX1Agw6ZJyq9baYAg_OOLL-qOFLFl1fmyc9-gfSYmyu8Rr1NtMhtu4-vUofKtAnedrov64qANSyzps6Jo5",
    imageAlt: "Auditor de calidad revisando documentación de cumplimiento en oficina corporativa",
    backdropUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAU00WRuV6tyXS-M4pFMqjIv3cKxovIWH3kq0QirLEHdaxiN_7yNFzZKWQgPFKJ3KqCYQ107Jl6WRatfVo-CYbsj3I8mDyXZlzni2vkpp0cvmIcO-kKSXn1J4hplrjTWe-XGpicG0Wu25_L5TijB9iIDUZyAXWDy_-Y3PrX1Agw6ZJyq9baYAg_OOLL-qOFLFl1fmyc9-gfSYmyu8Rr1NtMhtu4-vUofKtAnedrov64qANSyzps6Jo5",
    instructorName: "Mg. Rodrigo Salgado",
    instructor: {
      name: "Mg. Rodrigo Salgado",
      role: "Lead Auditor IRCA ISO 45001 & Consultor Senior en Sistemas Integrados de Gestión",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA1ASPEJseLmaPWrojRvZkoGKjishJbD5AYZBFzfvjnQ3Tqvo8twIH827pjo0HE2o23D5X951FaMsQIXnUPBuebgEpqVmMs5x8jotsDAXFzk_-sDJUIK0hd4Fi7GUmaAYezIFV4GVzyNCpOyxFc6jXLK8nvxR1D-GeoacTmi7dDYkwAOg6waNTDjKSfuVkJ6orAA_HY93ucLsuVmHrlmaegPJV2VPw5tH3Wvt1PJQeGlGXexYL4eycz",
      cipNumber: "CIP Nº 167240",
      bio: "Master en Gestión Integrada de Seguridad, Medio Ambiente y Calidad. Ha liderado más de 120 auditorías de certificación y seguimiento para empresas de energía, construcción y manufactura.",
      accreditedStudents: 1100,
      rating: 4.9,
    },
    competencies: [
      {
        title: "Interpretación Clave por Clave",
        description: "Comprensión de los requisitos de liderazgo, planificación de riesgos y evaluación del desempeño.",
      },
      {
        title: "Protocolo de Entrevistas y Evidencias",
        description: "Técnicas de muestreo de campo y verificación de controles operacionales.",
      },
      {
        title: "Redacción de Informes de Auditoría",
        description: "Construcción objetiva de hallazgos, no conformidades mayores y oportunidades de mejora.",
      },
    ],
    includes: [
      "Checklists y modelos de informe descargables",
      "Certificado oficial de Auditor Interno",
      "Examen de homologación",
    ],
  },
  {
    id: "IND-208",
    code: "IND-208",
    slug: "mantenimiento-predictivo-termografia-industrial",
    title: "Mantenimiento Predictivo y Termografía en Plantas de Procesos",
    shortDescription:
      "Termografía infrarroja nivel I, análisis de vibraciones mecánicas y planes de lubricación de precisión.",
    fullDescription:
      "Aprende a diagnosticar anomalías térmicas en transformadores, motores de inducción y tableros de potencia antes de que ocurran paradas no programadas en planta.",
    category: "Electricidad",
    level: "Intermedio",
    hours: 28,
    lessonsCount: 10,
    priceUsd: 120,
    rating: 4.9,
    reviewsCount: 120,
    accessNote: "Acceso previa confirmación",
    hasVerifiableCertificate: true,
    hasQrCertificate: true,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBeyliSmHT_cTU3_4T_CO_XBg5Mx2QFieCtBaJrr3wUXwWqcVA2VCzcMtiCtBMUPkS5NAC7UgffFow8xkZPROKfCfqlTwgqaGgM3dE8-KB0CCFbVRa_rGTkMx9Uf45yTPoGHetPvNGwBXRhjfRGtKJ_QTCvnXn1yj6fwXsMrbm-U7WJXF5gSrlpiI6OwNAo6xaHi0n92OYOrOwSy4DVccBuUdtbhKBpM-0aNMvdwfoR-a0XvbiWa3jh",
    imageAlt: "Cámara termográfica industrial analizando calor en transformador de alta tensión",
    backdropUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2HUg52eK_gByYfuXeUhfOrcNza-VbixV3eOiz_1Ooag9UKzM7K-SUSslvogrB_3mv_m6RHl1GQpGDXvCMbGBMhPfr-2i-lYCv8ADJmcsQkgStphguUeAHXVVR2_J6oXeMsUJHwI3MymbTRb3FNo9dzSt1E1uEiCwesau6AXShifmK7BW7zHzzyPLGM9xGZPXhvs07eZ8_Xv6te_C9-RqMwzG7nlu6mOtX4xkLrPO_C4orfRP6sK-a",
    instructorName: "Ing. Fabián Gómez",
    instructor: {
      name: "Ing. Fabián Gómez",
      role: "Consultor en Confiabilidad Operacional y Termógrafo Certificado Nivel II (ITC)",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD6FKdgB05sllOjF3z_SIPYcasOZ9EAU4t89wvWvkaTCWFNieyX1gwspZWPupR8wSRttxg6I6LSvjwUxTWN8Kr8XMG0Q9SpSRkh_XZbS3VaBNzEPGZz9Ty810OCFgDnD1IyK2SBKxs3ocQ5HpYXZcThBZz4w70X37xFsPhLeEW5LGel0ODQCIe85GFk130Hpnwo6vEz2KwFPOHaaWk0Halpb3JoTVN02DVqtslSTQdZGlrTrSXLHfyQ",
      cipNumber: "CIP Nº 178552",
      bio: "Ingeniero Mecánico Electricista especializado en gestión de activos bajo ISO 55000. Ha implementado programas de mantenimiento predictivo en plantas siderúrgicas y de celulosa.",
      accreditedStudents: 690,
      rating: 4.9,
    },
    competencies: [
      {
        title: "Termografía Cuantitativa",
        description: "Emisividad, temperatura reflejada aparente y calibración de paletas térmicas.",
      },
      {
        title: "Diagnóstico Eléctrico",
        description: "Detección de puntos calientes en subestaciones, bornes flojos y desequilibrios de fase.",
      },
      {
        title: "Elaboración de Reportes",
        description: "Priorización de criticidad y planes de remediación rápida.",
      },
    ],
    includes: [
      "Casos reales de termografía con curvas de falla",
      "Certificado emitido con código registral",
      "Plantillas de reporte predictivo",
    ],
  },
  {
    id: "ENV-140",
    code: "ENV-140",
    slug: "gestion-ambiental-estrategica-iso-14001",
    title: "Gestión Ambiental Estratégica e Implementación ISO 14001:2015",
    shortDescription:
      "Matriz de aspectos e impactos ambientales, huella de carbono y cumplimiento regulatorio en operaciones productivas.",
    fullDescription:
      "Aprende a formular y liderar planes de manejo ambiental corporativos, gestión integral de residuos sólidos industriales y preparación ante fiscalizaciones de entidades reguladoras.",
    category: "Gestión e ISO",
    level: "Intermedio",
    hours: 32,
    lessonsCount: 10,
    priceUsd: 110,
    rating: 4.9,
    reviewsCount: 120,
    accessNote: "Acceso previa confirmación",
    hasVerifiableCertificate: true,
    hasQrCertificate: true,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-Q3yf36EMHg6TgG8aDkW6LWxo-tAVcLmfODE3bTr5jjMmdJ-Kuu_l0ghwovkGg0kdKKOG6GjrGKbO11w3rBBuQpCHBkFtb09pM30pe1_3UDTy3PkWOCIV52mWAD2IQJAKAUsc2Bijmpn0tsM8qqE92QWpGNOj_PIWK5rH1BpJAKP2_9gPXsJNODAQrtuEVc2xstMLCawg9KP7w7Zh9pBkttfjwDHC5XpD7mQU3uc5cVZxUw2bHngq",
    imageAlt: "Ingeniera ambiental monitoreando calidad de efluentes en planta ecológica",
    backdropUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-Q3yf36EMHg6TgG8aDkW6LWxo-tAVcLmfODE3bTr5jjMmdJ-Kuu_l0ghwovkGg0kdKKOG6GjrGKbO11w3rBBuQpCHBkFtb09pM30pe1_3UDTy3PkWOCIV52mWAD2IQJAKAUsc2Bijmpn0tsM8qqE92QWpGNOj_PIWK5rH1BpJAKP2_9gPXsJNODAQrtuEVc2xstMLCawg9KP7w7Zh9pBkttfjwDHC5XpD7mQU3uc5cVZxUw2bHngq",
    instructorName: "Dra. Patricia Méndez",
    instructor: {
      name: "Dra. Patricia Méndez",
      role: "Especialista en Derecho Ambiental y Consultora en Economía Circular • PhD en Ciencias Ambientales",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCI4YYLdSd2HeS5nKbddywRMDfD3MnwaGdGyvBbPQdJ3YfAKDf8ZX3cqYLTWRzJxq0-DqM3f0FHa6iHZyLd8-4PtIqzmPLQvVv9dWeZKsssML5UZ5q-jLHiWK6wRnUpztSqqDzdiBSfsPQZy_R35jnMUL7c63Xowyt_xOtLnBw81VUUKgOdV_Tvi6CX20jIBbFryiHEAFW9ZO5_--LMWDlQm-Ys8OaFHVJlTITPVr-H0JbxqF5eBNbt",
      cipNumber: "CIP Nº 139044",
      bio: "Doctora en Ciencias Ambientales con más de 18 años asesorando proyectos mineros y energéticos en estudios de impacto ambiental (EIA) y planes de cierre de pasivos mineros.",
      accreditedStudents: 740,
      rating: 4.9,
    },
    competencies: [
      {
        title: "Matriz de Aspectos e Impactos",
        description: "Metodología Leopold y Conesa para valoración cuantitativa de severidad y probabilidad.",
      },
      {
        title: "Manejo Integral de Residuos",
        description: "Clasificación de residuos peligrosos (RESPEL) y cadenas de custodia de disposición final.",
      },
      {
        title: "Planes de Contingencia Ambiental",
        description: "Protocolos de contención de derrames de hidrocarburos y sustancias químicas.",
      },
    ],
    includes: [
      "Matrices ambientales en formato editable",
      "Diploma con verificación digital",
      "Guías oficiales de fiscalización",
    ],
  },
];

/**
 * Devuelve todos los cursos disponibles en el catálogo.
 */
export function getAllCourses(): Course[] {
  return CURSOS;
}

/**
 * Busca un curso por id (código) o por slug amigable.
 */
export function getCourseByIdOrSlug(idOrSlug: string): Course | undefined {
  const normalized = decodeURIComponent(idOrSlug).trim().toLowerCase();
  return CURSOS.find(
    (c) =>
      c.id.toLowerCase() === normalized ||
      c.code.toLowerCase() === normalized ||
      c.slug.toLowerCase() === normalized
  );
}

/**
 * Devuelve las categorías con la cantidad de cursos en cada una.
 */
export function getCatalogCategories() {
  const categories: Record<string, number> = {
    "Todos": CURSOS.length,
    "Seguridad y Minería": 0,
    "Maquinaria": 0,
    "Electricidad": 0,
    "Gestión e ISO": 0,
  };

  CURSOS.forEach((course) => {
    if (categories[course.category] !== undefined) {
      categories[course.category]++;
    }
  });

  return categories;
}
