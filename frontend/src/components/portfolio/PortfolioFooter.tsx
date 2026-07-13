import { usePortfolioContent } from "@/lib/portfolio-content";

export function PortfolioFooter() {
  const { content } = usePortfolioContent();
  return (
    <footer className="portfolio-footer">
      <div className="portfolio-shell">
        <p>
          &copy; {new Date().getFullYear()} {content.profile.name}. {content.footerText}
        </p>
        <a href="#home">Back to top</a>
      </div>
    </footer>
  );
}
