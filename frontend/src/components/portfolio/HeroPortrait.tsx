import { portfolioAssets, portfolioProfile } from "@/data/portfolio";

export function HeroPortrait() {
  return (
    <figure className="hero-portrait">
      <img src={portfolioAssets.heroPortrait.src} alt={`${portfolioProfile.name}, ${portfolioProfile.role}`} />
    </figure>
  );
}
