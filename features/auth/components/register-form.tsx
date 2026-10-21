"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, User } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { AuthTab } from "./auth-tabs";

interface RegisterFormProps {
  onSwitchTab?: (tab: AuthTab) => void;
}

export function RegisterForm({ onSwitchTab }: RegisterFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      const msg = "Las contraseñas no coinciden.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 8) {
      const msg = "La contraseña debe tener al menos 8 caracteres.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!acceptTerms) {
      const msg = "Debes aceptar los términos y condiciones.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp.email({
        email: email.trim(),
        password,
        name: fullName.trim(),
      });

      if (result.error) {
        const msg = result.error.message || "Error al registrar la cuenta. El correo ya podría estar en uso.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      toast.success("¡Cuenta de estudiante creada con éxito!");
      router.push("/campus");
      router.refresh();
    } catch {
      const msg = "Error en el servidor durante el registro.";
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
            Crear Cuenta de Estudiante
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
            Registra tus datos para acceder al campus y tus certificados.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-[#FD761A] shrink-0">
          <UserPlus className="w-5.5 h-5.5" />
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
            htmlFor="register-name"
            className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
          >
            Nombre Completo
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="register-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-[#FD761A] focus:border-transparent transition-all shadow-2xs"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
          >
            Correo Electrónico
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="register-email"
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
          <label
            htmlFor="register-password"
            className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
          >
            Contraseña
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full h-10 pl-9 pr-10 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-[#FD761A] focus:border-transparent transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1"
              aria-label={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="register-confirm-password"
            className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
          >
            Confirmar Contraseña
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="w-full h-10 pl-9 pr-10 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-[#FD761A] focus:border-transparent transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1"
              aria-label={showConfirmPassword ? "Ocultar" : "Mostrar"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded text-[#FD761A] accent-[#FD761A] focus:ring-0 cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
            Acepto los términos del servicio y la política de privacidad.
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Registrando...</span>
            </>
          ) : (
            <>
              <span>Crear cuenta de estudiante</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login footer */}
      {onSwitchTab && (
        <div className="mt-6 pt-4 text-center bg-stone-100/70 dark:bg-stone-800/60 rounded-xl p-3">
          <p className="text-xs text-stone-600 dark:text-stone-400">
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => onSwitchTab("login")}
              className="font-bold text-[#FD761A] hover:underline ml-1 cursor-pointer"
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
