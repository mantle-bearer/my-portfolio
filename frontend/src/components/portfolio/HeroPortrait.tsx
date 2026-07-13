import { usePortfolioContent } from "@/lib/portfolio-content";

export function HeroPortrait() {
  const { content } = usePortfolioContent();
  return (
    <figure className="hero-portrait">
      <img
        src={content.assets.heroPortrait.src}
        alt={content.assets.heroPortrait.alt || `${content.profile.name}, ${content.profile.role}`}
      />
    </figure>
  );
}
