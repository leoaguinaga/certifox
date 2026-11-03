"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  Download,
  AlertTriangle,
  Lock,
  Loader2,
  X,
  FileCheck,
  ShieldAlert,
  Search,
} from "lucide-react";
import {
  StudentCertificateItem,
  EligibleEnrollmentItem,
} from "../types";
import {
  issueCertificateAction,
  revokeCertificateAction,
} from "../actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CertificatesManagementViewProps {
  role: "STUDENT" | "INSTRUCTOR";
  studentCertificates: StudentCertificateItem[];
  eligibleEnrollments: EligibleEnrollmentItem[];
}

export function CertificatesManagementView({
  role,
  studentCertificates: initialCertificates,
  eligibleEnrollments: initialEnrollments,
}: CertificatesManagementViewProps) {
  const [studentCertificates] = useState(initialCertificates);
  const [eligibleEnrollments, setEligibleEnrollments] = useState(initialEnrollments);
  const [isPending, startTransition] = useTransition();

  // Instructor modals
  const [revokeModalItem, setRevokeModalItem] = useState<{ code: string; studentName: string } | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [instructorTab, setInstructorTab] = useState<"pending" | "issued">("pending");
  const [searchFilter, setSearchFilter] = useState("");

  const handleIssueCertificate = (enrollmentId: string, studentName: string) => {
    startTransition(async () => {
      const res = await issueCertificateAction(enrollmentId);
      if (!res.success) {
        toast.error(res.error || "Error al emitir certificado");
      } else {
        toast.success(
          `¡Certificado ${res.data?.code} emitido con éxito para ${studentName}!`
        );
        setEligibleEnrollments((prev) =>
          prev.map((e) =>
            e.enrollmentId === enrollmentId
              ? {
                  ...e,
                  certificateCode: res.data?.code || null,
                  certificateStatus: "VALID",
                }
              : e
          )
        );
      }
    });
  };

  const handleConfirmRevocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeModalItem) return;

    if (revokeReason.trim().length < 8) {
      toast.error("El motivo de revocación debe tener al menos 8 caracteres");
      return;
    }

    startTransition(async () => {
      const res = await revokeCertificateAction({
        code: revokeModalItem.code,
        reason: revokeReason.trim(),
      });

      if (!res.success) {
        toast.error(res.error || "Error al revocar certificado");
      } else {
        toast.success(`Certificado ${revokeModalItem.code} revocado oficialmente`);
        setEligibleEnrollments((prev) =>
          prev.map((e) =>
            e.certificateCode === revokeModalItem.code
              ? { ...e, certificateStatus: "REVOKED" }
              : e
          )
        );
        setRevokeModalItem(null);
        setRevokeReason("");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#FD761A]" />
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              {role === "STUDENT"
                ? "Mis Certificados y Credenciales Oficiales"
                : "Emisión y Auditoría de Certificados"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {role === "STUDENT"
              ? "Documentos con firma criptográfica SHA-256 y código QR auditables conforme a la Ley 27269."
              : "Generación de diplomas oficiales en PDF con alta entropía y gestión de revocaciones en AuditLog."}
          </p>
        </div>
      </div>

      {/* 1. Vista de Estudiante */}
      {role === "STUDENT" && (
        <div className="space-y-6">
          {studentCertificates.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-3 shadow-2xs">
              <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FD761A] flex items-center justify-center mx-auto">
                <Award className="size-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Aún no tienes certificados emitidos
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Completa el 100% de las lecciones de tus cursos y aprueba las tareas prácticas para que el docente emita tu diploma.
              </p>
              <div className="pt-2">
                <Link
                  href="/campus/cursos"
                  className="px-4 py-2 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Ir a Mis Cursos</span>
                </Link>
              </div>
            </div>
          ) : (
            studentCertificates.map((cert) => (
              <div
                key={cert.code}
                className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xs border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6 hover:shadow-md transition-shadow"
              >
                {/* Status bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5",
                        cert.status === "VALID"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-300"
                      )}
                    >
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          cert.status === "VALID" ? "bg-emerald-600" : "bg-red-600"
                        )}
                      />
                      <span>{cert.status === "VALID" ? "Oficial Vigente" : "Revocado"}</span>
                    </span>

                    <span className="px-3 py-1 rounded-full bg-[#EFF4FF] text-[#0D1C2F] dark:bg-stone-800 dark:text-white border border-[#D5E3FD] dark:border-stone-700 text-xs font-bold font-mono">
                      {cert.code}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Lock className="w-3.5 h-3.5 text-[#FD761A]" />
                    <span className="font-mono text-[11px] truncate max-w-xs">
                      SHA: {cert.sha256.slice(0, 16)}...
                    </span>
                  </div>
                </div>

                {/* Course & Student Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-8 space-y-3">
                    <span className="text-[11px] font-bold text-[#FD761A] uppercase tracking-wider block">
                      {cert.institution || "Certifox Academy"}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                      {cert.courseTitle}
                    </h2>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      Emitido para <strong className="text-stone-900 dark:text-white">{cert.studentName}</strong> • Doc. {cert.studentDocumentMasked} • Instructor: {cert.instructorName}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                      <span>Horas lectivas: <strong>{cert.hours} hrs</strong></span>
                      <span>•</span>
                      <span>
                        Fecha de expedición:{" "}
                        <strong>{new Date(cert.issuedAt).toLocaleDateString("es-PE")}</strong>
                      </span>
                    </div>

                    {cert.status === "REVOKED" && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                        <strong>Motivo de revocación oficial:</strong> {cert.revocationReason}
                      </div>
                    )}
                  </div>

                  {/* Actions (AC-16: Ver y Descargar PDF) */}
                  <div className="lg:col-span-4 flex flex-col gap-2.5">
                    <a
                      href={`/api/certificados/${cert.code}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-11 px-4 rounded-xl bg-[#FD761A] hover:bg-[#e05d04] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-2xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar PDF Oficial</span>
                    </a>

                    <Link
                      href={`/verificar/${cert.code}`}
                      className="w-full h-10 px-4 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#FD761A]" />
                      <span>Auditar en Verificador Público</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Vista de Docente (Emisión y Revocación) */}
      {role === "INSTRUCTOR" && (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInstructorTab("pending")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer",
                  instructorTab === "pending"
                    ? "bg-[#151B2A] text-white"
                    : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
                )}
              >
                <span>Por emitir ({eligibleEnrollments.filter((e) => !e.certificateCode).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setInstructorTab("issued")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer",
                  instructorTab === "issued"
                    ? "bg-[#151B2A] text-white"
                    : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
                )}
              >
                <span>Emitidos & Revocaciones ({eligibleEnrollments.filter((e) => e.certificateCode).length})</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por alumno o curso..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-900 text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-[#FD761A] w-60"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-[11px] font-bold text-stone-500 uppercase tracking-wider h-10">
                    <th className="px-4 py-2">Estudiante</th>
                    <th className="px-4 py-2">Curso Aprobado</th>
                    <th className="px-4 py-2">Fecha Finalización</th>
                    <th className="px-4 py-2">Certificado</th>
                    <th className="px-4 py-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                  {eligibleEnrollments
                    .filter((item) =>
                      instructorTab === "pending"
                        ? !item.certificateCode
                        : Boolean(item.certificateCode)
                    )
                    .filter(
                      (item) =>
                        item.studentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        item.courseTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        (item.certificateCode &&
                          item.certificateCode.toLowerCase().includes(searchFilter.toLowerCase()))
                    )
                    .map((item) => (
                      <tr
                        key={item.enrollmentId}
                        className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors h-14"
                      >
                        <td className="px-4 py-2">
                          <div className="font-bold text-stone-900 dark:text-white">
                            {item.studentName}
                          </div>
                          <div className="text-[11px] text-stone-500 font-mono">
                            {item.studentDocumentMasked} • {item.studentEmail}
                          </div>
                        </td>

                        <td className="px-4 py-2 max-w-xs truncate font-medium text-stone-800 dark:text-stone-200">
                          {item.courseTitle}
                        </td>

                        <td className="px-4 py-2 text-stone-500 text-[11px]">
                          {item.completedAt ? new Date(item.completedAt).toLocaleDateString("es-PE") : "Completado"}
                        </td>

                        <td className="px-4 py-2">
                          {item.certificateCode ? (
                            <div className="space-y-1">
                              <span className="font-mono font-bold text-[#FD761A] block">
                                {item.certificateCode}
                              </span>
                              <span
                                className={cn(
                                  "text-[10px] font-bold px-2 py-0.5 rounded-full inline-block",
                                  item.certificateStatus === "VALID"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                                )}
                              >
                                {item.certificateStatus === "VALID" ? "Válido" : "Revocado"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-600 font-medium inline-flex items-center gap-1">
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Listo para emisión</span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-2 text-right">
                          {!item.certificateCode ? (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                handleIssueCertificate(item.enrollmentId, item.studentName)
                              }
                              className="px-3.5 py-1.5 rounded-lg bg-[#FD761A] hover:bg-[#e05d04] text-white font-bold text-xs transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Emitir certificado</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`/api/certificados/${item.certificateCode}/pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 dark:text-stone-300 font-bold text-[11px] inline-flex items-center gap-1"
                                title="Ver PDF con QR"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </a>

                              {item.certificateStatus === "VALID" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRevokeModalItem({
                                      code: item.certificateCode!,
                                      studentName: item.studentName,
                                    })
                                  }
                                  className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Revocar por auditoría"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  <span>Revocar</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Reforzada de Revocación (AC-17) */}
      {revokeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Revocar Certificado Oficial
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRevokeModalItem(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 space-y-1">
              <p>
                Estás a punto de revocar el certificado <strong>{revokeModalItem.code}</strong> de{" "}
                <strong>{revokeModalItem.studentName}</strong>.
              </p>
              <p className="text-[11px] text-red-600 dark:text-red-400">
                Esta acción impactará inmediatamente la verificación pública con QR y quedará registrada en AuditLog.
              </p>
            </div>

            <form onSubmit={handleConfirmRevocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Motivo de Revocación Obligatorio (AC-17)
                </label>
                <textarea
                  required
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Ej. Recertificación anual vencida, falta técnica grave o documento anulado por auditoría..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevokeModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Revocando...</span>
                    </>
                  ) : (
                    <span>Confirmar Revocación</span>
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
