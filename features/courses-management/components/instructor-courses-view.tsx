"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Plus,
  BookOpen,
  Eye,
  EyeOff,
  Users,
  Layers,
  Clock,
  X,
  Loader2,
  Trash2,
  Video,
} from "lucide-react";
import {
  createCourseAction,
  togglePublishCourseAction,
  addModuleAction,
  addLessonAction,
  deleteLessonAction,
} from "@/features/courses-management/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface InstructorCourseItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  level: string;
  hours: number;
  summary: string | null;
  coverUrl: string | null;
  published: boolean;
  modules: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      order: number;
      durationMin: number;
      videoUrl: string | null;
    }[];
  }[];
  activeStudentsCount: number;
}

interface InstructorCoursesViewProps {
  initialCourses: InstructorCourseItem[];
}

export function InstructorCoursesView({ initialCourses }: InstructorCoursesViewProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [isPending, startTransition] = useTransition();

  // Create course modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Maquinaria Pesada");
  const [newLevel, setNewLevel] = useState("Intermedio");
  const [newHours, setNewHours] = useState(40);
  const [newSummary, setNewSummary] = useState("");
  const [newCoverUrl] = useState("");
  const [newPublished, setNewPublished] = useState(true);

  // Edit syllabus modal state
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] =
    useState<InstructorCourseItem | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState(30);
  const [newLessonVideo, setNewLessonVideo] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

  // Handle Toggle Publish (AC-18)
  const handleTogglePublish = (courseId: string) => {
    startTransition(async () => {
      const res = await togglePublishCourseAction(courseId);
      if (!res.success) {
        toast.error(res.error || "Error al actualizar publicación");
      } else {
        const isNowPublished = res.data?.published;
        toast.success(
          isNowPublished
            ? "¡Curso publicado! Ya está visible en el catálogo público."
            : "Curso despublicado. Ahora está en modo borrador privado."
        );
        setCourses((prev) =>
          prev.map((c) => (c.id === courseId ? { ...c, published: Boolean(isNowPublished) } : c))
        );
      }
    });
  };

  // Handle Create Course (AC-18)
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim().length < 5) {
      toast.error("El título debe tener al menos 5 caracteres");
      return;
    }

    startTransition(async () => {
      const res = await createCourseAction({
        title: newTitle.trim(),
        category: newCategory,
        level: newLevel,
        hours: Number(newHours),
        summary: newSummary.trim() || undefined,
        coverUrl: newCoverUrl.trim() || undefined,
        published: newPublished,
      });

      if (!res.success) {
        toast.error(res.error || "Error al crear curso");
      } else {
        toast.success("¡Curso creado con éxito!");
        const created = res.data;
        if (created) {
          const raw = created as unknown as InstructorCourseItem;
          setCourses((prev) => [
            {
              id: raw.id,
              slug: raw.slug,
              title: raw.title,
              category: raw.category,
              level: raw.level,
              hours: raw.hours,
              summary: raw.summary,
              coverUrl: raw.coverUrl,
              published: raw.published,
              modules: raw.modules || [],
              activeStudentsCount: 0,
            },
            ...prev,
          ]);
        }
        setIsCreateModalOpen(false);
        setNewTitle("");
        setNewSummary("");
      }
    });
  };

  // Add Module
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForSyllabus || !newModuleTitle.trim()) return;

    startTransition(async () => {
      const res = await addModuleAction(selectedCourseForSyllabus.id, newModuleTitle.trim());
      if (!res.success) {
        toast.error(res.error || "Error al agregar módulo");
      } else {
        toast.success("Módulo agregado");
        const mod = res.data;
        if (mod) {
          const updatedCourse = {
            ...selectedCourseForSyllabus,
            modules: [
              ...selectedCourseForSyllabus.modules,
              { id: mod.id, title: mod.title, order: mod.order, lessons: [] },
            ],
          };
          setSelectedCourseForSyllabus(updatedCourse);
          setCourses((prev) =>
            prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
          );
        }
        setNewModuleTitle("");
      }
    });
  };

  // Add Lesson
  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForSyllabus || !selectedModuleForLesson || !newLessonTitle.trim()) return;

    startTransition(async () => {
      const res = await addLessonAction(selectedModuleForLesson, {
        title: newLessonTitle.trim(),
        durationMin: Number(newLessonDuration),
        videoUrl: newLessonVideo.trim() || undefined,
      });

      if (!res.success) {
        toast.error(res.error || "Error al agregar lección");
      } else {
        toast.success("Lección agregada");
        const lesson = res.data;
        if (lesson) {
          const updatedCourse = {
            ...selectedCourseForSyllabus,
            modules: selectedCourseForSyllabus.modules.map((m) =>
              m.id === selectedModuleForLesson
                ? {
                    ...m,
                    lessons: [
                      ...m.lessons,
                      {
                        id: lesson.id,
                        title: lesson.title,
                        order: lesson.order,
                        durationMin: lesson.durationMin,
                        videoUrl: lesson.videoUrl,
                      },
                    ],
                  }
                : m
            ),
          };
          setSelectedCourseForSyllabus(updatedCourse);
          setCourses((prev) =>
            prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
          );
        }
        setNewLessonTitle("");
        setSelectedModuleForLesson(null);
      }
    });
  };

  // Delete Lesson
  const handleDeleteLesson = (lessonId: string) => {
    if (!selectedCourseForSyllabus) return;

    startTransition(async () => {
      const res = await deleteLessonAction(lessonId);
      if (!res.success) {
        toast.error(res.error || "Error al eliminar lección");
      } else {
        toast.success("Lección eliminada");
        const updatedCourse = {
          ...selectedCourseForSyllabus,
          modules: selectedCourseForSyllabus.modules.map((m) => ({
            ...m,
            lessons: m.lessons.filter((l) => l.id !== lessonId),
          })),
        };
        setSelectedCourseForSyllabus(updatedCourse);
        setCourses((prev) =>
          prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
            Cursos Asignados al Docente
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Crea nuevos programas, administra módulos con video-lecciones y controla su visibilidad en el catálogo.
          </p>
        </div>

        {/* Action: Crear nuevo curso */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] text-white font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Crear nuevo curso</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => {
          const totalLessons = course.modules.flatMap((m) => m.lessons).length;

          return (
            <article
              key={course.id}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#FD761A] bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded">
                    {course.category}
                  </span>

                  {/* Publish Status Badge */}
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1",
                      course.published
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-stone-100 text-stone-600 border border-stone-200 dark:bg-stone-800 dark:text-stone-400"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        course.published ? "bg-emerald-500" : "bg-stone-400"
                      )}
                    />
                    <span>{course.published ? "Publicado en Catálogo" : "Borrador Privado"}</span>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                  {course.title}
                </h3>

                <p className="text-xs text-stone-500 line-clamp-2">
                  {course.summary || "Sin resumen registrado."}
                </p>

                <div className="flex items-center gap-4 text-xs text-stone-600 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-stone-400" />
                    <strong>{course.modules.length}</strong> módulos
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <strong>{totalLessons}</strong> lecciones ({course.hours}h)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <strong>{course.activeStudentsCount}</strong> alumnos
                  </span>
                </div>
              </div>

              {/* Bottom Actions Strip */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Toggle publish button (AC-18) */}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleTogglePublish(course.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50",
                      course.published
                        ? "bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                  >
                    {course.published ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Despublicar</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Publicar en catálogo</span>
                      </>
                    )}
                  </button>

                  {/* Edit Syllabus */}
                  <button
                    type="button"
                    onClick={() => setSelectedCourseForSyllabus(course)}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Editar temario</span>
                  </button>
                </div>

                <Link
                  href={`/campus/cursos/${course.slug}`}
                  className="text-xs font-bold text-[#FD761A] hover:underline"
                >
                  Vista previa del aula →
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* 1. Modal: Crear Nuevo Curso */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Crear Nuevo Curso Técnico
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Título oficial del curso
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Operación y Mantenimiento de Retroexcavadoras 420F"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FD761A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FD761A]"
                  >
                    <option value="Maquinaria Pesada">Maquinaria Pesada</option>
                    <option value="Seguridad Industrial">Seguridad Industrial</option>
                    <option value="Minería">Minería</option>
                    <option value="Electricidad">Electricidad</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Nivel
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FD761A]"
                  >
                    <option value="Básico">Básico</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Horas académicas
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newHours}
                  onChange={(e) => setNewHours(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FD761A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Resumen descriptivo
                </label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Detalla los objetivos de acreditación y competencias adquiridas..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FD761A]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pub-check"
                  checked={newPublished}
                  onChange={(e) => setNewPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FD761A] accent-[#FD761A]"
                />
                <label htmlFor="pub-check" className="text-xs text-stone-700 dark:text-stone-300">
                  Publicar inmediatamente en el catálogo oficial
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] disabled:opacity-60 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <span>Crear curso</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Editor de Temario (Módulos y Lecciones) */}
      {selectedCourseForSyllabus && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 shrink-0">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Editor de Temario
                </h3>
                <p className="text-xs text-stone-500">{selectedCourseForSyllabus.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourseForSyllabus(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of modules & lessons */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {selectedCourseForSyllabus.modules.map((mod, idx) => (
                <div
                  key={mod.id}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      Módulo {idx + 1}: {mod.title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSelectedModuleForLesson(mod.id)}
                      className="px-2.5 py-1 rounded-md bg-[#FD761A] text-white font-bold text-[11px] inline-flex items-center gap-1 hover:bg-[#e05d04] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agregar lección</span>
                    </button>
                  </div>

                  {/* Lessons list */}
                  <div className="space-y-1.5">
                    {mod.lessons.map((les) => (
                      <div
                        key={les.id}
                        className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Video className="w-4 h-4 text-[#FD761A] shrink-0" />
                          <span className="font-medium text-stone-900 dark:text-white truncate">
                            {les.title}
                          </span>
                          <span className="text-[10px] text-stone-400 shrink-0">
                            ({les.durationMin} min)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(les.id)}
                          className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Eliminar lección"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Form: Add Module */}
              <form onSubmit={handleAddModule} className="flex gap-2 pt-2">
                <input
                  type="text"
                  required
                  placeholder="Título del nuevo módulo (Ej. Módulo 2: Procedimientos de Mantenimiento)"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="flex-1 p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-[#FD761A]"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Módulo</span>
                </button>
              </form>
            </div>

            {/* Inner modal / box to add lesson */}
            {selectedModuleForLesson && (
              <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-950 dark:text-orange-200">
                    Nueva Lección para el módulo seleccionado
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedModuleForLesson(null)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddLesson} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Título de la lección"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      className="sm:col-span-2 p-2 rounded-lg border border-stone-300 text-xs bg-white text-stone-900 outline-none"
                    />
                    <input
                      type="number"
                      min={1}
                      required
                      placeholder="Minutos"
                      value={newLessonDuration}
                      onChange={(e) => setNewLessonDuration(Number(e.target.value))}
                      className="p-2 rounded-lg border border-stone-300 text-xs bg-white text-stone-900 outline-none"
                    />
                  </div>
                  <input
                    type="url"
                    placeholder="URL de Video (YouTube / Embed)"
                    value={newLessonVideo}
                    onChange={(e) => setNewLessonVideo(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 text-xs bg-white text-stone-900 outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedModuleForLesson(null)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-600"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-4 py-1.5 rounded-lg bg-[#FD761A] text-white font-bold text-xs"
                    >
                      Guardar lección
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
