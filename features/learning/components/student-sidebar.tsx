"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Award,
  UserCheck,
  HelpCircle,
  Headphones,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { StudentProfile } from "@/features/learning/types";

interface StudentSidebarProps {
  student: StudentProfile;
}

export function StudentSidebar({ student }: StudentSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Mi aprendizaje",
      href: "/mi-aprendizaje",
      icon: BookOpen,
      badge: null,
      isActive: pathname === "/mi-aprendizaje" || pathname === "/mi-aprendizaje/",
    },
    {
      label: "Mis certificados",
      href: "/mis-certificados",
      icon: Award,
      badge: student.totalCertificates > 0 ? student.totalCertificates.toString() : null,
      isActive: pathname.startsWith("/mis-certificados"),
    },
    {
      label: "Mi perfil",
      href: "/perfil",
      icon: UserCheck,
      badge: null,
      isActive: pathname.startsWith("/perfil"),
    },
    {
      label: "Mesa de ayuda",
      href: "/mesa-de-ayuda",
      icon: HelpCircle,
      badge: null,
      isActive: pathname.startsWith("/mesa-de-ayuda"),
    },
  ];

  return (
    <aside className="lg:col-span-3 flex flex-col gap-4">
      {/* Tarjeta Perfil Rápido */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 flex flex-col items-center text-center relative overflow-hidden">
        <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-xs mb-3 border-2 border-orange-500/20">
          <Image
            src={student.avatar}
            alt={`Foto de perfil de ${student.name}`}
            fill
            sizes="80px"
            className="object-cover"
            priority
          />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-[#0D1C2F]">
          {student.name}
        </h2>
        <p className="text-[11px] font-mono font-bold text-[#45474C] uppercase tracking-wider mt-0.5">
          ID Matrícula: {student.id}
        </p>
        <div className="mt-3 px-3 py-1 rounded-full bg-[#EFF4FF] text-[#0D1C2F] font-bold text-xs inline-flex items-center gap-1.5 border border-[#D5E3FD]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#FD761A]" />
          <span>{student.statusLabel}</span>
        </div>
      </div>

      {/* Menú de Navegación del Estudiante */}
      <nav className="bg-white p-2 rounded-2xl shadow-xs border border-stone-200/80 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                item.isActive
                  ? "bg-[#E6EEFF] text-[#0D1C2F] shadow-2xs"
                  : "text-[#45474C] hover:text-[#0D1C2F] hover:bg-stone-50"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  item.isActive ? "text-[#FD761A]" : "text-stone-400"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {item.isActive && (
                <span className="w-2 h-2 rounded-full bg-[#FD761A]" />
              )}
              {item.badge && !item.isActive && (
                <span className="px-2 py-0.5 rounded-full bg-[#EFF4FF] border border-[#D5E3FD] text-[11px] font-bold text-[#0D1C2F]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Widget de Asistencia Directa / Tutoría Técnica */}
      <div className="bg-[#151B2A] p-5 rounded-2xl text-white shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-[#FD761A]" />
          <h3 className="font-bold text-sm text-white">Tutoría Técnica</h3>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed">
          ¿Tienes dudas con los laboratorios o requisitos de certificación?
        </p>
        <a
          className="w-full inline-flex justify-center items-center gap-2 bg-white text-[#0D1C2F] hover:bg-stone-100 px-3.5 py-2 rounded-xl font-bold text-xs transition-colors shadow-xs"
          href={`mailto:soporte@certifox.edu?subject=Consulta%20T%C3%A9cnica%20Estudiante%20${student.id}`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#FD761A]" />
          <span>Contactar instructor</span>
        </a>
      </div>
    </aside>
  );
}
