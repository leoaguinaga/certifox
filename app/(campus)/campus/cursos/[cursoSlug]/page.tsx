import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/server/auth";
import { getClassroomData } from "@/server/services/classroom.service";
import { ClassroomView } from "@/features/classroom/components/classroom-view";
import { Clock, ArrowLeft, MessageCircle, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    cursoSlug: string;
  }>;
}

export default async function CampusClassroomPage({ params }: PageProps) {
  const { cursoSlug } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/ingresar?from=/campus/cursos/${cursoSlug}`);
  }

  const classroomData = await getClassroomData(session, cursoSlug);

  if (!classroomData) {
    notFound();
  }

  // AC-11: Matrícula pendiente no permite reproducir lecciones
  if (classroomData.accessStatus === "PENDING_PAYMENT") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 shadow-sm text-center space-y-6">
          <div className="size-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="size-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800/60">
              Pago Pendiente de Confirmación
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              {classroomData.course.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
              Tu solicitud de matrícula ha sido registrada. Por seguridad y normativa técnica, el aula
              virtual se habilitará de forma automática en cuanto el docente o centro acreditador confirme tu abono.
            </p>
          </div>

          {/* Banner de contacto WhatsApp */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-left flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-700 dark:text-stone-300">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
                ¿Ya realizaste tu transferencia o pago Yape/Plin?
              </span>
              <span>
                Comunícate por WhatsApp con el docente o envía tu constancia de pago para agilizar la activación de tus credenciales.
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/campus/cursos"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Mis Cursos</span>
            </Link>

            <a
              href={`https://wa.me/51987654321?text=${encodeURIComponent(
                `Hola, acabo de matricularme en ${classroomData.course.title} y quiero coordinar la validación de mi pago.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Coordinar activación por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Usuario no matriculado
  if (classroomData.accessStatus === "NOT_ENROLLED") {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 shadow-sm space-y-4">
          <div className="size-16 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#FD761A] flex items-center justify-center mx-auto">
            <BookOpen className="size-8" />
          </div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-white">
            Aún no estás matriculado en este programa
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Para acceder a las lecciones, evaluaciones y certificación oficial de{" "}
            <strong>{classroomData.course.title}</strong>, primero debes solicitar tu matrícula.
          </p>
          <div className="pt-2">
            <Link
              href={`/cursos/${cursoSlug}`}
              className="px-5 py-2.5 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] text-white text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <span>Ver ficha del curso y matricularme</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Acceso concedido (ACTIVE / COMPLETED / INSTRUCTOR_PREVIEW)
  return <ClassroomView initialData={classroomData} />;
}
