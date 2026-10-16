"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  Video,
  CheckCircle2,
} from "lucide-react";
import { useCampusRole } from "../context/campus-role-context";

export function CampusHeader() {
  const { role, user, toggleMobileNav } = useCampusRole();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md dark:border-stone-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu Trigger & Section Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={toggleMobileNav}
          className="lg:hidden p-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          aria-label="Abrir menú lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
          <span className="hidden sm:inline text-sm sm:text-base font-medium text-stone-900 dark:text-white truncate">Campus</span>
          <span className="hidden sm:inline text-stone-300 dark:text-stone-700">/</span>
          <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white truncate">
            {role === "student" ? "Mi Panel de Aprendizaje" : "Panel de Gestión Docente"}
          </h1>
        </div>
      </div>

      {/* Right: Search, Streak, Notifications & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              role === "student"
                ? "Buscar cursos, módulos o temas..."
                : "Buscar alumnos, cohortes o tareas..."
            }
            className="w-full h-9 pl-9 pr-9 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#FD761A] focus:border-[#FD761A] transition-all shadow-2xs"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-stone-400 dark:text-stone-500 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Student Streak Badge: Will be use on the next sprint */}
        {/* {role === "student" && user.streakDays && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 text-[#FD761A] rounded-lg text-xs font-bold shadow-2xs select-none"
            title={`Racha activa de ${user.streakDays} días consecutivos de estudio`}
          >
            <Flame className="w-4 h-4 fill-[#FD761A]" />
            <span>{user.streakDays} días</span>
          </div>
        )} */}

        {/* Teacher Pending Reviews Badge */}
        {role === "teacher" && user.pendingReviewsCount && (
          <Link
            href="/campus/tareas"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 text-[#FD761A] rounded-lg text-xs font-bold shadow-2xs select-none hover:bg-orange-100 transition-colors"
            title={`${user.pendingReviewsCount} entregas pendientes de calificación`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{user.pendingReviewsCount} por calificar</span>
          </Link>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-expanded={notificationsOpen}
            aria-label="Ver notificaciones"
            className="relative p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FD761A] ring-2 ring-white dark:ring-stone-900" />
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-88 z-40 bg-white dark:bg-stone-900 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="font-bold text-stone-900 dark:text-white">
                    Notificaciones
                  </span>
                  <span className="text-[10px] font-bold text-[#FD761A] bg-orange-100 dark:bg-orange-950/60 px-1.5 py-0.5 rounded">
                    2 nuevas
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-[#FD761A]" />
                        Clase en vivo hoy
                      </span>
                      <span className="text-[10px] text-stone-500">En 2h</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400">
                      Sesión de Q&A: Estabilidad en taludes dinámicos (18:00 hrs).
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 dark:text-white">
                        Rúbrica ISO 17024
                      </span>
                      <span className="text-[10px] text-stone-500">Ayer</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400">
                      Se actualizaron los criterios de evaluación del Módulo 3.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
