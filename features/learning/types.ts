export interface StudentProfile {
  id: string; // e.g. "CFX-88219"
  name: string;
  avatar: string;
  email: string;
  role: string;
  statusLabel: string;
  documentType: string;
  documentNumberMasked: string;
  company?: string;
  streakDays: number;
  totalHours: number;
  totalCertificates: number;
}

export type CourseEnrollmentStatus = "in_progress" | "pending_confirmation" | "completed";

export interface EnrolledCourse {
  id: string;
  code: string;
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  instructorName: string;
  school: string;
  image: string;
  status: CourseEnrollmentStatus;
  statusLabel: string;
  progressPercentage: number;
  lessonsCompleted: number;
  totalLessons: number;
  nextLessonTitle?: string;
  lastAccess?: string;
  isPriority?: boolean;
  score?: number;
  completedDate?: string;
  certificateCode?: string;
  accreditationNorm?: string;
  pendingNotice?: string;
  submissionTimeAgo?: string;
}

export interface StudentTicket {
  id: string;
  subject: string;
  status: "open" | "answered" | "closed";
  statusLabel: string;
  updatedAt: string;
}
