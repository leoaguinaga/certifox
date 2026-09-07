import { Certificate } from "@/features/certificates/types";

export const MOCK_CERTIFICATES: Record<string, Certificate> = {
  "CFX-2025-9831": {
    code: "CFX-2025-9831",
    status: "valido",
    statusLabel: "Estado: Válido y Vigente",
    complianceStandards: [
      "ISO/IEC 17024 Compliant",
      "Criptografía SHA-256",
      "Identidad Biométrica Validada",
    ],
    student: {
      name: "Alejandro Morales Peñaloza",
      documentMasked: "•••• 9203",
      documentLawNotice: "Protegido por Ley 29733",
      biometricValidated: true,
    },
    course: {
      title: "Seguridad Operativa en Maquinaria Pesada",
      slug: "seguridad-operativa-maquinaria-pesada",
      courseCode: "OP-601",
      description:
        "Especialización Técnica en Operaciones Seguras de Línea Amarilla, Movimiento de Tierras y Prevención de Riesgos Críticos en Faenas Mineras a Cielo Abierto.",
      issuingEntity: "Centro Técnico MaqOps & FoxCode Industrial",
      instructor: {
        name: "Ing. Marco Viteri Valdivia",
        license: "CIP 182944 • Auditor Certificador ISO 45001",
      },
    },
    evaluation: {
      finalGrade: 19.4,
      maxGrade: 20.0,
      gradeScale: "SOBRESALIENTE (100% RÚBRICAS)",
      hours: 48,
      hoursDescription: "Teórico-prácticas en simulador y patio",
      issueDate: "14 Octubre 2024",
      validity: "Vigencia reglamentaria: 2 años",
      expirationDate: "14 Octubre 2026",
    },
    cryptography: {
      sha256: "8a9fe409b3628e811c0f0f49c01742de8b7c4270f92275ba2c4b8e2cb927c24e",
      timestampUtc: "2024-10-14 18:42:09 GMT-5",
      ledgerBlock: "#9,481,204",
      ledgerId: "#BL-882190",
    },
    competencies: [
      {
        title: "Inspección Pre-Operacional 360°",
        description:
          "Detección preventiva de fugas hidráulicas, holguras mecánicas y comprobación sistemática de cinturón y cabina ROPS/FOPS.",
        score: "Nota de campo: 20/20",
      },
      {
        title: "Control de Carga y Centro de Gravedad",
        description:
          "Maniobras en pendientes superiores a 15% con tolva cargada y cálculo dinámico de estabilidad en terreno inestable.",
        score: "Nota de campo: 19/20",
      },
      {
        title: "Normativa OSHA 1926 Subpart O",
        description:
          "Aplicación de protocolos de señalización de radio de giro, control de polvo y detención de emergencia sin retardo.",
        score: "Nota de campo: 19.2/20",
      },
    ],
  },
  "CFX-2024-0042": {
    code: "CFX-2024-0042",
    status: "revocado",
    statusLabel: "Estado: Credencial Revocada / No Vigente",
    complianceStandards: [
      "Invalidez Operativa Declarada",
      "Firma Digital Bloqueada",
    ],
    student: {
      name: "Juan Carlos Huamán Prado",
      documentMasked: "•••• 4410",
      documentLawNotice: "Protegido por Ley 29733",
      biometricValidated: false,
    },
    course: {
      title: "Certificación Operativa de Volquetes y Palas Hidráulicas",
      slug: "seguridad-operativa-maquinaria-pesada",
      courseCode: "OP-502",
      description:
        "Operación de equipos pesados de acarreo y carguío en tajos abiertos con estándares mineros.",
      issuingEntity: "Comité Técnico MaqOps & Minera Regional",
      instructor: {
        name: "Ing. Marco Viteri Valdivia",
        license: "CIP 182944",
      },
    },
    evaluation: {
      finalGrade: 14.0,
      maxGrade: 20.0,
      gradeScale: "APROBADO REGULAR",
      hours: 40,
      hoursDescription: "Horas de campo",
      issueDate: "10 Enero 2023",
      validity: "Vencida",
      expirationDate: "10 Enero 2024",
    },
    cryptography: {
      sha256: "3f82d1c990b764a2e5840d210fa094d1b827e1f409581a0b368412e09841f391",
      timestampUtc: "2023-01-10 11:15:00 GMT-5",
      ledgerBlock: "#8,102,491",
      ledgerId: "#BL-771920",
    },
    competencies: [
      {
        title: "Operación de Volquetes CAT 797F",
        description: "Transporte de mineral en rampas.",
        score: "Nota de campo: 14/20",
      },
    ],
    revocationDetails: {
      revocationDate: "31 de Enero de 2025",
      resolution: "REV-MAQOPS-2025-09",
      auditorResponsible: "Comité Técnico de Calidad MaqOps",
      reason: "Recertificación Anual Vencida",
      instruction:
        "No se autoriza el acceso a cabina ni operación de volquetes o palas bajo esta serie registral. Cualquier intento de presentación de documento impreso sin sello vigente constituye una infracción a los códigos de seguridad interna.",
    },
  },
  "CFX-2023-1102": {
    code: "CFX-2023-1102",
    status: "revocado",
    statusLabel: "Estado: Credencial Revocada / No Vigente",
    complianceStandards: [
      "Invalidez Operativa Declarada",
      "Firma Digital Bloqueada",
    ],
    student: {
      name: "Alejandro Morales Peñaloza",
      documentMasked: "•••• 9203",
      documentLawNotice: "Protegido por Ley 29733",
      biometricValidated: false,
    },
    course: {
      title: "Certificación Operativa No Válida para Faenas Mineras",
      slug: "seguridad-operativa-maquinaria-pesada",
      courseCode: "OP-401",
      description:
        "Esta credencial fue emitida previamente pero ha sido revocada formalmente debido a que el titular no completó el proceso obligatorio de actualización bianual en la Norma Técnica G-050.",
      issuingEntity: "Centro Técnico MaqOps",
      instructor: {
        name: "Ing. Marco Viteri Valdivia",
        license: "CIP 182944",
      },
    },
    evaluation: {
      finalGrade: 15.0,
      maxGrade: 20.0,
      gradeScale: "APROBADO PREVIO",
      hours: 32,
      hoursDescription: "Prácticas de campo",
      issueDate: "12 Noviembre 2022",
      validity: "Revocada",
      expirationDate: "12 Noviembre 2023",
    },
    cryptography: {
      sha256: "e7c2a5d99214b60f1b218412e873400192a71f021e8432a901f4c718b209e992",
      timestampUtc: "2022-11-12 14:20:00 GMT-5",
      ledgerBlock: "#7,601,234",
      ledgerId: "#BL-629104",
    },
    competencies: [
      {
        title: "Norma Técnica G-050",
        description: "Seguridad durante la construcción.",
        score: "Nota: 15/20",
      },
    ],
    revocationDetails: {
      revocationDate: "31 de Enero de 2025",
      resolution: "REV-MAQOPS-2025-09",
      auditorResponsible: "Comité Técnico de Calidad MaqOps",
      reason: "Recertificación Anual Vencida",
      instruction:
        "No se autoriza el acceso a cabina ni operación de volquetes o palas bajo esta serie registral. Cualquier intento de presentación de documento impreso sin sello vigente constituye una infracción a los códigos de seguridad interna.",
    },
  },
  "CFX-2024-REV0": {
    code: "CFX-2024-REV0",
    status: "revocado",
    statusLabel: "Estado: Credencial Revocada / No Vigente",
    complianceStandards: [
      "Invalidez Operativa Declarada",
      "Firma Digital Bloqueada",
    ],
    student: {
      name: "Víctor Raúl Mendoza Gálvez",
      documentMasked: "•••• 3192",
      documentLawNotice: "Protegido por Ley 29733",
      biometricValidated: false,
    },
    course: {
      title: "Control y Monitoreo de Relaves Mineros",
      slug: "gestion-operativa-relaves-mineros",
      courseCode: "MIN-402",
      description: "Estabilidad física y química de depósitos de relaves.",
      issuingEntity: "Instituto Geotécnico de Minería y FoxCode",
      instructor: {
        name: "Dr. Hernán Silva Carrión",
        license: "CIP 142091",
      },
    },
    evaluation: {
      finalGrade: 13.5,
      maxGrade: 20.0,
      gradeScale: "REGULAR",
      hours: 45,
      hoursDescription: "Sesiones en línea y gabinete",
      issueDate: "15 Marzo 2024",
      validity: "Suspendida",
      expirationDate: "15 Marzo 2025",
    },
    cryptography: {
      sha256: "bb92182049182374619283746129837461928374619283746192837461928374",
      timestampUtc: "2024-03-15 09:12:00 GMT-5",
      ledgerBlock: "#8,912,044",
      ledgerId: "#BL-801293",
    },
    competencies: [
      {
        title: "Piezometría y Monitoreo Hidráulico",
        description: "Lectura de instrumentos y curvas de nivel freático.",
        score: "Nota: 13/20",
      },
    ],
    revocationDetails: {
      revocationDate: "12 de Agosto de 2024",
      resolution: "REV-HSE-2024-11",
      auditorResponsible: "Comité Ético Minero",
      reason: "Inconsistencia en horas prácticas declaradas",
      instruction:
        "Firma digital suspendida preventivamente mientras concluye la auditoría presencial.",
    },
  },
  "CFX-2025-ELE1": {
    code: "CFX-2025-ELE1",
    status: "valido",
    statusLabel: "Estado: Válido y Vigente",
    complianceStandards: [
      "NFPA 70E Compliant",
      "Criptografía SHA-256",
      "Identidad Biométrica Validada",
    ],
    student: {
      name: "Carlos Mendoza Ruiz",
      documentMasked: "•••• 7812",
      documentLawNotice: "Protegido por Ley 29733",
      biometricValidated: true,
    },
    course: {
      title: "Seguridad Eléctrica y Bloqueo LOTO en Media Tensión",
      slug: "seguridad-electrica-bloqueo-loto",
      courseCode: "ELE-305",
      description:
        "Aislamiento y disipación de energías peligrosas bajo estándar OSHA 1910.147 y NFPA 70E.",
      issuingEntity: "FoxCode Industrial & Red Eléctrica Nacional",
      instructor: {
        name: "Ing. Sofía Carranza Ortiz",
        license: "CIP 198214",
      },
    },
    evaluation: {
      finalGrade: 18.8,
      maxGrade: 20.0,
      gradeScale: "SOBRESALIENTE",
      hours: 36,
      hoursDescription: "Prácticas de patio y banco de pruebas",
      issueDate: "20 Febrero 2025",
      validity: "Vigencia reglamentaria: 2 años",
      expirationDate: "20 Febrero 2027",
    },
    cryptography: {
      sha256: "1a83b9247c61d52ef048b2938a19283746192837461928374619283746192837",
      timestampUtc: "2025-02-20 16:30:12 GMT-5",
      ledgerBlock: "#9,812,091",
      ledgerId: "#BL-991204",
    },
    competencies: [
      {
        title: "Protocolo de Bloqueo / Etiquetado LOTO",
        description: "Comprobación de ausencia de tensión y colocación de candados multipunto.",
        score: "Nota de campo: 19/20",
      },
      {
        title: "Cálculo de Arco Eléctrico (Arc Flash)",
        description: "Selección de EPP ignífugo según categoría de riesgo térmico.",
        score: "Nota: 18.5/20",
      },
    ],
  },
  "CFX-2024-ISO1": {
    code: "CFX-2024-ISO1",
    status: "valido",
    statusLabel: "Estado: Válido y Vigente",
    complianceStandards: [
      "ISO/IEC 17024 Compliant",
      "ISO 45001 Lead Auditor Certified",
      "Criptografía SHA-256",
    ],
    student: {
      name: "Patricia Benavides Alvarado",
      documentMasked: "•••• 5190",
      documentLawNotice: "Protegido por Ley 29733",
      biometricValidated: true,
    },
    course: {
      title: "Auditor Interno de Sistemas Integrados de Gestión ISO 45001",
      slug: "auditor-interno-sig-iso-45001",
      courseCode: "ISO-450",
      description:
        "Planificación, ejecución y cierre de auditorías de conformidad conforme a ISO 19011.",
      issuingEntity: "Centro Internacional de Normalización FoxCode",
      instructor: {
        name: "Lic. Javier Paredes Ramos",
        license: "IRCA Certified Lead Auditor 008129",
      },
    },
    evaluation: {
      finalGrade: 19.0,
      maxGrade: 20.0,
      gradeScale: "SOBRESALIENTE",
      hours: 60,
      hoursDescription: "Talleres periciales y examen de certificación",
      issueDate: "05 Noviembre 2024",
      validity: "Vigencia reglamentaria: 3 años",
      expirationDate: "05 Noviembre 2027",
    },
    cryptography: {
      sha256: "9f821c90a1827461928374619283746192837461928374619283746192837461",
      timestampUtc: "2024-11-05 17:00:00 GMT-5",
      ledgerBlock: "#9,540,119",
      ledgerId: "#BL-894102",
    },
    competencies: [
      {
        title: "Diseño de Listas de Verificación ISO 19011",
        description: "Elaboración de matrices de hallazgos y no conformidades mayores.",
        score: "Nota: 19/20",
      },
      {
        title: "Evaluación de Riesgos Críticos IPERC",
        description: "Auditoría a controles operacionales y jerarquía de mitigación.",
        score: "Nota: 19/20",
      },
    ],
  },
};

export function getCertificateByCode(code: string): Certificate | null {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  return MOCK_CERTIFICATES[normalized] || null;
}

export function getAllCertificateCodes(): string[] {
  return Object.keys(MOCK_CERTIFICATES);
}

export function getAllCertificates(): Certificate[] {
  return Object.values(MOCK_CERTIFICATES);
}

export function isCodeValid(code: string): boolean {
  const cert = getCertificateByCode(code);
  return cert !== null && cert.status === "valido";
}
