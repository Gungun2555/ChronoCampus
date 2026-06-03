import logo from "@/assets/images/logo.png";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-gray-50 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
        {/* Logo */}
        <div className="flex items-center h-full">
          <img src={logo} alt="ChronoCampus" className="h-12 md:h-14 w-auto" />
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex gap-5 text-gray-600 font-medium">
          <a href="#home" className="px-4 py-2 rounded-full hover:bg-gray-200 transition duration-200">Home</a>
          <a href="#features" className="px-4 py-2 rounded-full hover:bg-gray-200 transition duration-200">Features</a>
          <a href="#about" className="px-4 py-2 rounded-full hover:bg-gray-200 transition duration-200">About Us</a>
          <a href="#contact" className="px-4 py-2 rounded-full hover:bg-gray-200 transition duration-200">Contact</a>
        </nav>

        {/* Actions */}
        <div className="flex gap-5">
          <Link
            to="/login"
            className="px-5 py-2 text-gray-600 font-medium rounded-full bg-[#DCEBFF] hover:bg-[#C6DDFF] transition"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            className="px-5 py-2 text-gray-600 font-medium rounded-full bg-[#F8D7DA] hover:bg-[#F3C2C6] transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
