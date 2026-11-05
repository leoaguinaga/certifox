import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/core/db";
import { confirmEnrollmentPayment, listManagedEnrollments, requestEnrollment } from "@/server/modules/enrollment/enrollment.service";
import { addMember, createCourse, createOrg, createUser, ctxFor, hasDb, resetDb } from "./helpers";

describe.skipIf(!hasDb)("matrícula y confirmación de pago (Postgres real)", () => {
  beforeEach(resetDb);

  async function setup() {
    const org = await createOrg();
    const instructor = await createUser("Profe");
    await addMember(org.id, instructor.id, "INSTRUCTOR");
    const course = await createCourse({ organizationId: org.id, instructorId: instructor.id });
    const student = await createUser("Alumno");
    return { org, instructor, course, student };
  }

  it("crea matrícula PENDING, membresía STUDENT, evento outbox e instrucciones de la organización", async () => {
    const { org, course, student } = await setup();
    const res = await requestEnrollment(await ctxFor(student.id), { courseId: course.id });

    expect(res.status).toBe("PENDING");
    expect(res.instructions?.amount).toBe(500);
    expect(res.instructions?.whatsappUrl).toContain("wa.me/51999999999");
    expect(await db.membership.findFirst({ where: { userId: student.id, organizationId: org.id } })).toMatchObject({ role: "STUDENT" });
    expect(await db.outboxEvent.count({ where: { type: "enrollment.requested" } })).toBe(1);
    const enr = await db.enrollment.findUniqueOrThrow({ where: { id: res.enrollmentId } });
    expect(enr).toMatchObject({ organizationId: org.id, priceCents: 50000 });
  });

  it("es idempotente y los cursos gratuitos se activan al instante", async () => {
    const { org, instructor, course, student } = await setup();
    const ctx = await ctxFor(student.id);
    const a = await requestEnrollment(ctx, { courseId: course.id });
    const b = await requestEnrollment(ctx, { courseId: course.id });
    expect(b.enrollmentId).toBe(a.enrollmentId);
    expect(await db.enrollment.count()).toBe(1);

    const free = await createCourse({ organizationId: org.id, instructorId: instructor.id, priceCents: 0 });
    expect((await requestEnrollment(ctx, { courseId: free.id })).status).toBe("ACTIVE");
  });

  it("confirmaciones concurrentes activan una sola vez y auditan una sola vez", async () => {
    const { org, instructor, course, student } = await setup();
    const { enrollmentId } = await requestEnrollment(await ctxFor(student.id), { courseId: course.id });
    const staff = await ctxFor(instructor.id, org.id);

    const results = await Promise.all(Array.from({ length: 5 }, () => confirmEnrollmentPayment(staff, { enrollmentId })));
    expect(results.filter((r) => r.changed)).toHaveLength(1);
    expect(results.every((r) => r.status === "ACTIVE")).toBe(true);
    expect(await db.auditLog.count({ where: { action: "CONFIRM_PAYMENT", targetId: enrollmentId } })).toBe(1);
    expect(await db.outboxEvent.count({ where: { type: "enrollment.activated" } })).toBe(1);
  });

  it("aislamiento entre organizaciones: el staff de otra organización no confirma ni lista", async () => {
    const { course, student } = await setup();
    const { enrollmentId } = await requestEnrollment(await ctxFor(student.id), { courseId: course.id });

    const otherOrg = await createOrg();
    const outsider = await createUser("Admin ajeno");
    await addMember(otherOrg.id, outsider.id, "OWNER");
    const outsiderCtx = await ctxFor(outsider.id, otherOrg.id);

    await expect(confirmEnrollmentPayment(outsiderCtx, { enrollmentId })).rejects.toThrow(/otra organización/);
    expect((await listManagedEnrollments(outsiderCtx)).items).toHaveLength(0);
  });

  it("un INSTRUCTOR no confirma cursos de otro instructor; un ADMIN de la misma organización sí", async () => {
    const { org, course, student } = await setup();
    const { enrollmentId } = await requestEnrollment(await ctxFor(student.id), { courseId: course.id });

    const otherInstructor = await createUser("Otro profe");
    await addMember(org.id, otherInstructor.id, "INSTRUCTOR");
    await expect(confirmEnrollmentPayment(await ctxFor(otherInstructor.id, org.id), { enrollmentId })).rejects.toThrow();

    const admin = await createUser("Admin");
    await addMember(org.id, admin.id, "ADMIN");
    expect((await confirmEnrollmentPayment(await ctxFor(admin.id, org.id), { enrollmentId })).status).toBe("ACTIVE");
  });
});
