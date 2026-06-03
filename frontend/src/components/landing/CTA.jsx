import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="flex flex-col items-center overflow-hidden py-10 bg-gradient-to-r from-[#f0f3fa] via-[#FFFCF9] to-[#FFF2F8]">
      <h2 className="text-4xl text-gray-600 font-bold text-center mb-2">
        Transform Your College Management Today
      </h2>
      <p className="text-center text-lg text-gray-400 font-semibold mb-12">
        Join numerous institutions that are thriving with ChronoCampus.
      </p>
      <Link
        to="/login"
        className="px-10 py-4 rounded-full bg-[#F8D7DA] shadow-sm hover:bg-[#F3C2C6] transition text-gray-600 font-semibold text-xl animate-bounce"
      >
        Get Started
      </Link>
    </section>
  );
}
