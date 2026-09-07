"use client";

import Link from "next/link";
import {
  Award,
  ShieldCheck,
  Share2,
  Lock,
  Printer,
  FileCheck,
} from "lucide-react";
import { getAllCertificates } from "@/data/certificados";

export function CertificatesCollectionView() {
  const studentCertificates = getAllCertificates().filter(
    (c) => c.code === "CFX-2025-9831"
  );

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShare = (certCode: string, courseTitle: string) => {
    const url = `${window.location.origin}/verificar/${certCode}`;
    if (navigator.share) {
      navigator.share({ title: courseTitle, text: `Credencial oficial verificada en Certifox: ${courseTitle}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert("Enlace oficial de verificación copiado al portapapeles.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-[#FD761A]" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1C2F] tracking-tight">
            Mis Certificados y Credenciales
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#45474C] mt-1">
          Documentos acreditados con firma digital conforme a la Ley de Firmas y Certificados Digitales y estándar ISO/IEC 17024.
        </p>
      </div>

      {/* Certificates Grid */}
      <div className="space-y-6">
        {studentCertificates.map((cert) => (
          <div
            key={cert.code}
            className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 sm:p-8 space-y-6"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>{cert.statusLabel}</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-[#EFF4FF] text-[#0D1C2F] border border-[#D5E3FD] text-xs font-bold font-mono">
                  {cert.code}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#45474C]">
                <Lock className="w-3.5 h-3.5 text-[#FD761A]" />
                <span className="font-mono">Ledger ID: {cert.cryptography.ledgerId}</span>
              </div>
            </div>

            {/* Middle Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <span className="text-[11px] font-bold text-[#9D4300] uppercase tracking-wider block">
                  {cert.course.issuingEntity}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0D1C2F]">
                  {cert.course.title}
                </h2>
                <p className="text-xs text-[#45474C] leading-relaxed">
                  Emitido para <strong className="text-[#0D1C2F]">{cert.student.name}</strong> • Doc. {cert.student.documentMasked} • Calificación obtenida: <strong className="text-emerald-700">{cert.evaluation.finalGrade}/{cert.evaluation.maxGrade} ({cert.evaluation.gradeScale})</strong>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#45474C] pt-1">
                  <span>Horas cronológicas: <strong>{cert.evaluation.hours} hrs</strong></span>
                  <span>•</span>
                  <span>Fecha de expedición: <strong>{cert.evaluation.issueDate}</strong></span>
                  <span>•</span>
                  <span>Vigencia: <strong>{cert.evaluation.validity}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="lg:col-span-4 flex flex-col gap-2.5">
                <Link
                  href={`/verificar/${cert.code}`}
                  className="w-full h-11 px-4 rounded-xl bg-[#FD761A] hover:bg-[#E05E09] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Auditar en Verificador Oficial</span>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="h-10 px-3 rounded-xl bg-white hover:bg-stone-50 text-[#0D1C2F] font-bold text-xs border border-stone-200 inline-flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-500" />
                    <span>Imprimir Acta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(cert.code, cert.course.title)}
                    className="h-10 px-3 rounded-xl bg-white hover:bg-stone-50 text-[#0D1C2F] font-bold text-xs border border-stone-200 inline-flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#FD761A]" />
                    <span>Compartir</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cryptographic hash bar */}
            <div className="p-3 bg-[#F8F9FF] rounded-xl border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#45474C]">
              <span className="font-mono">
                SHA-256: {cert.cryptography.sha256}
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                Sello AATL Activo
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
