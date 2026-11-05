export interface InstructorCourseItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  level: string;
  hours: number;
  summary: string | null;
  price: number;
  currency: string;
  coverUrl: string | null;
  published: boolean;
  modules: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      order: number;
      durationMin: number;
      videoUrl: string | null;
    }[];
  }[];
  activeStudentsCount: number;
}
