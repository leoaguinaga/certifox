"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Settings, ArrowLeftRight, LogOut } from "lucide-react";
import { useCampusRole } from "../context/campus-role-context";
import { cn } from "@/lib/utils";

export function CampusUserBadge() {
  const { user, role, toggleRole } = useCampusRole();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      {/* Dropdown Menu popover */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-2 z-50 p-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-lg text-xs space-y-1">
            <div className="px-2 py-1.5 border-b border-stone-100 dark:border-stone-800">
              <p className="font-bold text-stone-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
            </div>

            {/* Quick Role Switcher */}
            <button
              type="button"
              onClick={() => {
                toggleRole();
                setMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#FD761A]" />
                <span>
                  Cambiar vista
                  {/* <strong>{role === "student" ? "Docente" : "Estudiante"}</strong> */}
                </span>
              </div>
              {/* <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-[#FD761A] font-bold">
                Switch
              </span> */}
            </button>

            <Link
              href="/campus/perfil"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-stone-400" />
              <span>Ajustes de cuenta</span>
            </Link>

            <div className="pt-1 border-t border-stone-100 dark:border-stone-800">
              <Link
                href="/ingresar"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Main Profile Card in Sidebar Footer */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0 w-8.5 h-8.5 rounded-full overflow-hidden ring-1 ring-stone-200 dark:ring-stone-700">
            <Image
              src={user.avatar}
              alt={`Foto de perfil de ${user.name}`}
              fill
              sizes="34px"
              className="object-cover"
            />
            <span
              className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900"
              title="En línea"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-stone-900 dark:text-white truncate leading-tight">
              {user.name}
            </span>
            <span
              className={cn(
                "text-[10px] font-semibold truncate mt-0.5",
                role === "student"
                  ? "text-stone-500 dark:text-stone-400"
                  : "text-[#FD761A]"
              )}
            >
              {user.roleLabel}
            </span>
          </div>
        </div>

        <button
          type="button"
          aria-label="Ajustes de cuenta y cambio de rol"
          className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
