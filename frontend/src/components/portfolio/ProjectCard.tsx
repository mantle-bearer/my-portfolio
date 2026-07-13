import { ExternalLink } from "lucide-react";

import type { PortfolioProject } from "@/types/portfolio";

export function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <article className="project-card">
      <div className="project-card-image" aria-hidden="true">
        {project.image ? <img src={project.image} alt="" /> : <span>{project.title}</span>}
      </div>
      <div className="project-card-copy">
        <p className="project-card-kicker">{project.featured ? "Featured placeholder" : "Project placeholder"}</p>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
      </div>
      <div className="project-tags">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <a
        className="project-card-link"
        href={project.href || `/projects/${project.slug}`}
        target={project.external_url ? "_blank" : undefined}
        rel={project.external_url ? "noopener noreferrer" : undefined}
        aria-label={`Open ${project.title}`}
      >
          <ExternalLink size={16} />
      </a>
    </article>
  );
}
