import { LucideIcon } from "lucide-react";

export type CampusRole = "student" | "teacher";

export interface CampusUserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: CampusRole;
  roleLabel: string;
  institution?: string;
  streakDays?: number;
  accreditedHours?: number;
  totalHoursTarget?: number;
  pendingReviewsCount?: number;
}

export interface CampusNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number | null;
  badgeVariant?: "default" | "warning" | "pulse";
  roles: CampusRole[];
}

export const MOCK_STUDENT_USER: CampusUserProfile = {
  id: "CFX-88219",
  name: "Brunella E.",
  email: "brunella.e@empresa.com",
  avatar:
    "/images/avatars/student.svg",
  role: "student",
  roleLabel: "Estudiante Certificada",
  institution: "Consorcio Minero del Sur",
  streakDays: 5,
  accreditedHours: 42,
  totalHoursTarget: 60,
};

export const MOCK_TEACHER_USER: CampusUserProfile = {
  id: "DOC-4012",
  name: "Ing. Marco Viteri",
  email: "marco.viteri@certifox.edu",
  avatar:
    "/images/avatars/instructor.svg",
  role: "teacher",
  roleLabel: "Docente Homologado",
  institution: "Escuela de Maquinaria y Minas",
  pendingReviewsCount: 6,
};

