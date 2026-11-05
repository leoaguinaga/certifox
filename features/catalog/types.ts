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
  category: string;
  level: string;
  hours: number;
  lessonsCount: number;
  /** Precio en unidades de la moneda (no céntimos). 0 = gratuito. */
  price: number;
  currency: string;
  rating?: number;
  reviewsCount?: number;
  organizationName?: string;
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

export interface PaymentInstructions {
  organizationName: string;
  amount: number;
  currency: string;
  yape?: { number: string; holder: string };
  plin?: { number: string; holder: string };
  bankAccounts: { bank: string; accountNumber: string; cci?: string; holder: string }[];
  instructions?: string;
  whatsappUrl: string | null;
}

export interface EnrollmentRequestResult {
  enrollmentId: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED";
  courseTitle: string;
  instructions: PaymentInstructions | null;
}
