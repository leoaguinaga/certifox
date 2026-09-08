"use client";

import { LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export type AuthTab = "login" | "register";

interface AuthTabsProps {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
}

export function AuthTabs({ activeTab, onTabChange }: AuthTabsProps) {
  return (
    <div className="flex justify-center mb-8">
      <div
        className="inline-flex p-1 rounded-xl bg-stone-200/70 dark:bg-stone-800/70 shadow-inner"
        role="tablist"
        aria-label="Selector de acceso"
      >
        <button
          type="button"
          role="tab"
          id="tab-login"
          aria-selected={activeTab === "login"}
          onClick={() => onTabChange("login")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer",
            activeTab === "login"
              ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
          )}
        >
          <LogIn className="w-4.5 h-4.5" />
          <span>Iniciar Sesión</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-register"
          aria-selected={activeTab === "register"}
          onClick={() => onTabChange("register")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer",
            activeTab === "register"
              ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
          )}
        >
          <UserPlus className="w-4.5 h-4.5" />
          <span>Crear Cuenta</span>
        </button>
      </div>
    </div>
  );
}
