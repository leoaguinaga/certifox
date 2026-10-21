import { getSession } from "@/server/auth";
import { forbidden } from "next/navigation";
import { Users } from "lucide-react";

export default async function CampusEstudiantesPage() {
  const session = await getSession();

  // AC-09: Un estudiante recibe 403 en /campus/estudiantes
  if (!session || session.user.role !== "INSTRUCTOR") {
    forbidden();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
            Alumnos & Cohortes Asignadas
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Directorio de estudiantes matriculados, registro de asistencia y seguimiento de rendimiento técnico.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-3">
        <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FD761A] flex items-center justify-center mx-auto">
          <Users className="size-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900 dark:text-white">
          Directorio Académico
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
          Panel de gestión exclusivo para docentes. Aquí podrás revisar el progreso de tus alumnos y confirmar pagos.
        </p>
      </div>
    </div>
  );
}
