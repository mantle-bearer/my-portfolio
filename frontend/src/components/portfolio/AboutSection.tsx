import { SectionShell } from "@/components/portfolio/SectionShell";
import { usePortfolioContent } from "@/lib/portfolio-content";

const operationalClarityTitle = "Operational Clarity";

export function AboutSection() {
  const { content } = usePortfolioContent();
  const supportingCards = content.aboutCards.filter((card) => card.title !== operationalClarityTitle);
  const operationalClarityCard = content.aboutCards.find((card) => card.title === operationalClarityTitle);

  return (
    <SectionShell id="about" className="about-section">
      <div className="section-heading">
        <h2>{content.sections.about?.heading ?? "About Me"}</h2>
      </div>
      <div className="about-bento" aria-label="About Goodluck">
        {supportingCards.map((card) => (
          <article
            className={`about-bento-card is-${card.layout} tone-${card.tone} image-${card.imageFit}${
              card.imageRatio ? ` image-ratio-${card.imageRatio}` : ""
            }`}
            key={card.title}
          >
            <div className="about-bento-copy">
              <h3>{card.title}</h3>
              <p>{card.summary}</p>
            </div>
            <div className="about-bento-art">
              <img src={card.image} alt={card.imageAlt} />
            </div>
          </article>
        ))}
        {operationalClarityCard ? (
          <div className="about-bento-stack">
            <article
              className={`about-bento-card is-${operationalClarityCard.layout} tone-${operationalClarityCard.tone} image-${operationalClarityCard.imageFit}${
                operationalClarityCard.imageRatio ? ` image-ratio-${operationalClarityCard.imageRatio}` : ""
              }`}
            >
              <div className="about-bento-copy">
                <h3>{operationalClarityCard.title}</h3>
                <p>{operationalClarityCard.summary}</p>
              </div>
              <div className="about-bento-art">
                <img src={operationalClarityCard.image} alt={operationalClarityCard.imageAlt} />
              </div>
            </article>
            <aside className="about-summary-note" aria-label="About summary note">
              <div className="about-summary-note-bar" aria-hidden="true">
                <span />
                <span />
                <span />
                <small>~/about/goodluck</small>
                <strong>GI</strong>
              </div>
              <div className="about-summary-note-body">
                <p className="about-summary-note-title">{content.aboutSummaryNote.title}</p>
                <p>{content.aboutSummaryNote.summary}</p>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
