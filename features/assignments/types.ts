export interface StudentAssignmentItem {
  id: string; // Assessment ID
  title: string;
  description: string | null;
  passingScore: number;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  enrollmentId: string;
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

export interface InstructorSubmissionItem {
  id: string; // Submission ID
  assessmentId: string;
  assessmentTitle: string;
  courseId: string;
  courseTitle: string;
  passingScore: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDocumentMasked: string;
  contentUrlOrText: string;
  score: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  feedback: string | null;
  submittedAt: string;
  gradedAt: string | null;
}
