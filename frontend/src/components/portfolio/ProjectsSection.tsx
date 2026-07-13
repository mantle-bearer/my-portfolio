import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { SectionShell } from "@/components/portfolio/SectionShell";
import { usePortfolioContent } from "@/lib/portfolio-content";

export function ProjectsSection() {
  const { content } = usePortfolioContent();
  return (
    <SectionShell id="projects" className="projects-section">
      <div className="section-heading">
        <h2>{content.sections.projects?.heading ?? "My Portfolio"}</h2>
      </div>
      <div className="project-grid">
        {content.projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </SectionShell>
  );
}
