import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { StudentSidebar } from "@/features/learning/components/student-sidebar";
import { mockStudent } from "@/data/student";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FF]">
      <PublicHeader />
      <main className="w-full pt-16 flex-1">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <StudentSidebar student={mockStudent} />
            <div className="lg:col-span-9 flex flex-col gap-8 w-full">
              {children}
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
