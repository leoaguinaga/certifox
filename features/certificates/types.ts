export type CertificateStatus = "valido" | "revocado" | "observado" | "expirado";

export interface CertificateStudent {
  name: string;
  documentMasked: string;
  documentLawNotice: string;
}

export interface CertificateCourse {
  title: string;
  slug: string;
  courseCode: string;
  description: string;
  issuingEntity: string;
  instructor: {
    name: string;
  };
}

export interface CertificateEvaluation {
  /** Promedio de evaluaciones aprobadas (0–20); null si el curso no tiene evaluaciones. */
  finalGrade: number | null;
  maxGrade: number;
  hours: number;
  issueDate: string;
  validity: string;
  expirationDate: string;
}

export interface CertificateCryptography {
  sha256: string;
  timestampUtc: string;
  /** Id interno del registro de emisión. */
  recordId: string;
}

export interface CertificateCompetencyRubric {
  title: string;
  description: string;
  score: string;
}

export interface CertificateRevocation {
  revocationDate: string;
  auditorResponsible: string;
  reason: string;
  instruction: string;
}

export interface Certificate {
  code: string;
  status: CertificateStatus;
  statusLabel: string;
  complianceStandards: string[];
  student: CertificateStudent;
  course: CertificateCourse;
  evaluation: CertificateEvaluation;
  cryptography: CertificateCryptography;
  competencies: CertificateCompetencyRubric[];
  revocationDetails?: CertificateRevocation;
}
