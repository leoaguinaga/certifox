export interface CourseInstructor {
  name: string;
  role: string;
  avatarUrl: string;
  cipNumber?: string;
  bio?: string;
  accreditedStudents?: number;
  rating?: number;
}

export interface Competency {
  title: string;
  description: string;
}

export interface Lesson {
  title: string;
  duration?: string;
  type: "video" | "quiz" | "assignment" | "exam";
  meta?: string;
}

export interface CurriculumModule {
  moduleNumber: string;
  title: string;
  summary: string;
  hours: number;
  lessons: Lesson[];
}

export interface Prerequisite {
  iconName: "badge" | "engineering" | "devices";
  title: string;
  description: string;
}

export interface CourseFaq {
  question: string;
  answer: string;
}

export interface Course {
  id: string;
  code: string;
  slug: string;
  title: string;
  shortDescription?: string;
  fullDescription?: string;
  category: "Seguridad y Minería" | "Maquinaria" | "Electricidad" | "Gestión e ISO";
  level: "Principiante" | "Intermedio" | "Avanzado";
  hours: number;
  lessonsCount: number;
  priceUsd: number;
  rating: number;
  reviewsCount: number;
  accessNote?: string;
  hasVerifiableCertificate: boolean;
  hasQrCertificate: boolean;
  imageUrl: string;
  imageAlt: string;
  backdropUrl?: string;
  instructorName: string;
  instructor: CourseInstructor;
  competencies?: Competency[];
  curriculum?: CurriculumModule[];
  prerequisites?: Prerequisite[];
  faqs?: CourseFaq[];
  includes?: string[];
}
