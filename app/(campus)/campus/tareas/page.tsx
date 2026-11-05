import { campusContext, cursorParam } from "@/server/core/page-guards";
import { listMyAssignments, listSubmissionsToGrade } from "@/server/modules/assessment/assessment.service";
import { AssignmentsView } from "@/features/assignments/components/assignments-view";
import { LoadMoreLink } from "@/components/shared/load-more-link";

export const dynamic = "force-dynamic";

export default async function CampusTareasPage({ searchParams }: { searchParams: Promise<{ cursor?: string }> }) {
  const ctx = await campusContext("/campus/tareas");

  if (ctx.view === "STUDENT") {
    const studentAssignments = await listMyAssignments(ctx);
    return <AssignmentsView role="STUDENT" studentAssignments={studentAssignments} instructorSubmissions={[]} />;
  }

  const { cursor } = await searchParams;
  const page = await listSubmissionsToGrade(ctx, { cursor: cursorParam(cursor), limit: 50 });
  return (
    <>
      <AssignmentsView role="INSTRUCTOR" studentAssignments={[]} instructorSubmissions={page.items} />
      <LoadMoreLink basePath="/campus/tareas" nextCursor={page.nextCursor} />
    </>
  );
}
