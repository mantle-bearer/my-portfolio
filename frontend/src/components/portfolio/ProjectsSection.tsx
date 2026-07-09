import { portfolioProjects } from "@/data/portfolio";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { SectionShell } from "@/components/portfolio/SectionShell";

export function ProjectsSection() {
  return (
    <SectionShell id="projects" className="projects-section">
      <div className="section-heading">
        <p className="portfolio-kicker">Portfolio</p>
        <h2>
          Personal <span>Projects</span>
        </h2>
        <p>Project case studies are being prepared, so these stay as placeholders for now.</p>
      </div>
      <div className="project-grid">
        {portfolioProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </SectionShell>
  );
}
