import { portfolioAboutCards } from "@/data/portfolio";
import { SectionShell } from "@/components/portfolio/SectionShell";

export function AboutSection() {
  return (
    <SectionShell id="about" className="about-section">
      <div className="section-heading">
        <h2>About Me</h2>
        {/* <p>A quick read, not a resume.</p> */}
      </div>
      <div className="about-bento" aria-label="About Goodluck">
        {portfolioAboutCards.map((card) => (
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
      </div>
    </SectionShell>
  );
}
