import Link from "next/link";
import Image from "next/image";
import { User, Clock, BookOpen, ShieldCheck } from "lucide-react";
import { Course } from "../types";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="flex flex-col bg-white rounded-xl shadow-xs border border-stone-200/80 overflow-hidden group hover:shadow-md transition-shadow">
      {/* Thumbnail with overlay badge */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        <Image
          src={course.imageUrl}
          alt={course.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.hasVerifiableCertificate && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#D1FAE5] text-[#065F46] text-xs font-semibold flex items-center gap-1 shadow-xs border border-[#A7F3D0]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Certificado verificable</span>
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-1 justify-between gap-6">
        <div>
          {/* Instructor */}
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <span>{course.instructorName}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-stone-900 leading-snug mb-3 group-hover:text-[#FD761A] transition-colors">
            <Link href={`/cursos/${course.slug}`}>{course.title}</Link>
          </h3>

          {/* Metrics */}
          <div className="flex items-center gap-4 text-stone-500 text-xs font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {course.hours} hrs
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-stone-400" />
              {course.lessonsCount} lecciones
            </span>
          </div>
        </div>

        {/* Investment and Action */}
        <div className="pt-4 flex items-center justify-between bg-[#EFF4FF]/70 p-3.5 rounded-lg border border-[#D5E3FD]/50">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
              Inversión
            </span>
            <span className="text-lg font-extrabold text-stone-900 font-mono">
              {course.priceUsd} USD
            </span>
          </div>
          <Link
            href={`/cursos/${course.slug}`}
            className="px-4 py-2 rounded-lg bg-[#151B2A] text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
          >
            Ver Detalles
          </Link>
        </div>
      </div>
    </article>
  );
}
