import { portfolioProfile } from "@/data/portfolio";

export function PortfolioFooter() {
  return (
    <footer className="portfolio-footer">
      <div className="portfolio-shell">
        <p> &copy; {new Date().getFullYear()} {portfolioProfile.name}. All rights reserved. </p>
        {/* <p>{portfolioProfile.name}</p> */}
        {/* <p>{portfolioProfile.role}</p> */}
        <a href="#home">Back to top</a>
      </div>
    </footer>
  );
}
