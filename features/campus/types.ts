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
    "https://lh3.googleusercontent.com/aida/AEtjO1XDKmxoiqT0ljJ8xryqy5hi5WHbmdXEIN_edrzSh40znqeGIpj28TOQfNS5xdtMHsjZXKbYvkATDlTWloAdtq61Quz-Im-demNx8jfjsDBWHdprYIcuoVkMdbNgw74zhqHgEgKsReTuVAJZMpkQj2sCaHOSm2uGBQuwA6cx4-uG07kcodrmLsHu4m_O1ITcpGl-ZcenWFJems_WcygbUYXycMiYUQIdL0V55bk6tQLf6mdFCGzlzlUnFQ",
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
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCr8Cs2V0mR2YyfQX3GFFe_I__XuoKazEOOB0dDj_GHmnarRiLXTM2dMSbcUlIRx18SHRYY8vmb8Rlh28NuFzlbwLBsJv-nSiNGSpJqHF-hKP8U2PEjbgP_PcXLY1iT8vHgrLttggjWYyol9yCopSi2Kjc5AYQDruFBp4bdxiJmyaoGr0e10Lr_IutdhhonCm-XO5ilVrwx0-2mCyvj6MCB4ouZYFripoUuKvi3VORbrhvrShG_vw2D",
  role: "teacher",
  roleLabel: "Docente Homologado",
  institution: "Escuela de Maquinaria y Minas",
  pendingReviewsCount: 6,
};
