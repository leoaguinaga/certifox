import { Metadata } from "next";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export const metadata: Metadata = {
    title: "Dashboard - CertiFox",
    description: "Sistema de gestión de certificados",
};

interface CompanyLayoutProps {
    children: React.ReactNode;
    params: Promise<{ companySlug: string }>;
}

export default async function CompanyLayout({ children, params }: CompanyLayoutProps) {
    const { companySlug } = await params;

    // In the future: Validate tenant exists and user belongs to it.

    return (
        <div className="flex h-screen overflow-hidden bg-muted/30">
            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <Sidebar companySlug={companySlug} />
            </div>

            {/* Main container */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header companySlug={companySlug} />

                <main className="flex-1 overflow-y-auto bg-muted/20 focus:outline-none">
                    {children}
                </main>
            </div>
        </div>
    );
}
