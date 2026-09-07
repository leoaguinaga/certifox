import { CourseFaq } from "../types";

interface CourseDetailFaqProps {
  faqs?: CourseFaq[];
}

export function CourseDetailFaq({ faqs }: CourseDetailFaqProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/80 mb-10">
      <h2 className="text-lg sm:text-xl font-bold text-stone-900 mb-6">
        Preguntas frecuentes sobre la acreditación
      </h2>

      <div className="flex flex-col gap-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-xl bg-[#f8f9ff] border border-stone-200/60 flex flex-col gap-1.5"
          >
            <h4 className="text-sm font-bold text-stone-900 leading-snug">
              {faq.question}
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
