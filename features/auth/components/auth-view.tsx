"use client";

import { useState } from "react";
import { AuthTabs, AuthTab } from "./auth-tabs";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export function AuthView() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  return (
    <div className="relative w-full overflow-hidden py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      {/* Background Glow Effect */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-stone-200/80 via-stone-100/50 to-transparent dark:from-stone-800/50 dark:via-stone-900/30 rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight mb-2">
            ¡Bienvenido a Certifox!
          </h1>
          <p className="text-base text-stone-600 dark:text-stone-400 leading-relaxed">
            Gestiona tu formación técnica, certificaciones verificables y credenciales oficiales en un solo lugar seguro.
          </p>
        </div>

        {/* Tab Switcher */}
        <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Auth Form Card */}
        <div className="max-w-xl mx-auto w-full">
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-[0_12px_40px_rgba(13,28,47,0.06)] relative transition-all">
            {activeTab === "login" ? (
              <LoginForm onSwitchTab={setActiveTab} />
            ) : (
              <RegisterForm onSwitchTab={setActiveTab} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
