import { portfolioProjects } from "@/data/portfolio";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { SectionShell } from "@/components/portfolio/SectionShell";

export function ProjectsSection() {
  return (
    <SectionShell id="projects" className="projects-section">
      <div className="section-heading">
        {/* <p className="portfolio-kicker">Portfolio</p> */}
        <h2>
          My Portfolio
        </h2>
      </div>
      <div className="project-grid">
        {portfolioProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </SectionShell>
  );
}
