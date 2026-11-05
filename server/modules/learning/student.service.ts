import "server-only";
import { db } from "@/server/core/db";
import type { AuthedContext } from "@/server/core/request-context";
import { fileUrl } from "@/server/modules/files/files.service";
import type { CourseEnrollmentStatus, EnrolledCourse, StudentProfile } from "@/features/learning/types";
import { maskDocumentNumber } from "@/lib/masking";
import { progressPercent } from "./progress";

const MAX_ENROLLMENTS = 100;

/**
 * Cursos del estudiante en todas sus organizaciones. El porcentaje usa el mismo cálculo
 * que el aula (AC-13). Lecturas con `select` mínimo.
 */
function queryMyEnrollments(userId: string) {
  return db.enrollment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: MAX_ENROLLMENTS,
    select: {
      id: true,
      status: true,
      completedAt: true,
      progress: { select: { lessonId: true } },
      certificate: { select: { code: true } },
      course: {
        select: {
          slug: true,
          title: true,
          category: true,
          hours: true,
          organization: { select: { name: true } },
          coverFile: { select: { key: true, visibility: true } },
          instructor: { select: { name: true, institution: true } },
          modules: {
            orderBy: { order: "asc" },
            select: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true } } },
          },
        },
      },
    },
  });
}

type EnrollmentRows = Awaited<ReturnType<typeof queryMyEnrollments>>;

export async function getMyEnrolledCourses(ctx: AuthedContext): Promise<EnrolledCourse[]> {
  return mapEnrolled(await queryMyEnrollments(ctx.user.id));
}

function mapEnrolled(enrollments: EnrollmentRows): EnrolledCourse[] {
  let priorityAssigned = false;
  return enrollments.map((enr) => {
    const course = enr.course;
    const lessons = course.modules.flatMap((m) => m.lessons);
    const done = new Set(enr.progress.map((p) => p.lessonId));
    const lessonsCompleted = lessons.filter((l) => done.has(l.id)).length;
    const pct = progressPercent(lessonsCompleted, lessons.length);
    const nextLesson = lessons.find((l) => !done.has(l.id)) ?? lessons[0];

    let status: CourseEnrollmentStatus = "in_progress";
    let statusLabel = `En curso • ${pct}%`;
    if (enr.status === "PENDING") {
      status = "pending_confirmation";
      statusLabel = "Pendiente de confirmación";
    } else if (enr.status === "COMPLETED") {
      status = "completed";
      statusLabel = "Completado • 100%";
    }
    const isPriority = !priorityAssigned && status === "in_progress";
    if (isPriority) priorityAssigned = true;

    return {
      id: enr.id,
      code: `CUR-${course.slug.slice(0, 4).toUpperCase()}`,
      slug: course.slug,
      title: course.title,
      category: course.category,
      categoryLabel: course.category,
      instructorName: course.instructor.name,
      school: course.instructor.institution ?? course.organization.name,
      image: fileUrl(course.coverFile) ?? "/images/courses/course-default.svg",
      status,
      statusLabel,
      progressPercentage: pct,
      lessonsCompleted,
      totalLessons: lessons.length,
      nextLessonTitle: nextLesson?.title,
      isPriority,
      completedDate: enr.completedAt ? enr.completedAt.toLocaleDateString("es-PE") : undefined,
      certificateCode: enr.certificate?.code,
      pendingNotice:
        enr.status === "PENDING" ? "La institución habilitará tus lecciones cuando confirme tu abono." : undefined,
    };
  });
}

export async function getStudentDashboard(ctx: AuthedContext): Promise<{ profile: StudentProfile; enrolledCourses: EnrolledCourse[] }> {
  const [user, rows, certificates] = await Promise.all([
    db.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        documentType: true,
        documentNumber: true,
        institution: true,
        avatarFile: { select: { key: true, visibility: true } },
      },
    }),
    queryMyEnrollments(ctx.user.id),
    db.certificate.count({ where: { enrollment: { userId: ctx.user.id }, status: { not: "REVOKED" } } }),
  ]);

  const enrolledCourses = mapEnrolled(rows);
  // Horas acumuladas = horas del curso × avance real.
  const accumulatedHours = rows.reduce(
    (acc, row, idx) => acc + (enrolledCourses[idx].progressPercentage / 100) * row.course.hours,
    0
  );

  const activeCount = enrolledCourses.filter((c) => c.status === "in_progress").length;

  const profile: StudentProfile = {
    id: `CFX-${(user?.id ?? ctx.user.id).slice(-5).toUpperCase()}`,
    name: user?.name ?? ctx.user.name,
    email: user?.email ?? ctx.user.email,
    avatar: fileUrl(user?.avatarFile) ?? user?.image ?? "/images/avatars/student.svg",
    role: "Estudiante",
    statusLabel: activeCount > 0 ? "Estudiante activo" : "Estudiante",
    documentType: user?.documentType ?? "DNI",
    documentNumberMasked: user?.documentNumber ? maskDocumentNumber(user.documentNumber) : "Sin registrar",
    company: user?.institution ?? undefined,
    streakDays: 0,
    totalHours: Math.round(accumulatedHours * 10) / 10,
    totalCertificates: certificates,
  };

  return { profile, enrolledCourses };
}
