"use client";

import { useState, useTransition } from "react";
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Send,
  Award,
  Loader2,
  X,
} from "lucide-react";
import {
  StudentAssignmentItem,
  InstructorSubmissionItem,
} from "../types";
import {
  submitAssignmentAction,
  gradeAssignmentAction,
} from "@/features/assignments/actions";
import { toast } from "sonner";

interface AssignmentsViewProps {
  role: "STUDENT" | "INSTRUCTOR";
  studentAssignments: StudentAssignmentItem[];
  instructorSubmissions: InstructorSubmissionItem[];
}

export function AssignmentsView({
  role,
  studentAssignments: initialStudentAssignments,
  instructorSubmissions: initialInstructorSubmissions,
}: AssignmentsViewProps) {
  const [studentAssignments, setStudentAssignments] = useState(initialStudentAssignments);
  const [instructorSubmissions, setInstructorSubmissions] = useState(initialInstructorSubmissions);
  const [isPending, startTransition] = useTransition();

  // Student submission modal state
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignmentItem | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");

  // Instructor grading modal state
  const [selectedSubmission, setSelectedSubmission] = useState<InstructorSubmissionItem | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(16);
  const [gradeFeedback, setGradeFeedback] = useState("");

  const handleOpenStudentModal = (item: StudentAssignmentItem) => {
    setSelectedAssignment(item);
    setSubmissionContent(item.submission?.contentUrlOrText || "");
  };

  const handleOpenInstructorModal = (sub: InstructorSubmissionItem) => {
    setSelectedSubmission(sub);
    setGradeScore(sub.score ?? sub.passingScore);
    setGradeFeedback(sub.feedback || "");
  };

  // Submit action by student
  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    if (submissionContent.trim().length < 5) {
      toast.error("El contenido debe tener al menos 5 caracteres");
      return;
    }

    startTransition(async () => {
      const res = await submitAssignmentAction({
        enrollmentId: selectedAssignment.enrollmentId,
        assessmentId: selectedAssignment.id,
        contentUrlOrText: submissionContent.trim(),
      });

      if (!res.success) {
        toast.error(res.error || "Error al enviar la entrega");
      } else {
        toast.success("¡Tarea enviada con éxito para revisión!");
        setStudentAssignments((prev) =>
          prev.map((a) =>
            a.id === selectedAssignment.id
              ? {
                  ...a,
                  submission: {
                    id: res.data?.submissionId || "temp",
                    contentUrlOrText: submissionContent.trim(),
                    score: null,
                    status: "PENDING",
                    feedback: null,
                    submittedAt: new Date().toISOString(),
                    gradedAt: null,
                  },
                }
              : a
          )
        );
        setSelectedAssignment(null);
      }
    });
  };

  // Grade action by instructor (AC-14)
  const handleGradeSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    if (gradeScore < 0 || gradeScore > 20 || isNaN(gradeScore)) {
      toast.error("La nota debe estar en la escala de 0 a 20");
      return;
    }

    startTransition(async () => {
      const res = await gradeAssignmentAction({
        submissionId: selectedSubmission.id,
        score: Number(gradeScore),
        feedback: gradeFeedback,
      });

      if (!res.success) {
        toast.error(res.error || "Error al registrar la calificación");
      } else {
        toast.success(
          `Entrega calificada con nota ${gradeScore}/20 (${
            gradeScore >= selectedSubmission.passingScore ? "Aprobada" : "Desaprobada"
          })`
        );
        if (res.data?.courseJustCompleted) {
          toast.success("🎯 ¡El estudiante ha completado el 100% de los requisitos del curso!");
        }

        setInstructorSubmissions((prev) =>
          prev.map((sub) =>
            sub.id === selectedSubmission.id
              ? {
                  ...sub,
                  score: Number(gradeScore),
                  feedback: gradeFeedback,
                  status: gradeScore >= selectedSubmission.passingScore ? "APPROVED" : "REJECTED",
                  gradedAt: new Date().toISOString(),
                }
              : sub
          )
        );
        setSelectedSubmission(null);
      }
    });
  };

  const isUrl = (text: string) => {
    return text.startsWith("http://") || text.startsWith("https://");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
            {role === "STUDENT" ? "Tareas & Rúbricas Prácticas" : "Bandeja de Calificación Docente"}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {role === "STUDENT"
              ? "Entrega de informes técnicos, checklists operativos y proyectos de fin de módulo."
              : "Revisión de informes técnicos, asignación de notas (0-20) y retroalimentación pedagógica."}
          </p>
        </div>
      </div>

      {/* 1. Vista de Estudiante */}
      {role === "STUDENT" && (
        <div className="space-y-4">
          {studentAssignments.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-3 shadow-2xs">
              <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FD761A] flex items-center justify-center mx-auto">
                <FileCheck className="size-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                No tienes evaluaciones prácticas pendientes
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Asegúrate de estar matriculado en cursos activos para ver las rúbricas y proyectos requeridos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentAssignments.map((item) => {
                const sub = item.submission;
                const isPendingReview = sub && sub.status === "PENDING";
                const isApproved = sub && sub.status === "APPROVED";
                const isRejected = sub && sub.status === "REJECTED";

                return (
                  <article
                    key={item.id}
                    className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 flex flex-col justify-between shadow-2xs space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FD761A] bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded">
                          {item.courseTitle}
                        </span>

                        {/* Status Badge */}
                        {!sub && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>Sin entregar</span>
                          </span>
                        )}
                        {isPendingReview && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300">
                            <Clock className="w-3 h-3" />
                            <span>En revisión</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aprobado • {sub.score}/20</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300">
                            <XCircle className="w-3 h-3" />
                            <span>Observado • {sub.score}/20</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white leading-snug">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-stone-500 line-clamp-3">
                          {item.description}
                        </p>
                      )}

                      {/* Submitted preview */}
                      {sub && (
                        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700 text-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase text-stone-400 block">
                            Tu entrega enviada:
                          </span>
                          {isUrl(sub.contentUrlOrText) ? (
                            <a
                              href={sub.contentUrlOrText}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#FD761A] hover:underline font-mono inline-flex items-center gap-1 break-all"
                            >
                              <span>{sub.contentUrlOrText}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <p className="text-stone-700 dark:text-stone-300 font-mono text-[11px] break-all line-clamp-2">
                              {sub.contentUrlOrText}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Instructor feedback */}
                      {sub?.feedback && (
                        <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 block">
                            Comentarios del Docente:
                          </span>
                          <p className="text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
                            {sub.feedback}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      <span className="text-[11px] text-stone-400">
                        Nota mínima: <strong>{item.passingScore}/20</strong>
                      </span>

                      {!isApproved ? (
                        <button
                          type="button"
                          onClick={() => handleOpenStudentModal(item)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#FD761A] hover:bg-[#e05d04] text-white font-bold text-xs transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{sub ? "Editar entrega" : "Entregar tarea"}</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          <span>Acreditación válida</span>
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Vista de Docente (Calificación) */}
      {role === "INSTRUCTOR" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-[11px] font-bold text-stone-500 uppercase tracking-wider h-10">
                    <th className="px-4 py-2">Estudiante</th>
                    <th className="px-4 py-2">Curso / Tarea</th>
                    <th className="px-4 py-2">Entrega</th>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Nota / Estado</th>
                    <th className="px-4 py-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                  {instructorSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-stone-400">
                        No hay entregas registradas por los alumnos en tus cursos.
                      </td>
                    </tr>
                  ) : (
                    instructorSubmissions.map((sub) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors h-14"
                      >
                        <td className="px-4 py-2">
                          <div className="font-bold text-stone-900 dark:text-white">
                            {sub.studentName}
                          </div>
                          <div className="text-[11px] text-stone-500 font-mono">
                            {sub.studentDocumentMasked} • {sub.studentEmail}
                          </div>
                        </td>

                        <td className="px-4 py-2 max-w-xs">
                          <div className="font-bold text-stone-800 dark:text-stone-200 truncate">
                            {sub.courseTitle}
                          </div>
                          <div className="text-[11px] text-stone-500 truncate">
                            {sub.assessmentTitle}
                          </div>
                        </td>

                        <td className="px-4 py-2 max-w-xs">
                          {isUrl(sub.contentUrlOrText) ? (
                            <a
                              href={sub.contentUrlOrText}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#FD761A] hover:underline font-mono text-[11px] inline-flex items-center gap-1 truncate"
                            >
                              <span>{sub.contentUrlOrText}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <p className="text-stone-700 dark:text-stone-300 font-mono text-[11px] line-clamp-1">
                              {sub.contentUrlOrText}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-2 text-stone-500 text-[11px]">
                          {new Date(sub.submittedAt).toLocaleDateString("es-PE")}
                        </td>

                        <td className="px-4 py-2">
                          {sub.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                              <Clock className="w-3 h-3" />
                              <span>Pendiente</span>
                            </span>
                          )}
                          {sub.status === "APPROVED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Aprobado • {sub.score}/20</span>
                            </span>
                          )}
                          {sub.status === "REJECTED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">
                              <XCircle className="w-3 h-3" />
                              <span>Observado • {sub.score}/20</span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenInstructorModal(sub)}
                            className="px-3 py-1.5 rounded-lg bg-[#FD761A] hover:bg-[#e05d04] text-white font-bold text-[11px] transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{sub.status === "PENDING" ? "Calificar" : "Editar nota"}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Entrega del Estudiante */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Entregar Tarea Práctica
                </h3>
                <p className="text-xs text-stone-500">{selectedAssignment.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Enlace público o respuesta escrita (GitHub, Drive, Notion, o descripción técnica)
                </label>
                <textarea
                  required
                  rows={4}
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Pega aquí el enlace a tu informe en Google Drive/GitHub o describe detalladamente tu solución técnica..."
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-[#FD761A] focus:border-transparent outline-none shadow-2xs"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Nota mínima aprobatoria: <strong>{selectedAssignment.passingScore}/20</strong>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] disabled:opacity-60 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar entrega</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Calificación del Instructor */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Calificar Entrega Técnica
                </h3>
                <p className="text-xs text-stone-500">
                  Estudiante: {selectedSubmission.studentName} ({selectedSubmission.studentDocumentMasked})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido entregado por el alumno */}
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">
                Contenido entregado por el estudiante:
              </span>
              {isUrl(selectedSubmission.contentUrlOrText) ? (
                <a
                  href={selectedSubmission.contentUrlOrText}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FD761A] hover:underline font-mono text-xs inline-flex items-center gap-1 break-all"
                >
                  <span>{selectedSubmission.contentUrlOrText}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              ) : (
                <p className="text-stone-800 dark:text-stone-200 font-mono text-xs break-all max-h-32 overflow-y-auto">
                  {selectedSubmission.contentUrlOrText}
                </p>
              )}
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Calificación (Escala vigesimal 0 - 20)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    required
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-28 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm font-bold text-stone-900 dark:text-white focus:ring-2 focus:ring-[#FD761A] outline-none"
                  />
                  <span className="text-xs text-stone-500">
                    Nota mínima de aprobación: <strong>{selectedSubmission.passingScore}/20</strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Retroalimentación / Comentarios pedagógicos
                </label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Detalla los puntos fuertes o aspectos por corregir observados en la entrega técnica..."
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#FD761A] outline-none shadow-2xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200/60 text-[11px] text-stone-600 dark:text-stone-300">
                <strong>Criterio AC-14:</strong> Si la nota asignada es ≥ {selectedSubmission.passingScore} y el estudiante completó todas las lecciones del curso, su matrícula se marcará automáticamente como <strong>COMPLETADA</strong>, habilitando su certificado.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] disabled:opacity-60 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar calificación</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
