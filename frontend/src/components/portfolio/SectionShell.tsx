import type { ReactNode } from "react";

type SectionShellProps = {
  id?: string;
  tone?: "default" | "deep" | "light";
  className?: string;
  children: ReactNode;
};

export function SectionShell({ id, tone = "default", className = "", children }: SectionShellProps) {
  return (
    <section id={id} className={`portfolio-section ${className}`.trim()} data-tone={tone}>
      <div className="portfolio-shell">{children}</div>
    </section>
  );
}
