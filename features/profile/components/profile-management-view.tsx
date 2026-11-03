"use client";

import { useState } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Building,
  KeyRound,
  CheckCircle2,
  Lock,
  Save,
  UploadCloud,
  Shield,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { UserProfileData } from "../types";
import { updateProfileServerAction, changePasswordServerAction } from "../actions";
import { uploadFileToR2 } from "@/lib/upload";

interface ProfileManagementViewProps {
  initialProfile: UserProfileData;
}

export function ProfileManagementView({ initialProfile }: ProfileManagementViewProps) {
  const [profile, setProfile] = useState<UserProfileData>(initialProfile);
  const [name, setName] = useState(initialProfile.name);
  const [institution, setInstitution] = useState(initialProfile.institution);
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Guardar datos básicos
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateProfileServerAction({
        name,
        institution,
        avatarUrl,
      });

      if (!res.success || !res.profile) {
        toast.error(res.error || "No se pudo actualizar el perfil.");
        return;
      }

      setProfile(res.profile);
      toast.success("Perfil actualizado con éxito.");
    } catch {
      toast.error("Ocurrió un error inesperado al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  // Subida de avatar con R2 presigned URL (AC-20)
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast.info("Validando y transmitiendo imagen a almacenamiento seguro...");

    try {
      const { publicUrl } = await uploadFileToR2({
        type: "avatar",
        file,
      });

      setAvatarUrl(publicUrl);

      // Auto guardar avatar actualizado en el perfil
      const res = await updateProfileServerAction({
        name,
        institution,
        avatarUrl: publicUrl,
      });

      if (res.success && res.profile) {
        setProfile(res.profile);
        toast.success("Foto de perfil actualizada.");
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Error al subir la imagen.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePasswordServerAction({
        currentPassword,
        newPassword,
      });

      if (!res.success) {
        toast.error(res.error || "No se pudo cambiar la contraseña.");
        return;
      }

      toast.success(res.message || "Contraseña cambiada exitosamente.");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Error al actualizar la contraseña.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-2">
          <User className="w-6 h-6 text-[#FD761A]" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1C2F] tracking-tight">
            Mi Perfil
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#45474C] mt-1">
          Identificación oficial, entidad laboral y seguridad de acceso bajo la Ley N° 29733 de Protección de Datos Personales.
        </p>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 sm:p-8 space-y-6">
          {/* Avatar and Role Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-xs border-2 border-orange-500/30 bg-stone-100 shrink-0">
                <Image
                  src={avatarUrl}
                  alt={profile.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#0D1C2F]">{profile.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      profile.role === "INSTRUCTOR"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-orange-50 text-orange-700 border border-orange-200"
                    }`}
                  >
                    {profile.role === "INSTRUCTOR" ? "Docente / Instructor" : "Estudiante Acreditado"}
                  </span>
                </div>
                <p className="text-xs text-[#45474C] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  {profile.email}
                </p>
                <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  Miembro desde {new Date(profile.createdAt).toLocaleDateString("es-PE")}
                </p>
              </div>
            </div>

            {/* Avatar Upload Button */}
            <div>
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#0D1C2F] text-xs font-bold inline-flex items-center gap-2 transition-colors border border-stone-200"
              >
                <UploadCloud className="w-4 h-4 text-[#FD761A]" />
                <span>{isUploading ? "Subiendo..." : "Cambiar foto"}</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isUploading}
                onChange={handleAvatarChange}
              />
              <span className="block text-[10px] text-stone-400 mt-1">JPEG, PNG o WEBP, máx. 2 MB</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D1C2F] block">
                Nombres y Apellidos Oficiales
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FD761A]/30 transition-all"
                  required
                />
              </div>
              <span className="text-[10px] text-[#45474C] block">
                Nombre que figurará en los certificados y diplomas emitidos.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D1C2F] block">
                Correo Electrónico Registrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-500 font-semibold cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-stone-400 block">
                Identificador único de acceso y Better Auth.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D1C2F] block">
                Documento de Identidad Oficial ({profile.documentType})
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profile.documentNumberMasked}
                  readOnly
                  disabled
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#EFF4FF] border border-[#D5E3FD] text-xs font-mono font-bold text-stone-700 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-stone-500 block">
                Enmascarado por confidencialidad (Ley N° 29733 de Protección de Datos Personales).
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D1C2F] block">
                Empresa o Institución de Afiliación
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Ej. Consorcio Minero, Escuela Técnica..."
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FD761A]/30 transition-all"
                />
              </div>
              <span className="text-[10px] text-[#45474C] block">
                Referencia laboral o centro de capacitación técnica.
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#FD761A] hover:bg-[#E05E09] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
            </button>
          </div>
        </div>

        {/* Security & Password Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#FD761A]" />
            <h3 className="text-sm sm:text-base font-bold text-[#0D1C2F]">
              Seguridad y Clave de Acceso
            </h3>
          </div>
          <p className="text-xs text-[#45474C] leading-relaxed">
            Tu cuenta está protegida mediante sesiones criptográficas seguras. Si sospechas de acceso no autorizado o deseas renovar tu clave, puedes cambiarla aquí.
          </p>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#0D1C2F] font-bold text-xs inline-flex items-center gap-2 transition-colors border border-stone-200"
          >
            <Shield className="w-4 h-4 text-stone-600" />
            <span>Actualizar contraseña</span>
          </button>
        </div>
      </form>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-[#0D1C2F] text-base">
                Cambiar Contraseña de Acceso
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0D1C2F]">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Tu clave actual"
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FD761A]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0D1C2F]">
                  Nueva Contraseña (mínimo 8 caracteres)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FD761A]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0D1C2F]">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Repite la nueva contraseña"
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FD761A]/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 font-bold text-xs hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 rounded-xl bg-[#FD761A] hover:bg-[#E05E09] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isChangingPassword ? "Actualizando..." : "Confirmar Cambio"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
