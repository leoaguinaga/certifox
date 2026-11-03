import { getSession } from "@/server/auth";
import { forbidden } from "next/navigation";
import { getInstructorEnrollments } from "@/server/services/enrollment.service";
import { InstructorStudentsView } from "@/features/campus/components/instructor-students-view";

export const dynamic = "force-dynamic";

export default async function CampusEstudiantesPage() {
  const session = await getSession();

  // AC-09: Un estudiante recibe 403 en /campus/estudiantes
  if (!session || session.user.role !== "INSTRUCTOR") {
    forbidden();
  }

  // RF-11: Carga de matrículas reales de los cursos del instructor
  const enrollments = await getInstructorEnrollments(session);

  return (
    <InstructorStudentsView
      initialEnrollments={enrollments}
      instructorName={session.user.name || "Docente"}
    />
  );
}
