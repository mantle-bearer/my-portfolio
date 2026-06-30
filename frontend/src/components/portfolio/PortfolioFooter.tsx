import { portfolioProfile } from "@/data/portfolio";

export function PortfolioFooter() {
  return (
    <footer className="portfolio-footer">
      <div className="portfolio-shell">
        <p>{portfolioProfile.name}</p>
        <p>{portfolioProfile.role}</p>
      </div>
    </footer>
  );
}
