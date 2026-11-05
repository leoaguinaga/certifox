import { createHash } from "node:crypto";
import { PrismaClient, EnrollmentStatus, CertificateStatus } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "1") {
    throw new Error("El seed borra datos: no se ejecuta en producción (usa ALLOW_PRODUCTION_SEED=1 si es intencional)");
  }

  // Limpiar datos previos si existen (en orden inverso de dependencias)
  await prisma.outboxEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.file.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // 0. Organización demo (tenant) con datos de cobro manual
  const org = await prisma.organization.create({
    data: {
      id: "org_default",
      slug: "certifox",
      name: "Centro Técnico MaqOps & FoxCode",
      legalName: "FoxCode Capacitación Técnica S.A.C.",
      taxId: "20600000001",
      paymentSettings: {
        whatsapp: "51999999999",
        yape: { number: "999 999 999", holder: "FoxCode Capacitación" },
        bankAccounts: [
          { bank: "BCP Soles", accountNumber: "193-0000000-0-00", cci: "002-193-000000000000-00", holder: "FoxCode Capacitación Técnica S.A.C." },
        ],
        instructions: "Envía la constancia por WhatsApp indicando tu nombre y el curso.",
      },
    },
  });

  // 1. Usuarios demo
  const instructor = await prisma.user.create({
    data: {
      name: "Ing. Marco Viteri Valdivia",
      email: "profe@certifox.pe",
      institution: "Centro Técnico MaqOps & FoxCode Industrial",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Alejandro Morales Peñaloza",
      email: "alumno@certifox.pe",
      documentType: "DNI",
      documentNumber: "72499203",
      institution: "Minera Las Bambas",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Lucía Fernández Torres",
      email: "lucia@certifox.pe",
      documentType: "DNI",
      documentNumber: "45891204",
      institution: "Sociedad Minera Cerro Verde",
    },
  });

  await prisma.membership.createMany({
    data: [
      { organizationId: org.id, userId: instructor.id, role: "OWNER" },
      { organizationId: org.id, userId: student.id, role: "STUDENT" },
      { organizationId: org.id, userId: student2.id, role: "STUDENT" },
    ],
  });

  console.log("✅ Usuarios creados: 1 OWNER/instructor, 2 Estudiantes");

  // Configurar credenciales Better Auth (Password123!)
  const demoHashedPassword = await hashPassword("Password123!");
  for (const u of [instructor, student, student2]) {
    await prisma.account.create({
      data: {
        userId: u.id,
        accountId: u.id,
        providerId: "credential",
        password: demoHashedPassword,
      },
    });
  }

  // 2. Cursos demo
  const course1 = await prisma.course.create({
    data: {
      slug: "seguridad-operativa-maquinaria-pesada",
      title: "Seguridad Operativa en Maquinaria Pesada",
      summary: "Protocolos integrales de mitigación de fatalidades, inspección pre-operativa de equipos de línea amarilla y maniobras certificadas.",
      category: "Maquinaria",
      level: "Intermedio",
      hours: 48,
      published: true,
      instructorId: instructor.id,
      organizationId: org.id,
      priceCents: 68000,
      currency: "PEN",
      modules: {
        create: [
          {
            title: "Módulo 1: Fundamentos y Marco Legal",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Normativa OSHA e ISO 45001 en Operaciones",
                  order: 1,
                  durationMin: 25,
                },
                {
                  title: "Inspección Pre-Uso y Checklist Crítico",
                  order: 2,
                  durationMin: 35,
                },
              ],
            },
          },
          {
            title: "Módulo 2: Maniobras y Zonas Ciegas",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Cálculo de Radio de Giro y Puntos Ciegos",
                  order: 1,
                  durationMin: 40,
                },
                {
                  title: "Procedimientos de Emergencia y Volcamiento",
                  order: 2,
                  durationMin: 30,
                },
              ],
            },
          },
        ],
      },
      assessments: {
        create: {
          title: "Evaluación Práctica: Checklist de Inspección 360°",
          description: "Sube un enlace a tu informe técnico o escribe tu análisis de campo pre-operacional.",
          passingScore: 14,
        },
      },
    },
    include: {
      modules: { include: { lessons: true } },
      assessments: true,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      slug: "supervisor-seguridad-minera-g050",
      title: "Supervisor de Seguridad en Minería y Construcción G-050",
      summary: "Gestión de permisos de trabajo de alto riesgo (PETAR), IPERC continuo y liderazgo en seguridad ocupacional.",
      category: "Seguridad Industrial",
      level: "Avanzado",
      hours: 60,
      published: true,
      instructorId: instructor.id,
      organizationId: org.id,
      priceCents: 85000,
      currency: "PEN",
      modules: {
        create: [
          {
            title: "Módulo 1: Gestión de Riesgos Críticos",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Elaboración de Matriz IPERC de Alto Impacto",
                  order: 1,
                  durationMin: 45,
                },
              ],
            },
          },
        ],
      },
    },
  });

  for (const c of [course1, course2]) {
    const agg = await prisma.lesson.aggregate({
      where: { module: { courseId: c.id } },
      _count: { _all: true },
      _sum: { durationMin: true },
    });
    await prisma.course.update({
      where: { id: c.id },
      data: { lessonsCount: agg._count._all, totalDurationMin: agg._sum.durationMin ?? 0 },
    });
  }

  console.log("✅ Cursos demo creados con módulos y lecciones");

  const snapshot = (holderName: string, course: { title: string; hours: number }) => ({
    holderName,
    courseTitle: course.title,
    hours: course.hours,
    organizationId: org.id,
  });
  const fingerprint = (code: string) => createHash("sha256").update(`seed|${code}`).digest("hex");

  // 3. Matrículas y Certificados en cada estado
  // 3a. Matrícula 1: COMPLETADA con Certificado VÁLIDO
  const enrollment1 = await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      organizationId: org.id,
      priceCents: 68000,
      status: EnrollmentStatus.COMPLETED,
      activatedAt: new Date("2024-09-01T10:00:00Z"),
      completedAt: new Date("2024-10-14T18:00:00Z"),
      certificate: {
        create: {
          code: "CFX-2025-9831",
          sha256: fingerprint("CFX-2025-9831"),
          ...snapshot(student.name, course1),
          status: CertificateStatus.VALID,
          issuedAt: new Date("2026-10-14T18:42:00Z"),
          expiresAt: new Date("2028-10-14T18:42:00Z"), // Vigente por 2 años
        },
      },
    },
  });

  // 3b. Matrícula 2: COMPLETADA con Certificado VENCIDO / EXPIRED
  await prisma.enrollment.create({
    data: {
      userId: student2.id,
      courseId: course1.id,
      organizationId: org.id,
      priceCents: 68000,
      status: EnrollmentStatus.COMPLETED,
      activatedAt: new Date("2023-01-01T10:00:00Z"),
      completedAt: new Date("2023-01-10T12:00:00Z"),
      certificate: {
        create: {
          code: "CFX-2024-4412",
          sha256: fingerprint("CFX-2024-4412"),
          ...snapshot(student2.name, course1),
          status: CertificateStatus.EXPIRED,
          issuedAt: new Date("2023-01-10T11:15:00Z"),
          expiresAt: new Date("2024-01-10T11:15:00Z"), // Vencido
        },
      },
    },
  });

  // 3c. Matrícula 3: COMPLETADA con Certificado REVOCADO
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course2.id,
      organizationId: org.id,
      priceCents: 85000,
      status: EnrollmentStatus.COMPLETED,
      activatedAt: new Date("2022-10-01T10:00:00Z"),
      completedAt: new Date("2022-11-12T14:00:00Z"),
      certificate: {
        create: {
          code: "CFX-2023-1102",
          sha256: fingerprint("CFX-2023-1102"),
          ...snapshot(student.name, course2),
          status: CertificateStatus.REVOKED,
          issuedAt: new Date("2022-11-12T14:20:00Z"),
          revokedAt: new Date("2025-01-31T09:00:00Z"),
          revocationReason: "Recertificación Anual Vencida y falta de actualización bianual en Norma Técnica G-050",
        },
      },
    },
  });

  // 4. Registro de Auditoría (targetId = id interno)
  const certs = await prisma.certificate.findMany({ select: { id: true, code: true } });
  const certId = (code: string) => certs.find((c) => c.code === code)!.id;
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: instructor.id,
        organizationId: org.id,
        action: "CONFIRM_PAYMENT",
        targetType: "Enrollment",
        targetId: enrollment1.id,
        metadata: { method: "Yape" },
      },
      {
        actorId: instructor.id,
        organizationId: org.id,
        action: "ISSUE_CERTIFICATE",
        targetType: "Certificate",
        targetId: certId("CFX-2025-9831"),
        metadata: { code: "CFX-2025-9831" },
      },
      {
        actorId: instructor.id,
        organizationId: org.id,
        action: "REVOKE_CERTIFICATE",
        targetType: "Certificate",
        targetId: certId("CFX-2023-1102"),
        metadata: { reason: "Recertificación Anual Vencida" },
      },
    ],
  });

  console.log("✅ Matrículas, Certificados en cada estado y AuditLogs creados exitosamente.");
  console.log("✨ Seed completado con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

