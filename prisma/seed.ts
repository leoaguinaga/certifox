import { PrismaClient, Role, EnrollmentStatus, CertificateStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Limpiar datos previos si existen (en orden inverso de dependencias)
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
  await prisma.user.deleteMany();

  // 1. Usuarios demo
  const instructor = await prisma.user.create({
    data: {
      name: "Ing. Marco Viteri Valdivia",
      email: "profe@certifox.pe",
      role: Role.INSTRUCTOR,
      institution: "Centro Técnico MaqOps & FoxCode Industrial",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBp8fbSmmUjxZ-hl58gG_g56pRgHYV1jWDgwvgcHEsxrQSOo9iGqLnJ86bRsnf-EvcC_-HvC-3-fXwtbDQ27r2uXqnJ8iU0ERaXL1umXXw0ZCI49QQeKy7F9r7Ai8B2xmjccScuea7DHslp2p8VqJQ9FsqhozIKpckAiLdYc6DNuUDRUIN2JYcZeHiUvtqsrRjpV2KDrTRqQQT8yTTilFItFlCsffouF0ffAt9oKeczc369aB4B9m-_",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Alejandro Morales Peñaloza",
      email: "alumno@certifox.pe",
      role: Role.STUDENT,
      documentType: "DNI",
      documentNumber: "72499203",
      institution: "Minera Las Bambas",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Lucía Fernández Torres",
      email: "lucia@certifox.pe",
      role: Role.STUDENT,
      documentType: "DNI",
      documentNumber: "45891204",
      institution: "Sociedad Minera Cerro Verde",
    },
  });

  console.log("✅ Usuarios creados: 1 Instructor, 2 Estudiantes");

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
      coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBATXmZ_lcK_1sJzzOeIvRjWlAYN9zXPN_FKWSlt9C2eH_Ne4dVjlIHETJ3yZI3rg3HKYtD_r9e2crodOweebnB3EFP9bEZ1T07FzI-hEqYhjLz8IqLIf3Lc0OUEZhiWb1Tfh9UQjSu6AWajdpgcDJC5pumGMceZVwpiwlr8VkAWyRke_iuhxCDC1_R-hQ2j45lTJKy8CyRLAvoX_6ZdEH4MGi5ThcFuZ6BOxKtjaX47jYXRy5aXANf",
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
                  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                },
                {
                  title: "Inspección Pre-Uso y Checklist Crítico",
                  order: 2,
                  durationMin: 35,
                  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
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
                  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                },
                {
                  title: "Procedimientos de Emergencia y Volcamiento",
                  order: 2,
                  durationMin: 30,
                  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
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
      coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUYnN5Uq14HwaXIqv4bej8-sdax2ycFEiz-SJcAM14AZAzOLlGc_vcyxgI4VSYCiM6Z5Gmw1oDSP1EG9k1oON8TdAHGzt_vUx0Bc2Uu-g0Eo2Oy8lygp1B6KOVM2KUcC9aAQLHNO1s2CVg1aH9V2elm0aTFf_aBB7Qm55mLsNd4i9jFo-1Sm6pSpAU4lK0CGRDXHj0SFuvQTozJf5-ypYcThSRv0om2oPZNZm97v6Lu90yEhSNRljR",
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
                  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✅ Cursos demo creados con módulos y lecciones");

  // 3. Matrículas y Certificados en cada estado
  // 3a. Matrícula 1: COMPLETADA con Certificado VÁLIDO
  const enrollment1 = await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      status: EnrollmentStatus.COMPLETED,
      activatedAt: new Date("2024-09-01T10:00:00Z"),
      completedAt: new Date("2024-10-14T18:00:00Z"),
      certificate: {
        create: {
          code: "CFX-2025-9831",
          sha256: "8a9fe409b3628e811c0f0f49c01742de8b7c4270f92275ba2c4b8e2cb927c24e",
          status: CertificateStatus.VALID,
          issuedAt: new Date("2024-10-14T18:42:00Z"),
          expiresAt: new Date("2026-10-14T18:42:00Z"), // Vigente
        },
      },
    },
  });

  // 3b. Matrícula 2: COMPLETADA con Certificado VENCIDO / EXPIRED
  await prisma.enrollment.create({
    data: {
      userId: student2.id,
      courseId: course1.id,
      status: EnrollmentStatus.COMPLETED,
      activatedAt: new Date("2023-01-01T10:00:00Z"),
      completedAt: new Date("2023-01-10T12:00:00Z"),
      certificate: {
        create: {
          code: "CFX-2024-4412",
          sha256: "3f82d1c990b764a2e5840d210fa094d1b827e1f409581a0b368412e09841f391",
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
      status: EnrollmentStatus.COMPLETED,
      activatedAt: new Date("2022-10-01T10:00:00Z"),
      completedAt: new Date("2022-11-12T14:00:00Z"),
      certificate: {
        create: {
          code: "CFX-2023-1102",
          sha256: "e7c2a5d99214b60f1b218412e873400192a71f021e8432a901f4c718b209e992",
          status: CertificateStatus.REVOKED,
          issuedAt: new Date("2022-11-12T14:20:00Z"),
          revokedAt: new Date("2025-01-31T09:00:00Z"),
          revocationReason: "Recertificación Anual Vencida y falta de actualización bianual en Norma Técnica G-050",
        },
      },
    },
  });

  // 4. Registro de Auditoría
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: instructor.id,
        action: "CONFIRM_PAYMENT",
        targetType: "Enrollment",
        targetId: enrollment1.id,
        metadata: { method: "Yape", studentEmail: student.email },
      },
      {
        actorId: instructor.id,
        action: "ISSUE_CERTIFICATE",
        targetType: "Certificate",
        targetId: "CFX-2025-9831",
        metadata: { code: "CFX-2025-9831" },
      },
      {
        actorId: instructor.id,
        action: "REVOKE_CERTIFICATE",
        targetType: "Certificate",
        targetId: "CFX-2023-1102",
        metadata: { reason: "Recertificación Anual Vencida", resolution: "REV-MAQOPS-2025-09" },
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
