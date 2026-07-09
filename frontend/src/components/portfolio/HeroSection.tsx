import { Download, Mail } from "lucide-react";
import { SiFastapi, SiPostgresql, SiPython, SiReact, SiTypescript } from "react-icons/si";

import { HeroPortrait } from "@/components/portfolio/HeroPortrait";
import { portfolioProfile } from "@/data/portfolio";

const expertise = [
  { label: "React", Icon: SiReact },
  { label: "TypeScript", Icon: SiTypescript },
  { label: "Python", Icon: SiPython },
  { label: "FastAPI", Icon: SiFastapi },
  { label: "PostgreSQL", Icon: SiPostgresql }
];

export function HeroSection() {
  return (
    <section id="home" className="portfolio-hero" aria-labelledby="portfolio-hero-title">
      <div className="portfolio-shell hero-grid">
        <div className="hero-content">
          <h1 id="portfolio-hero-title" className="portfolio-display">
            <span className="hero-title-intro">{portfolioProfile.heroTitle.intro}</span>{" "}
            <span className="hero-title-name">{portfolioProfile.heroTitle.name}</span>
          </h1>
          <p className="hero-summary">{portfolioProfile.heroSummary}</p>
          <div className="hero-actions" aria-label="Primary portfolio actions">
            <a className="portfolio-button portfolio-button-primary" href="#projects">
              View my work
              <Download size={17} />
            </a>
            <a className="portfolio-button portfolio-button-secondary" href="#contact">
              Get in touch
              <Mail size={17} />
            </a>
          </div>
          <div className="hero-expertise" aria-label="Technical expertise">
            <p>Expertise in</p>
            <div>
              {expertise.map(({ label, Icon }) => (
                <span key={label} title={label} aria-label={label}>
                  <Icon aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <HeroPortrait />
        </div>
      </div>
    </section>
  );
}
