import heroImg from "@/assets/images/hero.png";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section id="home" className="w-full bg-gradient-to-r from-[#f0f3fa] via-[#FFFCF9] to-[#FFF2F8]">
      <div className="w-full pt-10">
        <div className="min-h-[85vh] flex items-center">
          {/* Left content */}
          <div className="flex-[0_0_40%] px-8 lg:px-16 flex items-center">
            <div className="max-w-lg">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-700 leading-tight">
                Welcome to <br />
                <span className="text-blue-300">Chrono Campus</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                AI-Powered College Resource Optimization System
              </p>
              <p className="mt-4 font-semibold text-gray-400">
                Efficiently manage timetables, faculty schedules, room allocations,
                and more with our intelligent AI-driven system.
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  to="/login"
                  className="px-8 py-3 rounded-full bg-[#F8D7DA] shadow-sm hover:bg-[#F3C2C6] transition text-gray-600 font-medium"
                >
                  Get Started
                </Link>
                <a
                  href="#features"
                  className="px-8 py-3 rounded-full bg-[#DCEBFF] shadow-sm hover:bg-[#C6DDFF] transition text-gray-600 font-medium"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="flex-[0_0_60%] relative overflow-hidden h-full flex items-end justify-start">
            <img
              src={heroImg}
              alt="ChronoCampus"
              className="w-[900px] lg:w-[1000px] xl:w-[1100px] object-contain -mb-12"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
