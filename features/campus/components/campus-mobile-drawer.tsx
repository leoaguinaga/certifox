"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Shield, Headphones } from "lucide-react";
import { useCampusRole } from "../context/campus-role-context";
import { CAMPUS_NAV_ITEMS } from "../constants";
import { CampusUserBadge } from "./campus-user-badge";
import { cn } from "@/lib/utils";

export function CampusMobileDrawer() {
  const pathname = usePathname();
  const { role, mobileNavOpen, setMobileNavOpen } = useCampusRole();

  if (!mobileNavOpen) return null;

  const navItems = CAMPUS_NAV_ITEMS.filter((item) =>
    item.roles.includes(role)
  );

  const isLinkActive = (href: string) => {
    if (href === "/campus") {
      return pathname === "/campus" || pathname === "/campus/";
    }
    return pathname.startsWith(href);
  };

  const closeDrawer = () => setMobileNavOpen(false);

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer Container */}
      <div className="relative flex flex-col justify-between w-72 max-w-[85vw] bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 h-full shadow-2xl z-50">
        <div className="flex flex-col">
          {/* Header */}
          <div className="h-16 px-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <Link
              href="/campus"
              onClick={closeDrawer}
              className="flex items-center gap-2.5"
            >
              <div className="relative flex items-center justify-center size-6 rounded bg-gradient-to-br from-[#FD761A] to-[#E05D04] text-white shadow-xs shrink-0">
                <Shield className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight leading-none text-stone-900 dark:text-white">
                  Certifox
                </span>
                <span className="text-[10px] text-[#FD761A] font-bold uppercase tracking-wider mt-0.5">
                  {role === "student" ? "Aula Virtual" : "Portal Docente"}
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={closeDrawer}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href);

              return (
                <Link
                  key={`mobile-${item.href}-${item.label}`}
                  href={item.href}
                  onClick={closeDrawer}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-orange-50 dark:bg-orange-950/40 text-[#FD761A] font-bold border border-orange-200/80 dark:border-orange-900/60 shadow-2xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800/60 font-semibold"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0",
                        active ? "text-[#FD761A]" : "text-stone-400 dark:text-stone-500"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badgeVariant === "pulse" && (
                      <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#FD761A] animate-pulse" />
                    )}

                    {item.badge && item.badgeVariant !== "pulse" && (
                      <span
                        className={cn(
                          "text-[11px] font-bold px-1.5 py-0.5 rounded",
                          item.badgeVariant === "warning"
                            ? "bg-orange-100 dark:bg-orange-950/80 text-[#FD761A] border border-orange-200 dark:border-orange-900/60"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div>
          <div className="px-4 py-2.5 border-t border-stone-200 dark:border-stone-800">
            <Link
              href="/campus/mesa-de-ayuda"
              onClick={closeDrawer}
              className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            >
              <Headphones className="w-4 h-4 text-stone-400" />
              <span>Mesa de Ayuda</span>
            </Link>
          </div>
          <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60">
            <CampusUserBadge />
          </div>
        </div>
      </div>
    </div>
  );
}
