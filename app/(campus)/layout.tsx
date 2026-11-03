import { getSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { CampusRoleProvider } from "@/features/campus/context/campus-role-context";
import { CampusSidebar } from "@/features/campus/components/campus-sidebar";
import { CampusMobileDrawer } from "@/features/campus/components/campus-mobile-drawer";
import { CampusHeader } from "@/features/campus/components/campus-header";

// Regla RNF y Caché: El campus autenticado es dinámico y nunca se pre-renderiza estático ni se cachea
export const dynamic = "force-dynamic";

export default async function CampusLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  try {
    session = await getSession();
  } catch (err) {
    console.error("Error al obtener sesión en CampusLayout:", err);
  }

  // AC-09: Sin sesión, /campus* redirige a /ingresar
  if (!session) {
    redirect("/ingresar");
  }

  const role = session.user.role === "INSTRUCTOR" ? "teacher" : "student";
  const user = {
    name: session.user.name || "Usuario",
    email: session.user.email,
    avatar: session.user.image || undefined,
  };

  return (
    <CampusRoleProvider initialRole={role} initialUser={user}>
      <div className="min-h-screen flex bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased font-sans">
        {/* Desktop Fixed Left Sidebar */}
        <CampusSidebar />

        {/* Mobile Responsive Drawer */}
        <CampusMobileDrawer />

        {/* Main Content Area (Offset by sidebar on lg) */}
        <div className="flex-1 lg:pl-55 flex flex-col min-h-screen w-full rounded-xl transition-all">
          {/* Top Bar */}
          <CampusHeader />

          {/* Page Content with natural scroll */}
          <div className="w-full h-full rounded-tl-xl bg-[#F8F9FC]">
            <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto max-w-7xl space-y-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </CampusRoleProvider>
  );
}
