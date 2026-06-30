import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";

import { HeroPortrait } from "@/components/portfolio/HeroPortrait";
import { TechBackdrop } from "@/components/portfolio/TechBackdrop";
import { portfolioProfile } from "@/data/portfolio";

export function HeroSection() {
  return (
    <section id="home" className="portfolio-hero" aria-labelledby="portfolio-hero-title">
      <TechBackdrop />
      <div className="portfolio-shell hero-grid">
        <div className="hero-art" aria-hidden="true">
          <span className="hero-code-card">API</span>
          <span className="hero-code-card">UI</span>
          <span className="hero-code-card">DB</span>
        </div>
        <HeroPortrait />
        <div className="hero-content">
          <p className="portfolio-kicker">{portfolioProfile.role}</p>
          <h1 id="portfolio-hero-title" className="portfolio-display">
            {portfolioProfile.headline}
          </h1>
          <div className="hero-actions" aria-label="Primary portfolio actions">
            <a className="portfolio-button portfolio-button-primary" href="#projects">
              View projects
              <ArrowDown size={18} />
            </a>
            <a className="portfolio-button portfolio-button-secondary" href="#contact">
              Contact me
              <Mail size={18} />
            </a>
          </div>
          <div className="hero-socials" aria-label="Social links">
            <a href={portfolioProfile.socialLinks[1].href} target="_blank" rel="noreferrer" aria-label="GitHub profile">
              <Github size={18} />
            </a>
            <a href={portfolioProfile.socialLinks[0].href} target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
