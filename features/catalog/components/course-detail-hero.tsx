import { sanitizeMediaUrl } from '@/lib/image-utils';
import Image from "next/image";
import { ShieldCheck, Layers, Clock, QrCode } from "lucide-react";
import { Course } from "../types";

interface CourseDetailHeroProps {
  course: Course;
}

export function CourseDetailHero({ course }: CourseDetailHeroProps) {
  return (
    <div className="relative w-full overflow-hidden bg-[#f8f9ff]">
      {/* Ambient Radial Highlights */}
      <div className="absolute -top-32 -left-40 w-96 h-96 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 w-80 h-80 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        {/* <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-stone-500 font-medium"
        >
          <Link href="/cursos" className="hover:text-stone-900 transition-colors">
            Cursos
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          <Link
            href={`/cursos?categoria=${encodeURIComponent(course.category)}`}
            className="hover:text-stone-900 transition-colors"
          >
            {course.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          <span className="text-stone-900 font-semibold truncate">
            Detalle de Acreditación
          </span>
        </nav> */}
      </div>

      {/* Hero Banner Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="relative rounded-2xl overflow-hidden shadow-xl bg-[#151B2A] text-white">
          {/* Cover Backdrop with Gradient */}
          {course.backdropUrl && (
            <div className="absolute inset-0 overflow-hidden opacity-30">
              <Image
                src={course.backdropUrl}
                alt={course.title}
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#151B2A] via-[#151B2A]/90 to-transparent pointer-events-none" />

          {/* Foreground Hero Content */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-3xl flex flex-col gap-5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FD761A] text-white shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Acreditado 2025</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-xs">
                <Layers className="w-3.5 h-3.5 text-[#FD761A]" />
                <span>Nivel {course.level}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-xs">
                <Clock className="w-3.5 h-3.5 text-[#FD761A]" />
                <span>{course.hours} Horas lectivas</span>
              </span>

              {course.hasQrCertificate && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-xs">
                  <QrCode className="w-3.5 h-3.5 text-[#FD761A]" />
                  <span>Validación QR FoxID</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl lg:leading-tight text-white font-extrabold tracking-tight">
              {course.title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
              {course.fullDescription || course.shortDescription}
            </p>

            {/* Verified Lead Instructor Card */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-md shrink-0 ring-2 ring-white/20">
                <Image
                  src={sanitizeMediaUrl(course.instructor?.avatarUrl, "/images/avatars/instructor.svg")}
                  alt={course.instructor.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">
                    {course.instructor.name}
                  </span>
                  <span title="Instructor Verificado Certifox">
                    <ShieldCheck className="w-4 h-4 text-[#FD761A]" />
                  </span>
                </div>
                <span className="text-xs text-stone-300 line-clamp-1">
                  {course.instructor.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


