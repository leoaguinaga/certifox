"use client";

import { useCampusRole } from "@/features/campus/context/campus-role-context";
import { FileCheck } from "lucide-react";

export default function CampusTareasPage() {
  const { role } = useCampusRole();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
            {role === "student" ? "Tareas & Rúbricas Prácticas" : "Calificaciones & Rúbricas"}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {role === "student"
              ? "Entrega de informes técnicos, resolución de casos y revisión de retroalimentación."
              : "Bandeja de corrección de entregas con rúbrica estandarizada y firma de notas."}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-3">
        <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FD761A] flex items-center justify-center mx-auto">
          <FileCheck className="size-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900 dark:text-white">
          {role === "student" ? "Entregas en Curso" : "Bandeja de Calificación Docente"}
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
          {role === "student"
            ? "1 entrega pendiente: Informe Técnico Práctico 3.1 (Vence en 3 días)."
            : "6 evaluaciones pendientes de revisión en la cohorte actual."}
        </p>
      </div>
    </div>
  );
}
