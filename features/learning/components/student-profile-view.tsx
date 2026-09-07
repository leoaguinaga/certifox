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
} from "lucide-react";
import { StudentProfile } from "@/features/learning/types";

interface StudentProfileViewProps {
  student: StudentProfile;
}

export function StudentProfileView({ student }: StudentProfileViewProps) {
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [company, setCompany] = useState(student.company || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <User className="w-6 h-6 text-[#FD761A]" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1C2F] tracking-tight">
            Mi Perfil de Estudiante
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#45474C] mt-1">
          Gestiona tus datos de identificación oficial, entidad laboral y seguridad de acceso.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Tus datos han sido actualizados correctamente en el registro académico.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-xs border-2 border-orange-500/20">
              <Image
                src={student.avatar}
                alt={student.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0D1C2F]">{student.name}</h3>
              <p className="text-xs text-[#45474C]">ID: {student.id} • {student.statusLabel}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FD761A]/30 transition-all"
                  required
                />
              </div>
              <span className="text-[10px] text-[#45474C] block">
                Utilizado para la emisión de diplomas oficiales.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D1C2F] block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FD761A]/30 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D1C2F] block">
                Documento de Identidad Oficial ({student.documentType})
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={student.documentNumberMasked}
                  readOnly
                  disabled
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-[#EFF4FF] border border-[#D5E3FD] text-xs font-mono text-stone-600 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-[#45474C] block">
                Bloqueado por seguridad jurídica (Ley de Habeas Data).
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0D1C2F] block">
                Empresa o Entidad de Homologación
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#0D1C2F] font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FD761A]/30 transition-all"
                />
              </div>
              <span className="text-[10px] text-[#45474C] block">
                Para validación de legajos en minería y contratistas.
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FD761A] hover:bg-[#E05E09] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>

        {/* Security & Access Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#FD761A]" />
            <h3 className="text-sm sm:text-base font-bold text-[#0D1C2F]">
              Seguridad y Contraseña
            </h3>
          </div>
          <p className="text-xs text-[#45474C] leading-relaxed">
            Tu cuenta está protegida mediante encriptación SSL y token JWT seguro. Puedes actualizar tu clave de acceso en cualquier momento.
          </p>
          <button
            type="button"
            onClick={() => alert("Enlace para actualización segura de credenciales enviado a tu correo registrado.")}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#0D1C2F] font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Cambiar contraseña</span>
          </button>
        </div>
      </form>
    </div>
  );
}
