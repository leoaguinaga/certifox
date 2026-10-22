export interface StudentCertificateItem {
  id: string;
  code: string;
  sha256: string;
  status: "VALID" | "EXPIRED" | "REVOKED" | "OBSERVED";
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  revocationReason: string | null;
  courseTitle: string;
  courseSlug: string;
  hours: number;
  instructorName: string;
  institution: string | null;
  studentName: string;
  studentDocumentMasked: string;
}

export interface EligibleEnrollmentItem {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDocumentMasked: string;
  courseId: string;
  courseTitle: string;
  completedAt: string;
  certificateCode: string | null;
  certificateStatus: string | null;
}
