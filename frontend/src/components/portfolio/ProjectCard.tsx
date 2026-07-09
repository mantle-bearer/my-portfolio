import { ExternalLink } from "lucide-react";

import type { PortfolioProject } from "@/data/portfolio";

export function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <article className="project-card">
      <div className="project-card-image" aria-hidden="true">
        <span>{project.title}</span>
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
      {project.href ? (
        <a className="project-card-link" href={project.href} target="_blank" rel="noreferrer" aria-label={`Open ${project.title}`}>
          <ExternalLink size={16} />
        </a>
      ) : null}
    </article>
  );
}
