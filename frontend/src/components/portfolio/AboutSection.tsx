import { portfolioProfile, portfolioSkills, portfolioStats } from "@/data/portfolio";
import { SectionShell } from "@/components/portfolio/SectionShell";

export function AboutSection() {
  return (
    <SectionShell id="about" className="about-section">
      <div className="section-heading">
        <p className="portfolio-kicker">About me</p>
        <h2>
          About <span>Goodluck</span>
        </h2>
      </div>
      <div className="about-grid">
        <div className="stats-grid" aria-label="Portfolio highlights">
          {portfolioStats.map((stat) => (
            <article className="stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
        <div className="about-copy neumorphic-panel">
          <p>{portfolioProfile.aboutSummary}</p>
          <a className="portfolio-button portfolio-button-secondary" href="#contact">
            Contact me
          </a>
        </div>
      </div>
      <div className="skills-grid" aria-label="Software development skills">
        {portfolioSkills.map((skill) => (
          <div className="skill-meter" key={skill.label}>
            <div>
              <span>{skill.label}</span>
              <strong>{skill.value}%</strong>
            </div>
            <span aria-hidden="true">
              <i style={{ width: `${skill.value}%` }} />
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
