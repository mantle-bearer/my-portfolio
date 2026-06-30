import { portfolioAssets, portfolioProfile, portfolioProjects } from "@/data/portfolio";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { SectionShell } from "@/components/portfolio/SectionShell";
import { SpeechBubble } from "@/components/portfolio/SpeechBubble";

export function ProjectsSection() {
  return (
    <SectionShell id="projects" tone="light" className="projects-section">
      <div className="projects-feature">
        <div className="projects-copy">
          <SpeechBubble tone="orange" pointer="right">
            <span>View my Portfolio</span>
          </SpeechBubble>
          <div className="projects-summary">
            <p className="portfolio-kicker">Explore My Projects</p>
            <h2>Practical builds for real business workflows.</h2>
            <p>{portfolioProfile.projectIntro}</p>
          </div>
        </div>
        <figure className="projects-portrait">
          <img src={portfolioAssets.projectsPortrait.src} alt={`${portfolioProfile.name} working at a laptop`} />
        </figure>
      </div>
      <div className="project-list-heading">
        <p className="portfolio-kicker">Selected work</p>
        <p>Project case studies are being prepared.</p>
      </div>
      <div className="project-grid">
        {portfolioProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </SectionShell>
  );
}
