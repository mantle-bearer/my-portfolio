import { portfolioAssets } from "@/data/portfolio";

export function TechBackdrop() {
  return (
    <div className="tech-backdrop" aria-hidden="true">
      <img className="tech-backdrop-light" src={portfolioAssets.heroBackgroundLight.src} alt="" decoding="async" />
      <img className="tech-backdrop-dark" src={portfolioAssets.heroBackgroundDark.src} alt="" decoding="async" />
    </div>
  );
}
