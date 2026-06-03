import { useState } from "react";

const faqs = [
  {
    question: "What is ChronoCampus?",
    answer:
      "ChronoCampus is an AI-powered academic resource optimization platform that helps colleges automatically generate timetables, allocate rooms, and manage faculty schedules efficiently.",
  },
  {
    question: "How does ChronoCampus generate timetables?",
    answer:
      "ChronoCampus uses advanced algorithms to analyze course requirements, faculty availability, and room capacity to generate optimal timetables automatically.",
  },
  {
    question: "Can it manage faculty and room allocation?",
    answer:
      "Yes, ChronoCampus can efficiently allocate faculty and rooms based on availability and requirements, reducing manual effort and errors.",
  },
  {
    question: "Can timetables be updated in real-time?",
    answer:
      "Absolutely! Changes in schedules or resources are reflected instantly, ensuring everyone has access to the latest information.",
  },
  {
    question: "Is ChronoCampus suitable for all colleges?",
    answer:
      "ChronoCampus is designed to be flexible and scalable, making it suitable for institutions of all sizes and types.",
  },
];

const ArrowIcon = ({ open }) => (
  <span className={`ml-2 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}>
    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
      <path d="M6 8l4 4 4-4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-10 bg-gradient-to-r from-[#f0f3fa] via-[#FFFCF9] to-[#FFF2F8]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-600 mb-2">Frequently Asked Questions</h2>
        <p className="text-center text-lg text-gray-400 font-semibold mb-12">
          Find answers to common questions about our platform.
        </p>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow border border-gray-200">
              <button
                className="w-full flex justify-between items-center px-6 py-5 text-lg font-semibold text-gray-700 focus:outline-none"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                aria-expanded={openIndex === idx}
              >
                <span>{faq.question}</span>
                <ArrowIcon open={openIndex === idx} />
              </button>
              <div
                className={`px-6 overflow-hidden transition-all duration-300 text-gray-600 text-base ${
                  openIndex === idx ? "max-h-40 opacity-100 py-5" : "max-h-0 opacity-0 py-0"
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
