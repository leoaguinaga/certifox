"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headphones } from "lucide-react";
import { useCampusRole } from "../context/campus-role-context";
import { CAMPUS_NAV_ITEMS } from "../constants";
import { CampusUserBadge } from "./campus-user-badge";
import { cn } from "@/lib/utils";

export function CampusSidebar() {
  const pathname = usePathname();
  const { role } = useCampusRole();

  // Filter items matching the active role
  const navItems = CAMPUS_NAV_ITEMS.filter((item) =>
    item.roles.includes(role)
  );

  const isLinkActive = (href: string) => {
    if (href === "/campus") {
      return pathname === "/campus" || pathname === "/campus/";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex flex-col justify-between w-55 bg-white dark:bg-stone-900 dark:border-stone-800 fixed inset-y-0 left-0 z-30 select-none">
      {/* Top: Brand Header & Navigation */}
      <div className="flex flex-col">
        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href);

            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
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
                    <span
                      className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#FD761A] animate-pulse"
                      title="Sesión hoy"
                    />
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

                  {active && !item.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FD761A]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Help Desk & User Profile Badge */}
      <div>
        <div className="px-4 py-3 border-t border-stone-200 dark:border-stone-800">
          <Link
            href="/campus/mesa-de-ayuda"
            className="flex items-center gap-3 px-3 pt-1.5 font-semibold rounded-lg text-sm transition-colors"
          >
            <Headphones className="size-5 shrink-0 text-stone-400" />
            <span>Mesa de Ayuda</span>
          </Link>
        </div>

        <div className="p-3 pt-1.5">
          <CampusUserBadge />
        </div>
      </div>
    </aside>
  );
}
