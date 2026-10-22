import { getSession } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  getStudentCertificatesCollection,
  getInstructorCertificatesDashboard,
} from "@/server/services/certificate-management.service";
import { CertificatesManagementView } from "@/features/certificates-management/components/certificates-management-view";
import { maskDocumentNumber } from "@/server/services/certificate.service";
import {
  StudentCertificateItem,
  EligibleEnrollmentItem,
} from "@/features/certificates-management/types";

export const dynamic = "force-dynamic";

export default async function CampusCertificadosPage() {
  const session = await getSession();

  if (!session) {
    redirect("/ingresar?from=/campus/certificados");
  }

  const role = session.user.role;

  if (role === "STUDENT") {
    const rawCerts = await getStudentCertificatesCollection(session);
    const studentCertificates: StudentCertificateItem[] = rawCerts.map((c) => ({
      id: c.id,
      code: c.code,
      sha256: c.sha256,
      status: c.status,
      issuedAt: c.issuedAt.toISOString(),
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      revokedAt: c.revokedAt ? c.revokedAt.toISOString() : null,
      revocationReason: c.revocationReason,
      courseTitle: c.enrollment.course.title,
      courseSlug: c.enrollment.course.slug,
      hours: c.enrollment.course.hours,
      instructorName: c.enrollment.course.instructor.name,
      institution: c.enrollment.course.instructor.institution,
      studentName: session.user.name || "Estudiante",
      studentDocumentMasked: "72****03",
    }));

    return (
      <CertificatesManagementView
        role="STUDENT"
        studentCertificates={studentCertificates}
        eligibleEnrollments={[]}
      />
    );
  }

  // Instructor
  const rawEnrollments = await getInstructorCertificatesDashboard(session);
  const eligibleEnrollments: EligibleEnrollmentItem[] = rawEnrollments.map((enr) => ({
    enrollmentId: enr.id,
    studentId: enr.user.id,
    studentName: enr.user.name,
    studentEmail: enr.user.email,
    studentDocumentMasked: enr.user.documentNumber
      ? maskDocumentNumber(enr.user.documentNumber)
      : "Sin DNI",
    courseId: enr.course.id,
    courseTitle: enr.course.title,
    completedAt: enr.completedAt ? enr.completedAt.toISOString() : "",
    certificateCode: enr.certificate?.code || null,
    certificateStatus: enr.certificate?.status || null,
  }));

  return (
    <CertificatesManagementView
      role="INSTRUCTOR"
      studentCertificates={[]}
      eligibleEnrollments={eligibleEnrollments}
    />
  );
}
