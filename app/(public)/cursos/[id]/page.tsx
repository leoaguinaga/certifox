import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseDetailBySlugOrId } from "@/server/services/course.service";
import { CourseDetailHero } from "@/features/catalog/components/course-detail-hero";
import { CourseCompetencies } from "@/features/catalog/components/course-competencies";
import { CourseCurriculumAccordion } from "@/features/catalog/components/course-curriculum-accordion";
import { CoursePrerequisites } from "@/features/catalog/components/course-prerequisites";
import { CourseInstructorProfile } from "@/features/catalog/components/course-instructor-profile";
import { CourseDetailFaq } from "@/features/catalog/components/course-detail-faq";
import { StickyEnrollmentCard } from "@/features/catalog/components/sticky-enrollment-card";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseDetailBySlugOrId(id);

  if (!course) {
    return {
      title: "Curso no encontrado — Certifox",
    };
  }

  return {
    title: `${course.title} — Certifox`,
    description: course.shortDescription || course.fullDescription,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const course = await getCourseDetailBySlugOrId(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f8f9ff]">
      {/* Hero Header with Institutional Backdrop */}
      <CourseDetailHero course={course} />

      {/* Main Split Layout: Left Content (8 cols) + Right Sticky Card (4 cols) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column */}
          <main className="lg:col-span-8 flex flex-col gap-8">
            <CourseCompetencies competencies={course.competencies} />
            <CourseCurriculumAccordion curriculum={course.curriculum} />
            <CoursePrerequisites prerequisites={course.prerequisites} />
            <CourseInstructorProfile instructor={course.instructor} />
            <CourseDetailFaq faqs={course.faqs} />
          </main>

          {/* Right Column: Sticky Card */}
          <StickyEnrollmentCard course={course} />
        </div>
      </div>
    </div>
  );
}
