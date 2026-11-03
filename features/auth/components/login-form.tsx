"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { AuthTab } from "./auth-tabs";

interface LoginFormProps {
  onSwitchTab?: (tab: AuthTab) => void;
}

export function LoginForm({ onSwitchTab }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        // AC-08: Mensaje genérico para credenciales inválidas
        const msg = "Credenciales incorrectas. Verifica tu correo y contraseña.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      toast.success("¡Bienvenido al Campus!");
      router.push("/campus");
      router.refresh();
    } catch {
      const msg = "Credenciales incorrectas o error en el servidor.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">
            Ingreso al Campus
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
            Accede a tus cursos, evaluaciones y diplomas vigentes.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-800 dark:text-stone-200 shrink-0">
          <Lock className="w-5.5 h-5.5 text-stone-700 dark:text-stone-300" />
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
          >
            Correo Electrónico
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alumno@certifox.pe"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Verificando...</span>
            </>
          ) : (
            <>
              <span>Iniciar sesión</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register footer */}
      {onSwitchTab && (
        <div className="mt-6 pt-4 text-center bg-stone-100/70 dark:bg-stone-800/60 rounded-xl p-3">
          <p className="text-xs text-stone-600 dark:text-stone-400">
            ¿Aún no tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => onSwitchTab("register")}
              className="font-bold text-[#FD761A] hover:underline ml-1 cursor-pointer"
            >
              Registrarme gratis
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
