"use client";

import { useCampusRole } from "@/features/campus/context/campus-role-context";
import { StudentDashboardView } from "@/features/campus/components/student-dashboard-view";
import { TeacherDashboardView } from "@/features/campus/components/teacher-dashboard-view";

export default function CampusPage() {
  const { role } = useCampusRole();

  return (
    <>
      {role === "student" ? (
        <StudentDashboardView />
      ) : (
        <TeacherDashboardView />
      )}
    </>
  );
}
