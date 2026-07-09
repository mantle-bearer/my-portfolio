import { ArrowUpRight } from "lucide-react";

import { portfolioNotes } from "@/data/portfolio";
import { SectionShell } from "@/components/portfolio/SectionShell";

export function NotesSection() {
  return (
    <SectionShell id="notes" className="notes-section">
      <div className="section-heading">
        {/* <p className="portfolio-kicker">Blog</p> */}
        <h2>
          Code <span>Chronicles</span>
        </h2>
      </div>
      <div className="note-grid">
        {portfolioNotes.map((note) => (
          <article className="note-card" key={note.title}>
            <div>
              <h3>{note.title}</h3>
              <p>{note.summary}</p>
            </div>
            <a href="#contact" aria-label={`Ask about ${note.title}`}>
              <ArrowUpRight size={18} />
            </a>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
