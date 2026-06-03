import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import FAQSection from "@/components/landing/FAQ";
import CTASection from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <Testimonials />
      <FAQSection />
      <CTASection />
      <Footer />
    </>
  );
}
