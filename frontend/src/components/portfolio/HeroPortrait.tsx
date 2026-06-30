import { portfolioAssets, portfolioProfile } from "@/data/portfolio";
import { AccentRings } from "@/components/portfolio/AccentRings";

export function HeroPortrait() {
  return (
    <figure className="hero-portrait">
      <AccentRings />
      <img src={portfolioAssets.heroPortrait.src} alt={`${portfolioProfile.name}, ${portfolioProfile.role}`} />
    </figure>
  );
}
