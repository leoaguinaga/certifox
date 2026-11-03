"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  UserCheck,
  Loader2,
  X,
} from "lucide-react";
import { confirmPaymentAction } from "@/features/catalog/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface EnrollmentItem {
  id: string;
  studentName: string;
  studentEmail: string;
  documentMasked: string;
  courseId: string;
  courseTitle: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED";
  createdAt: string;
  activatedAt: string | null;
  completedAt: string | null;
  hasCertificate: boolean;
  certificateCode: string | null;
}

interface InstructorStudentsViewProps {
  initialEnrollments: EnrollmentItem[];
  instructorName: string;
}

export function InstructorStudentsView({
  initialEnrollments,
  instructorName,
}: InstructorStudentsViewProps) {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentItem | null>(null);
  const [confirmNote, setConfirmNote] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  // Filtros
  const filteredEnrollments = enrollments.filter((enr) => {
    const matchesSearch =
      enr.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enr.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enr.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || enr.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Métricas
  const totalStudents = enrollments.length;
  const pendingCount = enrollments.filter((e) => e.status === "PENDING").length;
  const activeCount = enrollments.filter((e) => e.status === "ACTIVE").length;
  const completedCount = enrollments.filter((e) => e.status === "COMPLETED").length;

  const handleOpenConfirmModal = (enrollment: EnrollmentItem) => {
    setSelectedEnrollment(enrollment);
    setConfirmNote("Abono verificado vía Yape / Transferencia bancaria");
  };

  const handleConfirmPayment = async () => {
    if (!selectedEnrollment) return;
    setIsConfirming(true);

    try {
      const result = await confirmPaymentAction({
        enrollmentId: selectedEnrollment.id,
        note: confirmNote,
      });

      if (!result.success) {
        toast.error(result.error || "No se pudo confirmar el pago");
        setIsConfirming(false);
        return;
      }

      toast.success("Pago confirmado y matrícula activada con éxito");

      // Actualizar estado local
      setEnrollments((prev) =>
        prev.map((item) =>
          item.id === selectedEnrollment.id
            ? { ...item, status: "ACTIVE", activatedAt: new Date().toISOString() }
            : item
        )
      );

      setSelectedEnrollment(null);
    } catch {
      toast.error("Error al procesar la confirmación");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
            Gestión de Alumnos y Matrículas
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Revisa solicitudes pendientes, confirma pagos manuales y supervisa las cohortes asignadas.
          </p>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
          <p className="text-xs font-semibold text-stone-500">Total Solicitudes</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
            {totalStudents}
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-2xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Por Confirmar</p>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
            {pendingCount}
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
          <p className="text-xs font-semibold text-stone-500">En Curso (Activos)</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {activeCount}
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
          <p className="text-xs font-semibold text-stone-500">Completados</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {completedCount}
          </p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por alumno, correo o curso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FD761A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400" />
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-1 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer",
                statusFilter === "ALL"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              )}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer",
                statusFilter === "PENDING"
                  ? "bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              )}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ACTIVE")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer",
                statusFilter === "ACTIVE"
                  ? "bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              )}
            >
              Activos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("COMPLETED")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer",
                statusFilter === "COMPLETED"
                  ? "bg-white dark:bg-stone-900 text-blue-700 dark:text-blue-400 shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              )}
            >
              Completados
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Matrículas */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-[11px] font-bold text-stone-500 uppercase tracking-wider h-10">
                <th className="px-4 py-2">Estudiante</th>
                <th className="px-4 py-2">Documento</th>
                <th className="px-4 py-2">Curso</th>
                <th className="px-4 py-2">Fecha Registro</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400">
                    No se encontraron matrículas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enr) => (
                  <tr
                    key={enr.id}
                    className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors h-12"
                  >
                    <td className="px-4 py-2 font-medium text-stone-900 dark:text-white">
                      <div>
                        <p className="font-bold">{enr.studentName}</p>
                        <p className="text-[11px] text-stone-500 font-normal">
                          {enr.studentEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-2 font-mono text-stone-600 dark:text-stone-400 text-[11px]">
                      {enr.documentMasked}
                    </td>
                    <td className="px-4 py-2 text-stone-800 dark:text-stone-200 max-w-xs truncate">
                      {enr.courseTitle}
                    </td>
                    <td className="px-4 py-2 text-stone-500 text-[11px]">
                      {new Date(enr.createdAt).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-4 py-2">
                      {enr.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Pendiente</span>
                        </span>
                      )}
                      {enr.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>Pago confirmado</span>
                        </span>
                      )}
                      {enr.status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completado</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {enr.status === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => handleOpenConfirmModal(enr)}
                          className="px-3 py-1.5 rounded-lg bg-[#FD761A] hover:bg-[#e05d04] text-white font-bold text-[11px] transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Confirmar pago</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400 font-medium">
                          Habilitado
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmación de Pago (AC-12 / R6 / RF-06) */}
      {selectedEnrollment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => !isConfirming && setSelectedEnrollment(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 border border-stone-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FD761A] flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 leading-tight">
                    Confirmación de Pago y Matrícula
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Activará el aula virtual para el alumno
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isConfirming}
                onClick={() => setSelectedEnrollment(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="flex justify-between">
                <span className="text-stone-500">Alumno:</span>
                <span className="font-bold text-stone-900">
                  {selectedEnrollment.studentName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Correo:</span>
                <span className="font-mono text-stone-700">
                  {selectedEnrollment.studentEmail}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Curso:</span>
                <span className="font-semibold text-stone-900 text-right truncate max-w-[200px]">
                  {selectedEnrollment.courseTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Responsable:</span>
                <span className="font-medium text-stone-900">{instructorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Fecha de confirmación:</span>
                <span className="text-stone-900 font-mono">
                  {new Date().toLocaleDateString("es-PE")} {new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmNote" className="text-xs font-semibold text-stone-700">
                Nota de auditoría (opcional)
              </label>
              <input
                id="confirmNote"
                type="text"
                value={confirmNote}
                onChange={(e) => setConfirmNote(e.target.value)}
                placeholder="Ej. Transferencia BCP verificada en banca móvil"
                className="w-full h-9 px-3 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#FD761A]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isConfirming}
                onClick={() => setSelectedEnrollment(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isConfirming}
                onClick={handleConfirmPayment}
                className="px-4 py-2 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] disabled:opacity-60 text-white text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Activando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Habilitar Acceso al Aula</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
