"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { MobileNav, MobileNavItem } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";

const NAV_LINKS: MobileNavItem[] = [
  { label: "Explorar cursos", href: "/cursos", iconType: "book" },
  { label: "Verificar certificado", href: "/verificar", iconType: "shield" },
  { label: "Mi aprendizaje", href: "/mi-aprendizaje", iconType: "graduation" },
];

export function PublicHeader() {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/cursos") {
      return pathname.startsWith("/cursos");
    }
    if (href === "/mi-aprendizaje") {
      return pathname.startsWith("/mi-aprendizaje");
    }
    if (href === "/verificar" || href === "/#verificacion" || href === "#verificacion") {
      return pathname.startsWith("/verificar");
    }
    return pathname === href;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-stone-200/60 transition-all">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Side: Brand and Desktop Nav */}
        <div className="flex items-center gap-8">
          <Logo href="/" />

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-secondary-container text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/80"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Profile / Mobile Nav */}
        <div className="flex items-center gap-3">
          {/* User profile preview or action button */}
          <Link
            href="/mi-aprendizaje"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            title="Ir a mi aula virtual"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-orange-500/20 shadow-xs shrink-0">
              <Image
                src="https://lh3.googleusercontent.com/aida/AEtjO1UcsVlSjtfMChF53ZjY37UWU4UWV9CbuOqwVdB1xtHh4iX7QJDEO2JY3N3oR803kNIXE-PCzpaC4yj1tIziPVjphxRlHMfzpyUCME7gFRxIVtp3ZGGowIcziwTZfZWWuR6Y3LxbhmgtofvYEPC1-lTOAyn53-D3IECneVotkyIDRJ8Ub-NZebhsrFx4iG7IqAW7uR-BmluYkN0wlQ7WEbY9PN77NdblwNCmEc5K2t8x7B6P_hih7ahf-Q"
                alt="Foto de perfil de Brunella E."
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <span className="hidden lg:inline text-xs font-medium text-stone-700">
              Brunella E.
            </span>
          </Link>

          {/* Responsive Mobile Drawer */}
          <MobileNav navLinks={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
