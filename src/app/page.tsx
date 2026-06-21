import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhyVirgil } from "@/components/home/WhyVirgil";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/shared/Toast";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--virgil-bg)]">
      <Navbar />
      <div className="flex-1">
        <Hero />
        <HowItWorks />
        <WhyVirgil />
      </div>
      <Footer />
      <ToastContainer />
    </main>
  );
}
