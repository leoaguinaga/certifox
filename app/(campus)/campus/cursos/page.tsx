import { getSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { getStudentEnrolledCourses } from "@/server/services/student.service";
import { ActiveCoursesGrid } from "@/features/learning/components/active-courses-grid";
import { CompletedCoursesSection } from "@/features/learning/components/completed-courses-section";
import { StudentSupportSection } from "@/features/learning/components/student-support-section";
import { InstructorCoursesView, InstructorCourseItem } from "@/features/courses-management/components/instructor-courses-view";
import { prisma } from "@/server/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CampusCursosPage() {
  const session = await getSession();

  if (!session) {
    redirect("/ingresar?from=/campus/cursos");
  }

  const role = session.user.role;

  // 1. Vista de Estudiante (AC-13: progreso real calculado desde PostgreSQL)
  if (role === "STUDENT") {
    const enrolledCourses = await getStudentEnrolledCourses(session);
    const activeCourses = enrolledCourses.filter((c) => c.status !== "completed");
    const completedCourses = enrolledCourses.filter((c) => c.status === "completed");

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
            Mis Cursos & Rutas Formativas
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Gestiona tu avance curricular, lecciones interactivas y programas finalizados.
          </p>
        </div>

        {activeCourses.length === 0 && completedCourses.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-4">
            <div className="size-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#FD761A] flex items-center justify-center mx-auto">
              <BookOpen className="size-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Aún no tienes cursos inscritos
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                Explora nuestro catálogo de programas técnicos y solicita tu matrícula.
              </p>
            </div>
            <Link
              href="/cursos"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] text-white text-xs font-bold transition-colors shadow-sm"
            >
              <span>Explorar catálogo de certificaciones</span>
            </Link>
          </div>
        ) : (
          <>
            <ActiveCoursesGrid courses={activeCourses} />
            <CompletedCoursesSection courses={completedCourses} />
          </>
        )}

        <StudentSupportSection />
      </div>
    );
  }

  // 2. Vista de Docente / Instructor (AC-18: Gestión completa y publicación)
  const instructorCourses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
      enrollments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedCourses: InstructorCourseItem[] = instructorCourses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    category: c.category,
    level: c.level,
    hours: c.hours,
    summary: c.summary,
    coverUrl: c.coverUrl,
    published: c.published,
    modules: c.modules.map((m) => ({
      id: m.id,
      title: m.title,
      order: m.order,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order,
        durationMin: l.durationMin,
        videoUrl: l.videoUrl,
      })),
    })),
    activeStudentsCount: c.enrollments.filter(
      (e) => e.status === "ACTIVE" || e.status === "COMPLETED"
    ).length,
  }));

  return <InstructorCoursesView initialCourses={formattedCourses} />;
}
