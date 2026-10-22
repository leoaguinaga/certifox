import "server-only";

import { prisma } from "@/server/db";
import { SessionContext, requireAuth } from "@/server/policies";
import { EnrolledCourse, CourseEnrollmentStatus, StudentProfile } from "@/features/learning/types";
import { maskDocumentNumber } from "@/server/services/certificate.service";

/**
 * Consulta de cursos matriculados del estudiante autenticado desde PostgreSQL (Neon).
 * Garantiza AC-13: el porcentaje de progreso coincide exactamente entre el aula,
 * el dashboard (/campus) y la vista de cursos (/campus/cursos).
 */
export async function getStudentEnrolledCourses(
  session: SessionContext | null | undefined
): Promise<EnrolledCourse[]> {
  const user = requireAuth(session);

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          instructor: {
            select: { name: true, institution: true },
          },
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
      progress: true,
      certificate: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((enr, idx) => {
    const course = enr.course;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const totalLessons = allLessons.length;
    const completedLessonIdSet = new Set(enr.progress.map((p) => p.lessonId));
    const lessonsCompleted = allLessons.filter((l) => completedLessonIdSet.has(l.id)).length;
    const progressPercentage =
      totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

    // Próxima lección no completada
    const nextLesson = allLessons.find((l) => !completedLessonIdSet.has(l.id)) || allLessons[0];

    // Mapeo de estado
    let status: CourseEnrollmentStatus = "in_progress";
    let statusLabel = `En curso • ${progressPercentage}%`;

    if (enr.status === "PENDING") {
      status = "pending_confirmation";
      statusLabel = "Pendiente de confirmación";
    } else if (enr.status === "COMPLETED") {
      status = "completed";
      statusLabel = "Completado • 100%";
    }

    return {
      id: enr.id,
      code: `CUR-${course.slug.slice(0, 4).toUpperCase()}`,
      slug: course.slug,
      title: course.title,
      category: course.category,
      categoryLabel: course.category,
      instructorName: course.instructor.name,
      school: course.instructor.institution || "Centro de Formación Técnica",
      image:
        course.coverUrl ||
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
      status,
      statusLabel,
      progressPercentage,
      lessonsCompleted,
      totalLessons,
      nextLessonTitle: nextLesson ? nextLesson.title : undefined,
      lastAccess: "Reciente",
      isPriority: idx === 0 && status === "in_progress",
      completedDate: enr.completedAt ? new Date(enr.completedAt).toLocaleDateString("es-PE") : undefined,
      certificateCode: enr.certificate?.code,
      pendingNotice:
        enr.status === "PENDING"
          ? "El docente habilitará tus lecciones tras validar tu comprobante de pago."
          : undefined,
    };
  });
}

/**
 * Consulta de perfil del estudiante y métricas para el Dashboard /campus.
 */
export async function getStudentProfileData(
  session: SessionContext | null | undefined
): Promise<{
  profile: StudentProfile;
  enrolledCourses: EnrolledCourse[];
}> {
  const user = requireAuth(session);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      documentType: true,
      documentNumber: true,
      institution: true,
      createdAt: true,
    },
  });

  const enrolledCourses = await getStudentEnrolledCourses(session);
  const completedCount = enrolledCourses.filter((c) => c.status === "completed").length;
  const activeCount = enrolledCourses.filter((c) => c.status === "in_progress").length;

  // Cálculo de horas acumuladas (proporcionales al avance)
  const totalHours = enrolledCourses.reduce((acc, c) => {
    return acc + (c.progressPercentage / 100) * 16;
  }, 0);

  const maskedDoc = dbUser?.documentNumber
    ? maskDocumentNumber(dbUser.documentNumber)
    : "Sin registrar";

  const profile: StudentProfile = {
    id: `CFX-${(dbUser?.id || "USER").slice(-5).toUpperCase()}`,
    name: dbUser?.name || "Estudiante",
    email: dbUser?.email || user.email,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCr8Cs2V0mR2YyfQX3GFFe_I__XuoKazEOOB0dDj_GHmnarRiLXTM2dMSbcUlIRx18SHRYY8vmb8Rlh28NuFzlbwLBsJv-nSiNGSpJqHF-hKP8U2PEjbgP_PcXLY1iT8vHgrLttggjWYyol9yCopSi2Kjc5AYQDruFBp4bdxiJmyaoGr0e10Lr_IutdhhonCm-XO5ilVrwx0-2mCyvj6MCB4ouZYFripoUuKvi3VORbrhvrShG_vw2D",
    role: "Estudiante",
    statusLabel: activeCount > 0 ? "Estudiante Activo" : "Estudiante",
    documentType: dbUser?.documentType || "DNI",
    documentNumberMasked: maskedDoc,
    company: dbUser?.institution || undefined,
    streakDays: 3,
    totalHours: Math.round(totalHours * 10) / 10,
    totalCertificates: completedCount,
  };

  return { profile, enrolledCourses };
}
