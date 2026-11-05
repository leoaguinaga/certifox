import { campusContext, cursorParam } from "@/server/core/page-guards";
import {
  listCompletedEnrollmentsForIssuing,
  listMyCertificates,
} from "@/server/modules/certification/certification.service";
import { CertificatesManagementView } from "@/features/certificates-management/components/certificates-management-view";
import { LoadMoreLink } from "@/components/shared/load-more-link";

export const dynamic = "force-dynamic";

export default async function CampusCertificadosPage({ searchParams }: { searchParams: Promise<{ cursor?: string }> }) {
  const ctx = await campusContext("/campus/certificados");

  if (ctx.view === "STUDENT") {
    const studentCertificates = await listMyCertificates(ctx);
    return <CertificatesManagementView role="STUDENT" studentCertificates={studentCertificates} eligibleEnrollments={[]} />;
  }

  const { cursor } = await searchParams;
  const page = await listCompletedEnrollmentsForIssuing(ctx, { cursor: cursorParam(cursor), limit: 50 });
  return (
    <>
      <CertificatesManagementView role="INSTRUCTOR" studentCertificates={[]} eligibleEnrollments={page.items} />
      <LoadMoreLink basePath="/campus/certificados" nextCursor={page.nextCursor} />
    </>
  );
}
