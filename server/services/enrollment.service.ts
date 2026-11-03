import "server-only";
import { db } from "@/server/db";
import { assertCanManageCourse, SessionContext } from "@/server/policies";
import { env } from "@/lib/env";

export interface RequestEnrollmentParams {
  courseId: string;
  studentEmail: string;
  studentName: string;
  studentPhone?: string;
  currentUserId?: string;
}

export interface PaymentInstructions {
  yapeNumber: string;
  yapeName: string;
  bcpAccount: string;
  bcpCci: string;
  whatsappUrl: string;
  amountUsd: number;
  amountPen: number;
}

/**
 * Genera el paquete de instrucciones de abono manual (RF-20 / AC-11).
 * Sin subir comprobantes: el estudiante paga por Yape/Plin/Banco y avisa por WhatsApp.
 */
export function getPaymentInstructions(courseTitle: string, studentName: string): PaymentInstructions {
  const phone = env.NEXT_PUBLIC_PAYMENT_WHATSAPP;
  const message = encodeURIComponent(
    `Hola, soy ${studentName}. Acabo de solicitar mi matrícula para el curso "${courseTitle}" en Certifox y deseo coordinar el abono.`
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

  return {
    yapeNumber: "999-999-999",
    yapeName: "Certifox Pagos / FoxCode",
    bcpAccount: "193-98402194-0-12",
    bcpCci: "002-193-0098402194012-14",
    whatsappUrl,
    amountUsd: 180,
    amountPen: 680,
  };
}

/**
 * Solicita una matrícula dejando su estado en PENDING de forma idempotente (RF-05 / RNF-12 / AC-11).
 */
export async function requestEnrollment(params: RequestEnrollmentParams) {
  const { courseId, studentEmail, studentName, currentUserId } = params;
  const cleanEmail = studentEmail.toLowerCase().trim();

  // 1. Verificar existencia del curso
  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error("El curso solicitado no existe");
  }

  // 2. Obtener o crear usuario estudiante
  let userId = currentUserId;

  if (!userId) {
    const existingUser = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const newUser = await db.user.create({
        data: {
          email: cleanEmail,
          name: studentName.trim(),
          role: "STUDENT",
        },
      });
      userId = newUser.id;
    }
  }

  // 3. Crear matrícula en PENDING (Idempotente vía upsert según RNF-12)
  const enrollment = await db.enrollment.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    create: {
      userId,
      courseId,
      status: "PENDING",
    },
    update: {
      // Si ya existía, no altera el status si ya está activa
    },
    include: {
      course: true,
      user: true,
    },
  });

  const instructions = getPaymentInstructions(course.title, enrollment.user.name);

  return {
    enrollmentId: enrollment.id,
    status: enrollment.status,
    courseTitle: course.title,
    instructions,
  };
}

/**
 * Confirma el pago de una matrícula pasando su estado a ACTIVE y registrando en AuditLog (RF-06 / R2 / AC-12).
 * Solo el docente propietario puede ejecutar esta confirmación.
 */
export async function confirmEnrollmentPayment(
  session: SessionContext,
  enrollmentId: string,
  note?: string
) {
  // 1. Obtener matrícula
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: true,
      user: true,
    },
  });

  if (!enrollment) {
    throw new Error("Matrícula no encontrada");
  }

  // 2. Regla R2 / AC-12: Autorizar por policy que el instructor autenticado sea dueño del curso
  assertCanManageCourse(session, enrollment.course.instructorId);

  // 3. Idempotencia: Si ya está ACTIVE o COMPLETED, simplemente retorna
  if (enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED") {
    return enrollment;
  }

  // 4. Actualizar a ACTIVE
  const updatedEnrollment = await db.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status: "ACTIVE",
      activatedAt: new Date(),
    },
  });

  // 5. Regla R6: Registrar en AuditLog
  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "CONFIRM_PAYMENT",
      targetType: "Enrollment",
      targetId: enrollment.id,
      metadata: {
        studentEmail: enrollment.user.email,
        studentName: enrollment.user.name,
        courseTitle: enrollment.course.title,
        confirmedBy: session.user.email,
        note: note || "Confirmación de abono manual (Yape / Transferencia)",
      },
    },
  });

  return updatedEnrollment;
}

/**
 * Obtiene la lista de matrículas de los cursos del instructor autenticado (RF-11).
 */
export async function getInstructorEnrollments(
  session: SessionContext,
  statusFilter?: "ALL" | "PENDING" | "ACTIVE" | "COMPLETED"
) {
  const instructorId = session.user.id;

  const whereClause: {
    course: { instructorId: string };
    status?: "PENDING" | "ACTIVE" | "COMPLETED";
  } = {
    course: {
      instructorId,
    },
  };

  if (statusFilter && statusFilter !== "ALL") {
    whereClause.status = statusFilter;
  }

  const enrollments = await db.enrollment.findMany({
    where: whereClause,
    include: {
      user: true,
      course: true,
      progress: true,
      certificate: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((enr) => ({
    id: enr.id,
    studentName: enr.user.name,
    studentEmail: enr.user.email,
    documentMasked: enr.user.documentNumber ? `•••• ${enr.user.documentNumber.slice(-4)}` : "No registrado",
    courseId: enr.courseId,
    courseTitle: enr.course.title,
    status: enr.status,
    createdAt: enr.createdAt.toISOString(),
    activatedAt: enr.activatedAt ? enr.activatedAt.toISOString() : null,
    completedAt: enr.completedAt ? enr.completedAt.toISOString() : null,
    hasCertificate: !!enr.certificate,
    certificateCode: enr.certificate?.code || null,
  }));
}
