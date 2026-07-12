import { AboutSection } from "@/components/portfolio/AboutSection";
import { ContactSection } from "@/components/portfolio/ContactSection";
import { HeroSection } from "@/components/portfolio/HeroSection";
import { NotesSection } from "@/components/portfolio/NotesSection";
import { PortfolioFooter } from "@/components/portfolio/PortfolioFooter";
import { PortfolioNav } from "@/components/portfolio/PortfolioNav";
import { ProjectsSection } from "@/components/portfolio/ProjectsSection";
import { ServicesSection } from "@/components/portfolio/ServicesSection";
import { StacksSection } from "@/components/portfolio/StacksSection";

export function PortfolioPage() {
  return (
    <main className="portfolio-root">
      <PortfolioNav />
      <HeroSection />
      <AboutSection />
      <StacksSection />
      <ServicesSection />
      <ProjectsSection />
      <NotesSection />
      <ContactSection />
      <PortfolioFooter />
    </main>
  );
}
