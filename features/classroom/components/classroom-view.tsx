"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  PlayCircle,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileCheck,
  Award,
  Layers,
  Clock,
  Loader2,
} from "lucide-react";
import { ClassroomData, ClassroomLesson } from "../types";
import { toggleLessonProgressAction } from "@/features/classroom/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ClassroomViewProps {
  initialData: ClassroomData;
}

export function ClassroomView({ initialData }: ClassroomViewProps) {
  const [data, setData] = useState<ClassroomData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Flatten lessons in order
  const allLessons: ClassroomLesson[] = data.modules.flatMap((m) => m.lessons);

  // Default to first non-completed lesson, or first lesson
  const [selectedLessonId, setSelectedLessonId] = useState<string>(() => {
    const firstPending = allLessons.find((l) => !l.isCompleted);
    return firstPending ? firstPending.id : allLessons[0]?.id || "";
  });

  const currentLessonIndex = allLessons.findIndex((l) => l.id === selectedLessonId);
  const currentLesson = allLessons[currentLessonIndex] || allLessons[0];
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  // Find module of current lesson
  const currentModule = data.modules.find((m) =>
    m.lessons.some((l) => l.id === currentLesson?.id)
  );

  const handleToggleComplete = () => {
    if (!currentLesson) return;
    const newCompleted = !currentLesson.isCompleted;

    startTransition(async () => {
      // Optimistic update
      setData((prev) => {
        const updatedModules = prev.modules.map((mod) => ({
          ...mod,
          lessons: mod.lessons.map((les) =>
            les.id === currentLesson.id ? { ...les, isCompleted: newCompleted } : les
          ),
        }));
        const newCompletedCount = updatedModules
          .flatMap((m) => m.lessons)
          .filter((l) => l.isCompleted).length;
        const newPercent =
          prev.totalLessons > 0
            ? Math.round((newCompletedCount / prev.totalLessons) * 100)
            : 0;

        return {
          ...prev,
          modules: updatedModules,
          completedLessonsCount: newCompletedCount,
          progressPercent: newPercent,
        };
      });

      const res = await toggleLessonProgressAction({
        courseSlug: data.course.slug,
        lessonId: currentLesson.id,
        completed: newCompleted,
      });

      if (!res.success) {
        toast.error(res.error || "No se pudo actualizar el progreso");
        // Revertir
        setData(initialData);
      } else {
        if (newCompleted) {
          toast.success("¡Lección completada!");
          if (res.data?.courseJustCompleted) {
            toast.success("🎉 ¡Felicidades! Has completado el programa formativo.");
          }
        }
      }
    });
  };

  // Convert regular YouTube URL to embed URL if needed
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "www.youtube.com/embed/");
    }
    return url;
  };

  const embedUrl = currentLesson ? getEmbedUrl(currentLesson.videoUrl) : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FC] dark:bg-stone-950 pb-16">
      {/* Top Bar / Breadcrumb & Progress */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-16 z-20 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/campus/cursos"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
              title="Volver a mis cursos"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#FD761A] truncate block">
                {data.course.category} • Aula Virtual
              </span>
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-stone-900 dark:text-white truncate">
                {data.course.title}
              </h1>
            </div>
          </div>

          {/* Progress Indicator & Mobile Drawer Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  Progreso del curso:
                </span>
                <span className="text-xs font-black text-stone-900 dark:text-white font-mono">
                  {data.progressPercent}%
                </span>
              </div>
              <div className="w-32 sm:w-40 h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-[#FD761A] transition-all duration-300"
                  style={{ width: `${data.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Mobile Drawer Trigger (RNF-08: Usable desde 360 px) */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden px-3 py-1.5 rounded-lg bg-orange-50 text-[#FD761A] dark:bg-orange-950/60 dark:text-orange-400 font-bold text-xs flex items-center gap-1.5 border border-orange-200 dark:border-orange-900/60 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>
                Temario ({data.completedLessonsCount}/{data.totalLessons})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Classroom Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Player & Active Lesson Info (8 Cols on LG) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Video Player Card */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-md border border-stone-800 relative aspect-video flex items-center justify-center">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={currentLesson?.title || "Reproductor de clase"}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="size-16 rounded-2xl bg-stone-900 border border-stone-800 text-[#FD761A] flex items-center justify-center mx-auto">
                  <PlayCircle className="size-8" />
                </div>
                <h3 className="text-white font-bold text-sm sm:text-base">
                  {currentLesson?.title || "Selecciona una lección"}
                </h3>
                <p className="text-stone-400 text-xs max-w-sm mx-auto">
                  Esta sesión técnica incluye material práctico y evaluación en vivo con el docente.
                </p>
              </div>
            )}
          </div>

          {/* Lesson Details & Actions Bar */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {currentModule?.title || "Módulo formativo"}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                  {currentLesson?.title}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {currentLesson?.durationMin || 30} min
                  </span>
                  <span>•</span>
                  <span>Docente: {data.course.instructorName}</span>
                </div>
              </div>

              {/* Action: Marcar como completada */}
              <button
                type="button"
                onClick={handleToggleComplete}
                disabled={isPending}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0",
                  currentLesson?.isCompleted
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                    : "bg-[#FD761A] hover:bg-[#e05d04] text-white"
                )}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : currentLesson?.isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Completada ✓</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    <span>Marcar como completada</span>
                  </>
                )}
              </button>
            </div>

            {/* Bottom Controls: Prev / Next */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <button
                type="button"
                disabled={!prevLesson}
                onClick={() => prevLesson && setSelectedLessonId(prevLesson.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Lección anterior</span>
              </button>

              <button
                type="button"
                disabled={!nextLesson}
                onClick={() => nextLesson && setSelectedLessonId(nextLesson.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Siguiente lección</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assessment & Certification Banner */}
          {data.assessments.length > 0 && (
            <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent dark:from-orange-950/40 rounded-2xl p-5 border border-orange-200/80 dark:border-orange-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#FD761A] flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                    Evaluación práctica del programa
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    {data.assessments[0].title} (Nota mínima aprobatoria:{" "}
                    {data.assessments[0].passingScore}/20)
                  </p>
                </div>
              </div>
              <Link
                href="/campus/tareas"
                className="px-3.5 py-2 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] text-white text-xs font-bold transition-colors shadow-2xs shrink-0 inline-flex items-center gap-1.5"
              >
                <span>Ver o entregar tarea</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {data.enrollmentStatus === "COMPLETED" && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center shrink-0">
                  <Award className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    ¡Programa Oficial Completado!
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-0.5">
                    Has completado las lecciones y aprobado las evaluaciones técnicas requeridas.
                  </p>
                </div>
              </div>
              <Link
                href="/campus/certificados"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs shrink-0 inline-flex items-center gap-1.5"
              >
                <span>Ver mis certificados</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Desktop Syllabus / Lessons List (4 Cols on LG) */}
        <aside className="hidden lg:flex lg:col-span-4 flex-col bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs overflow-hidden sticky top-36">
          <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/60 dark:bg-stone-800/40">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Temario del Curso
              </h3>
              <p className="text-xs font-semibold text-stone-900 dark:text-white mt-0.5">
                {data.completedLessonsCount} de {data.totalLessons} lecciones ({data.progressPercent}%)
              </p>
            </div>
            <span className="size-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#FD761A] flex items-center justify-center text-xs font-bold">
              <Layers className="size-4" />
            </span>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-[calc(100vh-280px)] overflow-y-auto">
            {data.modules.map((module, mIdx) => (
              <div key={module.id} className="p-3">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 block mb-1">
                  Módulo {mIdx + 1}: {module.title}
                </span>

                <div className="space-y-1">
                  {module.lessons.map((lesson) => {
                    const isCurrent = lesson.id === selectedLessonId;
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer",
                          isCurrent
                            ? "bg-orange-50 dark:bg-orange-950/50 text-[#FD761A] font-bold border border-orange-200 dark:border-orange-900/60 shadow-2xs"
                            : "hover:bg-stone-50 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300"
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {lesson.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : isCurrent ? (
                            <PlayCircle className="w-4 h-4 text-[#FD761A]" />
                          ) : (
                            <Circle className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-xs leading-snug line-clamp-2",
                              lesson.isCompleted && !isCurrent && "line-through text-stone-400"
                            )}
                          >
                            {lesson.title}
                          </p>
                          <span className="text-[10px] text-stone-400 mt-0.5 block">
                            {lesson.durationMin} min
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Mobile Drawer (RNF-08: Usable desde 360 px) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  Temario del Programa
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {data.completedLessonsCount} de {data.totalLessons} lecciones completadas
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 p-3">
              {data.modules.map((module, mIdx) => (
                <div key={module.id} className="py-2">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 block mb-1">
                    Módulo {mIdx + 1}: {module.title}
                  </span>
                  <div className="space-y-1">
                    {module.lessons.map((lesson) => {
                      const isCurrent = lesson.id === selectedLessonId;
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => {
                            setSelectedLessonId(lesson.id);
                            setIsMobileDrawerOpen(false);
                          }}
                          className={cn(
                            "w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer",
                            isCurrent
                              ? "bg-orange-50 dark:bg-orange-950/50 text-[#FD761A] font-bold border border-orange-200 dark:border-orange-900/60"
                              : "hover:bg-stone-50 text-stone-700 dark:text-stone-300"
                          )}
                        >
                          <div className="mt-0.5 shrink-0">
                            {lesson.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : isCurrent ? (
                              <PlayCircle className="w-4 h-4 text-[#FD761A]" />
                            ) : (
                              <Circle className="w-4 h-4 text-stone-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs leading-snug">{lesson.title}</p>
                            <span className="text-[10px] text-stone-400 mt-0.5 block">
                              {lesson.durationMin} min
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
