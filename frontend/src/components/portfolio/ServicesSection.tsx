import { Code2, Database, Gauge, Layers3, ShieldCheck, Wrench } from "lucide-react";

import { portfolioServices } from "@/data/portfolio";
import { SectionShell } from "@/components/portfolio/SectionShell";

const icons = [Code2, Layers3, Gauge, Database, Wrench, ShieldCheck];

export function ServicesSection() {
  return (
    <SectionShell id="services" className="services-section">
      <div className="section-heading">
        {/* <p className="portfolio-kicker">Services</p> */}
        <h2>
          My <span>services</span>
        </h2>
      </div>
      <div className="service-grid">
        {portfolioServices.map((service, index) => {
          const Icon = icons[index] ?? Code2;
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
