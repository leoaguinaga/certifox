export type AccessStatus = "GRANTED" | "PENDING_PAYMENT" | "NOT_ENROLLED" | "INSTRUCTOR_PREVIEW";

export interface ClassroomLesson {
  id: string;
  title: string;
  order: number;
  videoUrl: string | null;
  durationMin: number;
  moduleId: string;
  isCompleted: boolean;
}

export interface ClassroomModule {
  id: string;
  title: string;
  order: number;
  lessons: ClassroomLesson[];
}

export interface ClassroomAssessment {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  submission: {
    id: string;
    contentUrlOrText: string;
    score: number | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    feedback: string | null;
    submittedAt: string;
    gradedAt: string | null;
  } | null;
}

export interface ClassroomData {
  course: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    category: string;
    level: string;
    hours: number;
    instructorName: string;
    institution: string | null;
  };
  accessStatus: AccessStatus;
  enrollmentId?: string;
  enrollmentStatus?: "PENDING" | "ACTIVE" | "COMPLETED";
  modules: ClassroomModule[];
  totalLessons: number;
  completedLessonsCount: number;
  progressPercent: number;
  assessments: ClassroomAssessment[];
}
