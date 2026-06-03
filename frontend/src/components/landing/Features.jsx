import featImg1 from "@/assets/images/card1.png";
import featImg2 from "@/assets/images/card2.png";
import featImg3 from "@/assets/images/card3.png";

const featureList = [
  {
    title: "Automated Timetable Generation",
    description:
      "Generate optimized timetables for faculty and rooms in seconds, adapting to changing requirements automatically.",
    img: featImg1,
  },
  {
    title: "Smart Resource Allocation",
    description:
      "Intelligently assign faculty, classrooms and equipment to maximize utilization and reduce conflicts.",
    img: featImg2,
  },
  {
    title: "Real‑Time Adjustments",
    description:
      "React instantly to sudden changes like faculty substitutions or room closures with live updates.",
    img: featImg3,
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-10 bg-gradient-to-r from-[#f0f3fa] via-[#FFFCF9] to-[#FFF2F8]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <h2 className="text-4xl font-bold text-center text-gray-600 mb-2">Key Features</h2>
        <p className="text-center text-lg text-gray-400 font-semibold mb-12">
          Explore the powerful tools designed to streamline campus operations
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {featureList.map((f, i) => (
            <div
              key={i}
              className="p-6 bg-gray-50 rounded-xl shadow-lg hover:shadow-2xl ring-1 ring-gray-200 flex flex-col items-center text-center"
            >
              <img src={f.img} alt={f.title} className="w-full h-32 mb-4 object-cover rounded-md" />
              <h3 className="text-xl font-bold mb-2 text-gray-500">{f.title}</h3>
              <p className="font-semibold text-gray-400">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
