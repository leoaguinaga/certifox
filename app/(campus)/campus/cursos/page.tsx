"use client";

import { useCampusRole } from "@/features/campus/context/campus-role-context";
import { BookOpen } from "lucide-react";
import {
  getActiveCourses,
  getCompletedCourses,
} from "@/data/student";
import { ActiveCoursesGrid } from "@/features/learning/components/active-courses-grid";
import { CompletedCoursesSection } from "@/features/learning/components/completed-courses-section";
import { StudentSupportSection } from "@/features/learning/components/student-support-section";

export default function CampusCursosPage() {
  const { role } = useCampusRole();

  if (role === "student") {
    const activeCourses = getActiveCourses();
    const completedCourses = getCompletedCourses();

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

        <ActiveCoursesGrid courses={activeCourses} />

        <CompletedCoursesSection courses={completedCourses} />

        <StudentSupportSection />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
            Cursos Asignados
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Administración de temarios, módulos, lecciones y seguimiento de avance estudiantil.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-3">
        <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FD761A] flex items-center justify-center mx-auto">
          <BookOpen className="size-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900 dark:text-white">
          Gestión de Cursos Docentes
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
          Desde aquí podrás crear y editar tus cursos, módulos y lecciones de video.
        </p>
      </div>
    </div>
  );
}
