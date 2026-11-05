import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/core/db";
import { gradeAssignment, submitAssignment } from "@/server/modules/assessment/assessment.service";
import { issueCertificate, revokeCertificate } from "@/server/modules/certification/certification.service";
import { getPublicCertificate } from "@/server/modules/certification/verification.service";
import { confirmEnrollmentPayment, requestEnrollment } from "@/server/modules/enrollment/enrollment.service";
import { getClassroomData, toggleLessonProgress } from "@/server/modules/learning/classroom.service";
import { addMember, createCourse, createOrg, createUser, ctxFor, hasDb, resetDb } from "./helpers";

describe.skipIf(!hasDb)("aula, evaluación y certificación (Postgres real)", () => {
  beforeEach(resetDb);

  async function activeEnrollment(opts: { withAssessment?: boolean } = {}) {
    const org = await createOrg();
    const instructor = await createUser("Profe");
    await addMember(org.id, instructor.id, "INSTRUCTOR");
    const course = await createCourse({ organizationId: org.id, instructorId: instructor.id, lessons: 2, ...opts });
    const student = await createUser("Ana Pérez");
    const studentCtx = await ctxFor(student.id);
    const { enrollmentId } = await requestEnrollment(studentCtx, { courseId: course.id });
    const staff = await ctxFor(instructor.id, org.id);
    await confirmEnrollmentPayment(staff, { enrollmentId });
    return { org, course, enrollmentId, staff, studentCtx: await ctxFor(student.id) };
  }

  it("AC-11: matrícula pendiente no ve lecciones", async () => {
    const org = await createOrg();
    const instructor = await createUser();
    await addMember(org.id, instructor.id, "INSTRUCTOR");
    const course = await createCourse({ organizationId: org.id, instructorId: instructor.id });
    const student = await createUser();
    await requestEnrollment(await ctxFor(student.id), { courseId: course.id });
    const data = await getClassroomData(await ctxFor(student.id), course.slug);
    expect(data?.accessStatus).toBe("PENDING_PAYMENT");
    expect(data?.modules).toHaveLength(0);
  });

  it("AC-13/14: completar todas las lecciones (sin evaluaciones) completa el curso en la misma transacción", async () => {
    const { course, enrollmentId, studentCtx } = await activeEnrollment();
    const [l1, l2] = course.modules[0].lessons;

    const first = await toggleLessonProgress(studentCtx, { courseSlug: course.slug, lessonId: l1.id, completed: true });
    expect(first).toMatchObject({ completedCount: 1, totalCount: 2, progressPercent: 50, courseJustCompleted: false });

    const second = await toggleLessonProgress(studentCtx, { courseSlug: course.slug, lessonId: l2.id, completed: true });
    expect(second).toMatchObject({ progressPercent: 100, courseJustCompleted: true, enrollmentStatus: "COMPLETED" });
    expect(await db.auditLog.count({ where: { action: "COMPLETE_COURSE", targetId: enrollmentId } })).toBe(1);
  });

  it("con evaluación: el curso se completa al aprobar la nota", async () => {
    const { course, enrollmentId, staff, studentCtx } = await activeEnrollment({ withAssessment: true });
    for (const l of course.modules[0].lessons) {
      await toggleLessonProgress(studentCtx, { courseSlug: course.slug, lessonId: l.id, completed: true });
    }
    expect((await db.enrollment.findUniqueOrThrow({ where: { id: enrollmentId } })).status).toBe("ACTIVE");

    const { submissionId } = await submitAssignment(studentCtx, {
      enrollmentId,
      assessmentId: course.assessments[0].id,
      contentUrlOrText: "https://drive.example/informe",
    });
    // Reentrega: sigue habiendo una sola fila
    await submitAssignment(studentCtx, { enrollmentId, assessmentId: course.assessments[0].id, contentUrlOrText: "versión 2 del informe" });
    expect(await db.submission.count()).toBe(1);

    const failed = await gradeAssignment(staff, { submissionId, score: 10 });
    expect(failed).toMatchObject({ status: "REJECTED", courseJustCompleted: false });
    const passed = await gradeAssignment(staff, { submissionId, score: 17, feedback: "Bien" });
    expect(passed).toMatchObject({ status: "APPROVED", courseJustCompleted: true });
  });

  it("emisión: requiere COMPLETED, es idempotente bajo concurrencia, genera snapshot y evento", async () => {
    const { course, enrollmentId, staff, studentCtx } = await activeEnrollment();
    await expect(issueCertificate(staff, enrollmentId)).rejects.toThrow(/100%/);

    for (const l of course.modules[0].lessons) {
      await toggleLessonProgress(studentCtx, { courseSlug: course.slug, lessonId: l.id, completed: true });
    }

    const results = await Promise.all(Array.from({ length: 4 }, () => issueCertificate(staff, enrollmentId)));
    expect(new Set(results.map((r) => r.code)).size).toBe(1);
    expect(results.filter((r) => !r.isAlreadyIssued)).toHaveLength(1);
    expect(await db.certificate.count()).toBe(1);
    expect(await db.auditLog.count({ where: { action: "ISSUE_CERTIFICATE" } })).toBe(1);
    expect(await db.outboxEvent.count({ where: { type: "certificate.issued" } })).toBe(1);

    const cert = await db.certificate.findFirstOrThrow();
    expect(cert).toMatchObject({ holderName: "Ana Pérez", courseTitle: course.title, hours: course.hours });
    expect(cert.code).toMatch(/^CFX-(?:[0-9A-Z]{4}-){3}[0-9A-Z]{4}$/);
  });

  it("verificación pública: solo datos reales y documento enmascarado; revocación idempotente", async () => {
    const { course, enrollmentId, staff, studentCtx } = await activeEnrollment();
    for (const l of course.modules[0].lessons) {
      await toggleLessonProgress(studentCtx, { courseSlug: course.slug, lessonId: l.id, completed: true });
    }
    const { code } = await issueCertificate(staff, enrollmentId);

    const pub = await getPublicCertificate(code.toLowerCase());
    expect(pub?.status).toBe("valido");
    expect(pub?.student.documentMasked).toBe("•••• 9203");
    expect(JSON.stringify(pub)).not.toContain("72499203");
    expect(pub?.evaluation.finalGrade).toBeNull(); // sin evaluaciones → sin nota inventada
    expect(pub?.competencies).toEqual([]);

    await revokeCertificate(staff, { code, reason: "Fraude documentario detectado" });
    await revokeCertificate(staff, { code, reason: "Segundo intento de revocación" });
    expect(await db.auditLog.count({ where: { action: "REVOKE_CERTIFICATE" } })).toBe(1);
    expect((await getPublicCertificate(code))?.status).toBe("revocado");
    expect(await getPublicCertificate("CFX-NOPE-NOPE-NOPE-NOPE")).toBeNull();
  });
});
