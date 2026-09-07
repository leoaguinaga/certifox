import { Metadata } from "next";
import {
  getStudentProfile,
  getActiveCourses,
  getPriorityCourse,
  getCompletedCourses,
} from "@/data/student";
import { StudentMetricsHeader } from "@/features/learning/components/student-metrics-header";
import { StudentHeroPriorityCard } from "@/features/learning/components/student-hero-priority-card";
import { ActiveCoursesGrid } from "@/features/learning/components/active-courses-grid";
import { CompletedCoursesSection } from "@/features/learning/components/completed-courses-section";
import { StudentSupportSection } from "@/features/learning/components/student-support-section";

export const metadata: Metadata = {
  title: "Mi Aprendizaje | Aula Virtual Certifox",
  description:
    "Gestiona tus programas técnicos, avance curricular y certificaciones oficiales emitidas en tiempo real.",
};

export default function MiAprendizajePage() {
  const student = getStudentProfile();
  const activeCourses = getActiveCourses();
  const priorityCourse = getPriorityCourse();
  const completedCourses = getCompletedCourses();

  return (
    <>
      {/* Saludo Personalizado y Métricas Globales */}
      <StudentMetricsHeader student={student} />

      {/* Tarjeta Hero / Destacada: 'Continuar aprendiendo' */}
      {priorityCourse && <StudentHeroPriorityCard course={priorityCourse} />}

      {/* Sección: Mis Cursos Activos (Grid) */}
      <ActiveCoursesGrid courses={activeCourses} />

      {/* Sección: Cursos Finalizados */}
      <CompletedCoursesSection courses={completedCourses} />

      {/* Sección de Soporte y Preguntas Frecuentes */}
      <StudentSupportSection />
    </>
  );
}
