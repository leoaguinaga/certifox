import { StudentProfile, EnrolledCourse, StudentTicket } from "@/features/learning/types";

export const mockStudent: StudentProfile = {
  id: "CFX-88219",
  name: "Alejandro Morales",
  email: "alejandro.morales@empresa.com",
  avatar: "/images/avatars/student.svg",
  role: "Estudiante",
  statusLabel: "Estudiante Acreditado",
  documentType: "DNI",
  documentNumberMasked: "47***891",
  company: "Consorcio Minero del Sur",
  streakDays: 5,
  totalHours: 18.5,
  totalCertificates: 1,
};

export const mockEnrolledCourses: EnrolledCourse[] = [
  {
    id: "enrolled-1",
    code: "OP-601",
    slug: "seguridad-operativa-maquinaria-pesada",
    title: "Seguridad Operativa en Maquinaria Pesada",
    category: "Maquinaria y Minería",
    categoryLabel: "Acreditación Técnica Pesada",
    instructorName: "Ing. Roberto Mendoza",
    school: "Escuela de Maquinaria y Minas",
    image: "/images/courses/course-haccp.svg",
    status: "in_progress",
    statusLabel: "En curso • 65%",
    progressPercentage: 65,
    lessonsCompleted: 8,
    totalLessons: 12,
    nextLessonTitle: "Módulo 3: Práctica de inspección pre-arranque",
    lastAccess: "Ayer",
    isPriority: true,
  },
  {
    id: "enrolled-2",
    code: "IND-5402",
    slug: "mantenimiento-predictivo-industrial",
    title: "Mantenimiento Predictivo Industrial",
    category: "Mantenimiento & Confiabilidad",
    categoryLabel: "Mantenimiento & Confiabilidad",
    instructorName: "Ing. Roberto Mendoza",
    school: "Escuela de Maquinaria y Minas",
    image: "/images/courses/course-bpm.svg",
    status: "pending_confirmation",
    statusLabel: "Pendiente de confirmación",
    progressPercentage: 0,
    lessonsCompleted: 0,
    totalLessons: 10,
    pendingNotice: "El docente habilitará tus lecciones tras validar tu comprobante de pago.",
    submissionTimeAgo: "Enviado hace 3 horas",
  },
  {
    id: "enrolled-3",
    code: "IND-105",
    slug: "metrologia-y-calibracion-dimensional",
    title: "Metrología y Calibración Dimensional",
    category: "Calidad y Metrología",
    categoryLabel: "Calidad y Metrología",
    instructorName: "Dra. Elena Vargas",
    school: "Instituto Tecnológico de Ensayos",
    image: "/images/courses/course-iso9001.svg",
    status: "completed",
    statusLabel: "Aprobado • Calificación 98/100",
    progressPercentage: 100,
    lessonsCompleted: 10,
    totalLessons: 10,
    score: 98,
    completedDate: "14 Feb 2025",
    certificateCode: "CFX-2025-9831",
    accreditationNorm:
      "Acreditado por Certifox Academy en conformidad con la norma técnica de verificación ISO/IEC 17025.",
  },
];

export const mockTickets: StudentTicket[] = [
  {
    id: "TCK-1092",
    subject: "Acceso a material descargable del Módulo 2",
    status: "answered",
    statusLabel: "Respondido por instructor",
    updatedAt: "Hace 2 horas",
  },
  {
    id: "TCK-1044",
    subject: "Homologación de DNI para emisión de certificado oficial",
    status: "closed",
    statusLabel: "Resuelto con firma digital",
    updatedAt: "14 Feb 2025",
  },
];

export function getStudentProfile(): StudentProfile {
  return mockStudent;
}

export function getEnrolledCourses(): EnrolledCourse[] {
  return mockEnrolledCourses;
}

export function getActiveCourses(): EnrolledCourse[] {
  return mockEnrolledCourses.filter(
    (c) => c.status === "in_progress" || c.status === "pending_confirmation"
  );
}

export function getPriorityCourse(): EnrolledCourse | undefined {
  return mockEnrolledCourses.find((c) => c.isPriority && c.status === "in_progress");
}

export function getCompletedCourses(): EnrolledCourse[] {
  return mockEnrolledCourses.filter((c) => c.status === "completed");
}
