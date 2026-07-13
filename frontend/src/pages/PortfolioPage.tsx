import { AboutSection } from "@/components/portfolio/AboutSection";
import { ContactSection } from "@/components/portfolio/ContactSection";
import { HeroSection } from "@/components/portfolio/HeroSection";
import { NotesSection } from "@/components/portfolio/NotesSection";
import { PortfolioFooter } from "@/components/portfolio/PortfolioFooter";
import { PortfolioNav } from "@/components/portfolio/PortfolioNav";
import { ProjectsSection } from "@/components/portfolio/ProjectsSection";
import { ServicesSection } from "@/components/portfolio/ServicesSection";
import { StacksSection } from "@/components/portfolio/StacksSection";
import { PortfolioContentProvider, usePortfolioContent } from "@/lib/portfolio-content";
import type { PortfolioContent } from "@/types/portfolio";

function PortfolioSurface() {
  const { content } = usePortfolioContent();
  const visible = (key: string) => content.sections[key]?.isVisible !== false;

  return (
    <main className="portfolio-root">
      <PortfolioNav />
      {visible("home") ? <HeroSection /> : null}
      {visible("about") ? <AboutSection /> : null}
      {visible("stacks") ? <StacksSection /> : null}
      {visible("services") ? <ServicesSection /> : null}
      {visible("projects") ? <ProjectsSection /> : null}
      {visible("notes") ? <NotesSection /> : null}
      {visible("contact") ? <ContactSection /> : null}
      <PortfolioFooter />
    </main>
  );
}

export function PortfolioPage({ previewContent }: { previewContent?: PortfolioContent }) {
  return (
    <PortfolioContentProvider previewContent={previewContent}>
      <PortfolioSurface />
    </PortfolioContentProvider>
  );
}
