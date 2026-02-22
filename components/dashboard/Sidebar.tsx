"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Users,
    FileText,
    BellRing,
    Settings,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    companySlug: string;
}

export function Sidebar({ companySlug }: SidebarProps) {
    const pathname = usePathname();

    const navigation = [
        { name: "Dashboard", href: `/${companySlug}/dashboard`, icon: BarChart3 },
        { name: "Trabajadores", href: `/${companySlug}/workers`, icon: Users },
        { name: "Certificados", href: `/${companySlug}/certificates`, icon: FileText },
        { name: "Alertas", href: `/${companySlug}/alerts`, icon: BellRing },
        { name: "Configuración", href: `/${companySlug}/settings`, icon: Settings },
    ];

    return (
        <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
            <div className="flex h-16 shrink-0 items-center px-6 border-b border-sidebar-border">
                <Link href={`/${companySlug}/dashboard`} className="flex items-center gap-2">
                    <img src="/icon.png" className="h-8 w-auto" alt="" />
                    <span className="text-xl font-bold tracking-tight text-sidebar-foreground">CertiFox</span>
                </Link>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto pt-6 px-4">
                <div className="mb-4 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Menú Principal
                </div>
                <nav className="flex-1 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                                    "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-primary",
                                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-sidebar-border">
                {/* User profile snippet or specific company info can go here */}
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        A
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-sidebar-foreground">Acme Corp</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[130px]">admin@acme.com</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
