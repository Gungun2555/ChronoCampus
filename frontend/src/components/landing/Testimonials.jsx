import img1 from "@/assets/images/user1.png";
import img2 from "@/assets/images/user2.png";
import img3 from "@/assets/images/user3.png";

const testimonials = [
  {
    name: "Dr. B.K Verma",
    role: "HOD, CSE AI&DS",
    rating: 5,
    text: "Chrono Campus has transformed the way we manage schedules. The AI-driven system saves us hours every week!",
    img: img1,
  },
  {
    name: "Ms. Anju Saini",
    role: "Faculty Member",
    rating: 5,
    text: "The smart assistant feature is incredibly helpful and resource allocation is optimized perfectly. Highly recommend!",
    img: img2,
  },
  {
    name: "Akshay Kumar",
    role: "Final Year Student",
    rating: 5,
    text: "I love how easy it is to check my timetable. Everything is well-organized and always up-to-date!",
    img: img3,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-10 bg-gradient-to-r from-[#f0f3fa] via-[#FFFCF9] to-[#FFF2F8]">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <h2 className="text-4xl font-bold text-center text-gray-600 mb-2">What Our Users Say</h2>
        <p className="text-center text-lg text-gray-400 font-semibold mb-12">
          Automatic timetable generation that targets faculty and rooms, generating courses to manage allocations in seconds.
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i} className="p-8 pb-0 flex flex-col bg-gray-50 rounded-xl shadow-lg hover:shadow-2xl ring-1 ring-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <img src={t.img} alt={t.name} className="w-20 h-20 rounded-full object-cover shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-gray-700">{t.name}</h3>
                  <div className="font-semibold text-gray-400">{t.role}</div>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <span key={idx} className="text-amber-400 text-2xl">★</span>
                ))}
              </div>
              <p className="font-semibold text-gray-600 text-base leading-relaxed flex-grow">"{t.text}"</p>
              <div className="text-right text-5xl text-gray-600 font-bold opacity-40">"</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
