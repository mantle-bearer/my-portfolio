import { Download, Mail } from "lucide-react";

import { HeroPortrait } from "@/components/portfolio/HeroPortrait";
import { portfolioIconMap } from "@/components/portfolio/iconMap";
import { usePortfolioContent } from "@/lib/portfolio-content";

export function HeroSection() {
  const { content } = usePortfolioContent();
  const { profile } = content;

  return (
    <section id="home" className="portfolio-hero" aria-labelledby="portfolio-hero-title">
      <div className="portfolio-shell hero-grid">
        <div className="hero-content">
          <h2 id="portfolio-hero-title" className="portfolio-display">
            <span className="hero-title-name">{profile.heroTitle.name}</span>
          </h2>
          <p className="hero-summary">{profile.heroSummary}</p>
          <div className="hero-actions" aria-label="Primary portfolio actions">
            <a className="portfolio-button portfolio-button-primary" href={profile.heroPrimaryAction.href}>
              {profile.heroPrimaryAction.label}
              <Download size={17} />
            </a>
            <a className="portfolio-button portfolio-button-secondary" href={profile.heroSecondaryAction.href}>
              {profile.heroSecondaryAction.label}
              <Mail size={17} />
            </a>
          </div>
          <div className="hero-expertise" aria-label="Technical expertise">
            <p>Expertise in</p>
            <div>
              {content.heroExpertise.map(({ label, iconKey }) => {
                const Icon = portfolioIconMap[iconKey] ?? portfolioIconMap.code;
                return (
                  <span key={label} title={label} aria-label={label}>
                    <Icon aria-hidden="true" />
                  </span>
                );
              })}
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
