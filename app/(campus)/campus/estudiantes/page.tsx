import { cursorParam, staffContext } from "@/server/core/page-guards";
import { listManagedEnrollments } from "@/server/modules/enrollment/enrollment.service";
import { InstructorStudentsView } from "@/features/campus/components/instructor-students-view";
import { LoadMoreLink } from "@/components/shared/load-more-link";

export const dynamic = "force-dynamic";

export default async function CampusEstudiantesPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  // AC-09: solo personal de la organización (403 para estudiantes)
  const ctx = await staffContext("/campus/estudiantes");
  const { cursor } = await searchParams;
  const page = await listManagedEnrollments(ctx, { cursor: cursorParam(cursor), limit: 50 });

  return (
    <>
      <InstructorStudentsView initialEnrollments={page.items} instructorName={ctx.user.name || "Docente"} />
      <LoadMoreLink basePath="/campus/estudiantes" nextCursor={page.nextCursor} />
    </>
  );
}
