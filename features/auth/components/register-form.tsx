"use client";

import { useState } from "react";
import { UserPlus, BadgeCheck, Mail, Smartphone, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { AuthTab } from "./auth-tabs";

interface RegisterFormProps {
  onSwitchTab: (tab: AuthTab) => void;
}

export function RegisterForm({ onSwitchTab }: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Compute simple password strength (0 to 3)
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 1;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit registration:", {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      acceptTerms,
    });
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
            Registra tus datos fidedignos para la emisión legal de certificados.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-[#FD761A] shrink-0">
          <UserPlus className="w-5.5 h-5.5" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label
            htmlFor="reg-name"
            className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
          >
            Nombre y Apellidos completos
          </label>
          <div className="relative flex items-center">
            <BadgeCheck className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="reg-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Carlos Mendoza Quiroga"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-[#FD761A] focus:border-transparent transition-all shadow-2xs"
            />
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 font-medium">
            Importante: Tal como figurará en tus actas y diplomas oficiales con QR.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="reg-email"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              Correo electrónico
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="carlos@empresa.com"
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-[#FD761A] focus:border-transparent transition-all shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-phone"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              Teléfono / WhatsApp
            </label>
            <div className="relative flex items-center">
              <Smartphone className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="reg-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+51 987 654 321"
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-[#FD761A] focus:border-transparent transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="reg-pass"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              Contraseña
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="reg-pass"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full h-10 pl-9 pr-9 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-[#FD761A] focus:border-transparent transition-all shadow-2xs"
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

          <div>
            <label
              htmlFor="reg-pass2"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
            >
              Confirmar contraseña
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="reg-pass2"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full h-10 pl-9 pr-9 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-[#FD761A] focus:border-transparent transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1"
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Password Strength Indicator */}
        <div className="flex items-center gap-2 py-1">
          <div
            className={`flex-1 h-1.5 rounded-full transition-colors ${strengthScore >= 1 ? "bg-emerald-500" : "bg-stone-200 dark:bg-stone-800"
              }`}
          />
          <div
            className={`flex-1 h-1.5 rounded-full transition-colors ${strengthScore >= 2 ? "bg-emerald-500" : "bg-stone-200 dark:bg-stone-800"
              }`}
          />
          <div
            className={`flex-1 h-1.5 rounded-full transition-colors ${strengthScore >= 3 ? "bg-emerald-500" : "bg-stone-200 dark:bg-stone-800"
              }`}
          />
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium ml-1">
            {strengthScore === 0
              ? "Sin contraseña"
              : strengthScore === 1
                ? "Seguridad baja"
                : strengthScore === 2
                  ? "Seguridad media"
                  : "Seguridad alta"}
          </span>
        </div>

        {/* Terms checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#FD761A] accent-[#FD761A] focus:ring-0 cursor-pointer shrink-0"
            />
            <span className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Acepto los términos de servicio, política de privacidad y autorizo la emisión de certificados oficiales bajo normativas vigentes.
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full h-11 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer mt-3"
        >
          <span>Crear mi cuenta de estudiante</span>
          <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </form>

      {/* Switch to Login footer */}
      {/* <div className="mt-5 text-center">
        <p className="text-xs text-stone-600 dark:text-stone-400">
          ¿Ya posees una cuenta registrada?{" "}
          <button
            type="button"
            onClick={() => onSwitchTab("login")}
            className="font-bold text-[#FD761A] hover:underline ml-1 cursor-pointer"
          >
            Iniciar sesión
          </button>
        </p>
      </div> */}
    </div>
  );
}
