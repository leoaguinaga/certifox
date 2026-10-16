"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { AuthTab } from "./auth-tabs";

interface LoginFormProps {
  onSwitchTab: (tab: AuthTab) => void;
}

export function LoginForm({ onSwitchTab }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/campus");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">
            Ingreso de Estudiante
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
            Accede a tus cursos, evaluaciones y diplomas vigentes.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-800 dark:text-stone-200 shrink-0">
          <Lock className="w-5.5 h-5.5 text-stone-700 dark:text-stone-300" />
        </div>
      </div>

      {/* Social Google Login Button */}
      <button
        type="button"
        className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 text-stone-800 dark:text-stone-200 font-semibold text-sm transition-colors mb-4 cursor-pointer"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
        <span>Continuar con Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center my-4">
        <div className="flex-grow h-px bg-stone-200 dark:bg-stone-800" />
        <span className="shrink-0 px-3 text-[11px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400">
          o con correo o DNI
        </span>
        <div className="flex-grow h-px bg-stone-200 dark:bg-stone-800" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-identifier"
            className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
          >
            Correo Institucional o DNI
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="login-identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="alumno@certifox.edu o 74829102"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-[#FD761A] focus:border-transparent transition-all shadow-2xs"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold text-stone-700 dark:text-stone-300"
            >
              Contraseña
            </label>
            <Link
              href="#"
              className="text-xs font-semibold text-[#FD761A] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-10 pl-9 pr-10 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-[#FD761A] focus:border-transparent transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#FD761A] accent-[#FD761A] focus:ring-0 cursor-pointer"
            />
            <span className="text-xs text-stone-600 dark:text-stone-400">
              Mantener sesión iniciada
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full h-11 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer mt-2"
        >
          <span>Iniciar sesión en mi cuenta</span>
          <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </form>

      {/* Switch to Register footer */}
      {/* <div className="mt-6 pt-4 text-center bg-stone-100/70 dark:bg-stone-800/60 rounded-xl p-3">
        <p className="text-xs text-stone-600 dark:text-stone-400">
          ¿Aún no tienes expediente de estudiante?{" "}
          <button
            type="button"
            onClick={() => onSwitchTab("register")}
            className="font-bold text-[#FD761A] hover:underline ml-1 cursor-pointer"
          >
            Registrarme gratis
          </button>
        </p>
      </div> */}
    </div>
  );
}
