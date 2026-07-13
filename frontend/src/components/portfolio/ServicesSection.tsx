import { portfolioIconMap } from "@/components/portfolio/iconMap";
import { SectionShell } from "@/components/portfolio/SectionShell";
import { usePortfolioContent } from "@/lib/portfolio-content";

export function ServicesSection() {
  const { content } = usePortfolioContent();
  return (
    <SectionShell id="services" className="services-section">
      <div className="section-heading">
        {/* <p className="portfolio-kicker">Services</p> */}
        <h2>
          {content.sections.services?.heading ?? "My services"}
        </h2>
      </div>
      <div className="service-grid">
        {content.services.map((service) => {
          const Icon = portfolioIconMap[service.iconKey ?? "code"] ?? portfolioIconMap.code;
          return (
            <article className="service-card" key={service.title}>
              <Icon size={34} aria-hidden="true" />
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}
