export type CertificateStatus = "valido" | "revocado" | "observado" | "expirado";

export interface CertificateStudent {
  name: string;
  documentMasked: string;
  documentLawNotice: string;
  biometricValidated: boolean;
}

export interface CertificateCourse {
  title: string;
  slug: string;
  courseCode: string;
  description: string;
  issuingEntity: string;
  instructor: {
    name: string;
    license: string;
  };
}

export interface CertificateEvaluation {
  finalGrade: number;
  maxGrade: number;
  gradeScale: string;
  hours: number;
  hoursDescription: string;
  issueDate: string;
  validity: string;
  expirationDate: string;
}

export interface CertificateCryptography {
  sha256: string;
  timestampUtc: string;
  ledgerBlock: string;
  ledgerId: string;
}

export interface CertificateCompetencyRubric {
  title: string;
  description: string;
  score: string;
}

export interface CertificateRevocation {
  revocationDate: string;
  resolution: string;
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
