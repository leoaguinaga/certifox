"use client";

import { Award } from "lucide-react";
import { useCampusRole } from "@/features/campus/context/campus-role-context";
import { CertificatesCollectionView } from "@/features/learning/components/certificates-collection-view";

export default function CampusCertificadosPage() {
  const { role } = useCampusRole();

  if (role === "student") {
    return <CertificatesCollectionView />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
            Emisión y Auditoría de Certificados
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Emisión de diplomas oficiales con huella SHA-256 y gestión de revocaciones con registro de auditoría.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-3">
        <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FD761A] flex items-center justify-center mx-auto">
          <Award className="size-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900 dark:text-white">
          Bandeja de Certificación Docente
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
          Emite certificados para matrículas completadas o revoca credenciales observadas con trazabilidad en AuditLog.
        </p>
      </div>
    </div>
  );
}
