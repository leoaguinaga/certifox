import { getSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { getStudentProfileData } from "@/server/services/student.service";
import { StudentDashboardView } from "@/features/campus/components/student-dashboard-view";
import { TeacherDashboardView } from "@/features/campus/components/teacher-dashboard-view";

export const dynamic = "force-dynamic";

export default async function CampusPage() {
  const session = await getSession();

  if (!session) {
    redirect("/ingresar?from=/campus");
  }

  if (session.user.role === "STUDENT") {
    const { profile, enrolledCourses } = await getStudentProfileData(session);
    return (
      <StudentDashboardView
        initialProfile={profile}
        initialCourses={enrolledCourses}
      />
    );
  }

  return <TeacherDashboardView />;
}
