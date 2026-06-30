import { CalendarCheck } from "lucide-react";

import { portfolioAssets, portfolioProfile } from "@/data/portfolio";
import { SectionShell } from "@/components/portfolio/SectionShell";

export function ConsultationSection() {
  return (
    <SectionShell id="consultation" tone="deep" className="consultation-section">
      <div className="consultation-grid">
        <div className="consultation-copy">
          <p className="portfolio-kicker">Consultation</p>
          <h2>{portfolioProfile.consultationHeadline}</h2>
          <p>{portfolioProfile.consultationText}</p>
          <a className="portfolio-button portfolio-button-primary" href="#contact">
            Start a conversation
            <CalendarCheck size={18} />
          </a>
        </div>
        <figure className="consultation-visual">
          <span className="consultation-panel" aria-hidden="true" />
          <img src={portfolioAssets.laptopAward.src} alt={`${portfolioProfile.name} seated with laptop and award`} />
        </figure>
      </div>
    </SectionShell>
  );
}
