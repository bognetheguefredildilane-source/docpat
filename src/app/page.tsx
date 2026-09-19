
import { Navbar } from "@/Components/Navbar";
import { AboutSection } from "@/Components/Sections/AboutSection";
import { HeroSection } from "@/Components/Sections/HeroSection";
import { PopularServicesSection } from "@/Components/Sections/PopularServicesSection";
import { SpecialistsSection } from "@/Components/Sections/SpecialistsSection";
import { StatsSection } from "@/Components/Sections/StatsSection";
import { ServicesSection } from "@/Components/Sections/ServicesSection";
import { Footer } from "@/Components/Footer";
export default function Home() {
  return (
   <>
   <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <PopularServicesSection />
        <AboutSection />
        <SpecialistsSection />
        <ServicesSection />
      </main>
      <Footer />
    </div>
   </>
  );
}
