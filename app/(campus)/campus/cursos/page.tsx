import { getSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { getStudentEnrolledCourses } from "@/server/services/student.service";
import { ActiveCoursesGrid } from "@/features/learning/components/active-courses-grid";
import { CompletedCoursesSection } from "@/features/learning/components/completed-courses-section";
import { StudentSupportSection } from "@/features/learning/components/student-support-section";
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

  // 2. Vista de Docente / Instructor
  const instructorCourses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    include: {
      modules: { include: { lessons: true } },
      enrollments: true,
      assessments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
            Cursos Asignados al Docente
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Administración de temarios, módulos, lecciones y seguimiento de avance de tus cohortes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {instructorCourses.map((course) => {
          const totalLessons = course.modules.flatMap((m) => m.lessons).length;
          const activeStudents = course.enrollments.filter(
            (e) => e.status === "ACTIVE" || e.status === "COMPLETED"
          ).length;

          return (
            <article
              key={course.id}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#FD761A] bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded">
                    {course.category}
                  </span>
                  <span className="text-xs font-medium text-stone-500">
                    Nivel: {course.level}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                  {course.title}
                </h3>

                <p className="text-xs text-stone-500 line-clamp-2">
                  {course.summary || "Programa de certificación técnica especializada."}
                </p>

                <div className="flex items-center gap-4 text-xs text-stone-600 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span>
                    <strong>{course.modules.length}</strong> módulos
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{totalLessons}</strong> lecciones
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{activeStudents}</strong> alumnos
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <Link
                  href={`/campus/cursos/${course.slug}`}
                  className="text-xs font-bold text-[#FD761A] hover:underline"
                >
                  Vista previa de lecciones →
                </Link>
                <Link
                  href="/campus/estudiantes"
                  className="text-xs font-bold text-stone-600 hover:text-stone-900 dark:text-stone-300"
                >
                  Ver alumnos
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
