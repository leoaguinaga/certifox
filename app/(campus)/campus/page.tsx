import { campusContext } from "@/server/core/page-guards";
import { getStudentDashboard } from "@/server/modules/learning/student.service";
import { StudentDashboardView } from "@/features/campus/components/student-dashboard-view";
import { TeacherDashboardView } from "@/features/campus/components/teacher-dashboard-view";

export const dynamic = "force-dynamic";

export default async function CampusPage() {
  const ctx = await campusContext("/campus");

  if (ctx.view === "STUDENT") {
    const { profile, enrolledCourses } = await getStudentDashboard(ctx);
    return <StudentDashboardView initialProfile={profile} initialCourses={enrolledCourses} />;
  }

  return <TeacherDashboardView />;
}
