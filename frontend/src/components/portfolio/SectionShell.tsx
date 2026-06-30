import type { ReactNode } from "react";

import { GrainOverlay } from "@/components/portfolio/GrainOverlay";

type SectionShellProps = {
  id?: string;
  tone?: "default" | "deep" | "light";
  className?: string;
  children: ReactNode;
  grain?: boolean;
};

export function SectionShell({ id, tone = "default", className = "", children, grain = true }: SectionShellProps) {
  return (
    <section id={id} className={`portfolio-section ${className}`.trim()} data-tone={tone}>
      {grain ? <GrainOverlay /> : null}
      <div className="portfolio-shell">{children}</div>
    </section>
  );
}
