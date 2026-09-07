import Link from "next/link";
import Image from "next/image";
import { Clock, QrCode, Star, Lock, ArrowRight } from "lucide-react";
import { Course } from "../types";
import { cn } from "@/lib/utils";

interface CourseCatalogCardProps {
  course: Course;
  viewMode?: "grid" | "list";
}

export function CourseCatalogCard({
  course,
  viewMode = "grid",
}: CourseCatalogCardProps) {
  const isList = viewMode === "list";

  return (
    <article
      className={cn(
        "group bg-white rounded-xl shadow-xs overflow-hidden border border-stone-200/80 transition-all hover:shadow-md hover:-translate-y-0.5 flex",
        isList ? "flex-col sm:flex-row justify-between" : "flex-col justify-between"
      )}
    >
      <div className={cn(isList && "flex flex-col sm:flex-row flex-1")}>
        {/* Cover Image */}
        <div
          className={cn(
            "relative w-full overflow-hidden bg-stone-100 shrink-0",
            isList ? "h-48 sm:h-auto sm:w-64" : "h-48"
          )}
        >
          <Image
            src={course.imageUrl}
            alt={course.imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Overlays */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <span className="bg-white/95 backdrop-blur-xs text-stone-900 text-xs font-semibold px-2 py-0.5 rounded-full shadow-xs">
              {course.category}
            </span>
          </div>

          <div className="absolute top-2 right-2">
            <span className="bg-[#151B2A]/85 backdrop-blur-xs text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Clock className="w-3 h-3" />
              <span>{course.hours} hrs</span>
            </span>
          </div>

          {course.hasQrCertificate && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-white text-[#FD761A] text-xs px-2 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-xs">
                <QrCode className="w-3 h-3" />
                <span>Certificado QR incluido</span>
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#FD761A] block mb-1">
              Cód. {course.code}
            </span>

            <h2 className="text-sm sm:text-base font-bold text-stone-900 leading-snug group-hover:text-[#FD761A] transition-colors line-clamp-2">
              <Link href={`/cursos/${course.slug}`}>{course.title}</Link>
            </h2>

            {isList && course.shortDescription && (
              <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                {course.shortDescription}
              </p>
            )}
          </div>

          {/* Instructor and Rating */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-stone-200">
                <Image
                  src={course.instructor.avatarUrl}
                  alt={course.instructor.name}
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-medium text-stone-700 truncate">
                {course.instructor.name}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#FD761A] text-[#FD761A]" />
              <span className="text-xs font-bold text-stone-900 font-mono">
                {course.rating.toFixed(1)}
              </span>
              <span className="text-[11px] text-stone-400 font-mono">
                ({course.reviewsCount})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Strip & CTA */}
      <div
        className={cn(
          "p-4 sm:p-5 pt-0 flex flex-col gap-2 mt-auto",
          isList && "sm:w-60 sm:p-5 sm:border-l sm:border-stone-100 sm:justify-center shrink-0"
        )}
      >
        <div className="flex items-center justify-between bg-[#EFF4FF] px-3 py-1.5 rounded-lg border border-[#D5E3FD]/40">
          <span className="text-xs text-stone-600 flex items-center gap-1">
            <Lock className="w-3 h-3 text-stone-400" />
            <span className="text-[11px]">Requiere confirmación</span>
          </span>
          <div className="text-right">
            <span className="text-sm font-extrabold text-stone-900 font-mono">
              ${course.priceUsd}{" "}
              <span className="text-[10px] text-stone-500 font-normal">USD</span>
            </span>
          </div>
        </div>

        <Link
          href={`/cursos/${course.slug}`}
          className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[#151B2A] text-white hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <span>Ver programa</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
