"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, ShieldCheck, BookOpen, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileNavItem {
  label: string;
  href: string;
  iconType?: "book" | "shield" | "graduation";
}

interface MobileNavProps {
  navLinks?: MobileNavItem[];
}

const DEFAULT_LINKS: MobileNavItem[] = [
  { label: "Explorar cursos", href: "/cursos", iconType: "book" },
  { label: "Verificar certificado", href: "/#verificacion", iconType: "shield" },
  { label: "Mi aprendizaje", href: "/campus", iconType: "graduation" },
];

export function MobileNav({ navLinks = DEFAULT_LINKS }: MobileNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isLinkActive = (href: string) => {
    if (href === "/cursos") {
      return pathname.startsWith("/cursos");
    }
    if (href === "/campus") {
      return pathname.startsWith("/campus");
    }
    if (href === "/verificar" || href === "/#verificacion" || href === "#verificacion") {
      return pathname.startsWith("/verificar");
    }
    return pathname === href;
  };

  const renderIcon = (type?: string, isActive?: boolean) => {
    const iconClass = cn("w-4 h-4", isActive ? "text-white" : "text-orange-600");
    switch (type) {
      case "book":
        return <BookOpen className={iconClass} />;
      case "shield":
        return <ShieldCheck className={iconClass} />;
      case "graduation":
        return <GraduationCap className={iconClass} />;
      default:
        return <BookOpen className={iconClass} />;
    }
  };

  return (
    <div className="md:hidden flex items-center">
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-label="Abrir menú de navegación"
        className="p-2 rounded-lg text-stone-700 hover:text-stone-900 hover:bg-stone-100/80 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/30 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={closeMenu}
        >
          <div
            className="w-full bg-[#FFFDF9] border-b border-stone-200 shadow-xl px-4 py-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors",
                      isActive
                        ? "bg-secondary-container text-white font-semibold shadow-xs"
                        : "text-stone-700 hover:text-stone-900 hover:bg-stone-100"
                    )}
                  >
                    {renderIcon(link.iconType, isActive)}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-stone-200/80 flex flex-col gap-3">
              {/* Profile card demo */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-orange-500/20">
                    <Image
                      src="/images/avatars/student.svg"
                      alt="Mi Campus"
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 leading-none">Mi Campus</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">Estudiante acreditada</p>
                  </div>
                </div>
                <Link
                  href="/ingresar"
                  onClick={closeMenu}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  Ingresar
                </Link>
              </div>

              <Link
                href="#cursos"
                onClick={closeMenu}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0D1C2F] text-white text-sm font-semibold hover:bg-stone-800 transition-colors shadow-sm"
              >
                <span>Explorar cursos</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

