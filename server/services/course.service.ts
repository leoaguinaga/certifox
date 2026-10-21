import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { Course, CurriculumModule, Prerequisite, CourseFaq } from "@/features/catalog/types";

export interface CatalogFilterOptions {
  category?: string;
  level?: string;
  search?: string;
}

/**
 * Obtiene los cursos publicados del catálogo desde Prisma con filtros por query string (RF-01).
 */
export async function getCatalogCourses(options: CatalogFilterOptions = {}) {
  const { category, level, search } = options;

  const whereClause: Prisma.CourseWhereInput = {
    published: true,
  };

  if (category && category !== "all" && category !== "Todos") {
    whereClause.category = {
      equals: category,
      mode: "insensitive",
    };
  }

  if (level && level !== "all" && level !== "Todos") {
    whereClause.level = {
      equals: level,
      mode: "insensitive",
    };
  }

  if (search && search.trim().length > 0) {
    const cleanSearch = search.trim();
    whereClause.OR = [
      { title: { contains: cleanSearch, mode: "insensitive" } },
      { summary: { contains: cleanSearch, mode: "insensitive" } },
      { category: { contains: cleanSearch, mode: "insensitive" } },
    ];
  }

  const courses = await db.course.findMany({
    where: whereClause,
    include: {
      instructor: true,
      modules: {
        include: {
          lessons: true,
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return courses.map((course) => {
    const lessonsCount = course.modules.reduce(
      (acc, m) => acc + m.lessons.length,
      0
    );

    return {
      id: course.id,
      code: course.slug.slice(0, 6).toUpperCase(),
      slug: course.slug,
      title: course.title,
      shortDescription: course.summary,
      fullDescription: course.summary,
      category: course.category as Course["category"],
      level: course.level as Course["level"],
      hours: course.hours > 0 ? course.hours : 48,
      lessonsCount: lessonsCount > 0 ? lessonsCount : 8,
      priceUsd: 180,
      rating: 4.9,
      reviewsCount: 124,
      accessNote: "Acceso previa confirmación de abono",
      hasVerifiableCertificate: true,
      hasQrCertificate: true,
      imageUrl: course.coverUrl || "/file.svg",
      imageAlt: course.title,
      backdropUrl: course.coverUrl || "/file.svg",
      instructorName: course.instructor.name,
      instructor: {
        name: course.instructor.name,
        role: "Instructor Especialista",
        avatarUrl: course.instructor.avatarUrl || "/globe.svg",
        cipNumber: "CIP Acreditado",
        bio: course.instructor.institution || "Docente Certificado Certifox",
        accreditedStudents: 850,
        rating: 4.9,
      },
      competencies: [
        {
          title: "Auditoría Operacional y Procedimientos",
          description: "Dominio de protocolos de seguridad y normativas aplicables.",
        },
        {
          title: "Gestión de Riesgos y Control",
          description: "Capacidad de identificación y mitigación técnica de fallas.",
        },
      ],
      curriculum: course.modules.map((m, idx) => ({
        moduleNumber: `0${idx + 1}`,
        title: m.title,
        summary: `Lecciones del ${m.title}`,
        hours: Math.ceil((m.lessons.reduce((acc, l) => acc + l.durationMin, 0) || 60) / 60),
        lessons: m.lessons.map((l) => ({
          title: l.title,
          duration: `${l.durationMin} min`,
          type: "video" as const,
          meta: "Lección en video",
        })),
      })),
      prerequisites: [
        {
          iconName: "badge" as const,
          title: "Documento de Identidad Vigente",
          description: "DNI o carnet de extranjería para el registro y diploma.",
        },
        {
          iconName: "devices" as const,
          title: "Dispositivo con Conexión",
          description: "Acceso multidispositivo a través del aula web.",
        },
      ],
      faqs: [
        {
          question: "¿Cómo recibo mi certificado oficial?",
          answer: "Al completar todas las lecciones del aula y entregar la tarea aprobada por el instructor, se emitirá tu certificado digital con código único, QR y verificación pública.",
        },
        {
          question: "¿Cuáles son los métodos de abono?",
          answer: "Aceptamos Yape, Plin y transferencia bancaria nacional (BCP / Interbank). Al registrar tu solicitud verás los datos y podrás avisar directamente por WhatsApp.",
        },
      ],
    } as Course;
  });
}

/**
 * Obtiene el conteo de cursos por categoría directamente desde la base de datos.
 */
export async function getCatalogCategoryCounts() {
  const categories = await db.course.groupBy({
    by: ["category"],
    where: { published: true },
    _count: {
      id: true,
    },
  });

  const total = await db.course.count({ where: { published: true } });

  const record: Record<string, number> = {
    all: total,
    Todos: total,
  };

  categories.forEach((c) => {
    record[c.category] = c._count.id;
  });

  return record;
}

/**
 * Obtiene un curso específico por su slug o por su id desde Prisma.
 */
export async function getCourseDetailBySlugOrId(idOrSlug: string): Promise<Course | null> {
  const course = await db.course.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      published: true,
    },
    include: {
      instructor: true,
      modules: {
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      assessments: true,
    },
  });

  if (!course) return null;

  const lessonsCount = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  const curriculum: CurriculumModule[] = course.modules.map((m, idx) => ({
    moduleNumber: `0${idx + 1}`,
    title: m.title,
    summary: `Lecciones técnicas y evaluaciones del ${m.title}`,
    hours: Math.ceil((m.lessons.reduce((acc, l) => acc + l.durationMin, 0) || 60) / 60),
    lessons: m.lessons.map((l) => ({
      title: l.title,
      duration: `${l.durationMin} min`,
      type: "video",
      meta: "Lección en video",
    })),
  }));

  const prerequisites: Prerequisite[] = [
    {
      iconName: "badge",
      title: "Documento de Identidad Vigente",
      description: "DNI o carnet de extranjería para el registro y diploma oficial.",
    },
    {
      iconName: "engineering",
      title: "Interés en Capacitación Técnica",
      description: "Deseable vocación en operaciones industriales o de faena.",
    },
    {
      iconName: "devices",
      title: "Acceso Multidispositivo",
      description: "Navegador web en smartphone, tablet o computadora.",
    },
  ];

  const faqs: CourseFaq[] = [
    {
      question: "¿Cómo recibo mi certificado oficial?",
      answer: "Al completar todas las lecciones del aula y entregar la tarea aprobada por el instructor, se emitirá tu certificado digital con código único, QR y verificación pública.",
    },
    {
      question: "¿Cuáles son los métodos de abono manual?",
      answer: "Aceptamos Yape, Plin y transferencia bancaria nacional (BCP / Interbank). Al registrar tu solicitud verás los datos y podrás avisar directamente por WhatsApp.",
    },
    {
      question: "¿El acceso al aula es inmediato tras pagar?",
      answer: "El docente verifica el abono y habilita tu matrícula inmediatamente. Verás el curso activo en tu campus.",
    },
  ];

  return {
    id: course.id,
    code: course.slug.slice(0, 6).toUpperCase(),
    slug: course.slug,
    title: course.title,
    shortDescription: course.summary,
    fullDescription: course.summary,
    category: course.category as Course["category"],
    level: course.level as Course["level"],
    hours: course.hours > 0 ? course.hours : 48,
    lessonsCount: lessonsCount > 0 ? lessonsCount : 8,
    priceUsd: 180,
    rating: 4.9,
    reviewsCount: 124,
    accessNote: "Acceso previa confirmación de abono",
    hasVerifiableCertificate: true,
    hasQrCertificate: true,
    imageUrl: course.coverUrl || "/file.svg",
    imageAlt: course.title,
    backdropUrl: course.coverUrl || "/file.svg",
    instructorName: course.instructor.name,
    instructor: {
      name: course.instructor.name,
      role: "Especialista Docente Certificado",
      avatarUrl: course.instructor.avatarUrl || "/globe.svg",
      cipNumber: "CIP Acreditado",
      bio: course.instructor.institution || "Docente Certificado Certifox",
      accreditedStudents: 850,
      rating: 4.9,
    },
    competencies: [
      {
        title: "Auditoría Operacional y Procedimientos",
        description: "Dominio de protocolos de seguridad y normativas aplicables.",
      },
      {
        title: "Gestión de Riesgos y Control",
        description: "Capacidad de identificación y mitigación técnica de fallas.",
      },
    ],
    curriculum,
    prerequisites,
    faqs,
  };
}
