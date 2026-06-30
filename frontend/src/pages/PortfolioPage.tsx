import { ContactSection } from "@/components/portfolio/ContactSection";
import { ConsultationSection } from "@/components/portfolio/ConsultationSection";
import { HeroSection } from "@/components/portfolio/HeroSection";
import { PortfolioFooter } from "@/components/portfolio/PortfolioFooter";
import { PortfolioNav } from "@/components/portfolio/PortfolioNav";
import { ProjectsSection } from "@/components/portfolio/ProjectsSection";

export function PortfolioPage() {
  return (
    <main className="portfolio-root">
      <PortfolioNav />
      <HeroSection />
      <ProjectsSection />
      <ConsultationSection />
      <ContactSection />
      <PortfolioFooter />
    </main>
  );
}
