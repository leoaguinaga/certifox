import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  FileCheck,
  MessageSquare,
  Users,
} from "lucide-react";
import { CampusNavItem } from "./types";

export const CAMPUS_NAV_ITEMS: CampusNavItem[] = [
  // Dashboard (Shared root)
  {
    label: "Inicio",
    href: "/campus",
    icon: LayoutDashboard,
    roles: ["student"],
  },
  {
    label: "Inicio / Panel Docente",
    href: "/campus",
    icon: LayoutDashboard,
    roles: ["teacher"],
  },

  // Courses
  {
    label: "Cursos",
    href: "/campus/cursos",
    icon: GraduationCap,
    badge: 3,
    badgeVariant: "default",
    roles: ["student"],
  },
  {
    label: "Cursos Asignados",
    href: "/campus/cursos",
    icon: BookOpen,
    badge: 4,
    badgeVariant: "default",
    roles: ["teacher"],
  },

  // Calendar
  {
    label: "Calendario",
    href: "/campus/calendario",
    icon: Calendar,
    badge: "Hoy",
    badgeVariant: "pulse",
    roles: ["student", "teacher"],
  },

  // Certificados (Student collection & Teacher issuance/revocation)
  {
    label: "Certificados",
    href: "/campus/certificados",
    icon: Award,
    roles: ["student", "teacher"],
  },

  // Assignments / Rubrics
  {
    label: "Tareas",
    href: "/campus/tareas",
    icon: FileCheck,
    badge: 1,
    badgeVariant: "warning",
    roles: ["student"],
  },
  {
    label: "Calificaciones & Rúbricas",
    href: "/campus/tareas",
    icon: FileCheck,
    badge: 6,
    badgeVariant: "warning",
    roles: ["teacher"],
  },

  // Teacher specific: Students list
  {
    label: "Alumnos & Cohortes",
    href: "/campus/estudiantes",
    icon: Users,
    badge: "84",
    badgeVariant: "default",
    roles: ["teacher"],
  },

  // Community
  {
    label: "Foros",
    href: "/campus/comunidad",
    icon: MessageSquare,
    badge: 2,
    badgeVariant: "default",
    roles: ["student", "teacher"],
  },
];
