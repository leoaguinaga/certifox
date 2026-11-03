import { getSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { getAssignmentsForUser } from "@/server/services/assignment.service";
import { AssignmentsView } from "@/features/assignments/components/assignments-view";

export const dynamic = "force-dynamic";

export default async function CampusTareasPage() {
  const session = await getSession();

  if (!session) {
    redirect("/ingresar?from=/campus/tareas");
  }

  const { role, studentAssignments, instructorSubmissions } =
    await getAssignmentsForUser(session);

  return (
    <AssignmentsView
      role={role}
      studentAssignments={studentAssignments}
      instructorSubmissions={instructorSubmissions}
    />
  );
}
