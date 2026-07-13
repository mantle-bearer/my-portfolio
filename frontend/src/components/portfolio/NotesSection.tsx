import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { SectionShell } from "@/components/portfolio/SectionShell";
import { usePortfolioContent } from "@/lib/portfolio-content";

const allNotesCategory = "All";
const noteDateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric"
});

export function NotesSection() {
  const { content } = usePortfolioContent();
  const [activeCategory, setActiveCategory] = useState(allNotesCategory);

  const filteredNotes = useMemo(
    () =>
      activeCategory === allNotesCategory
        ? content.notes
        : content.notes.filter((note) => note.category === activeCategory),
    [activeCategory, content.notes]
  );

  const articleCountLabel = `${filteredNotes.length} ${
    filteredNotes.length === 1 ? "article" : "articles"
  }`;

  return (
    <SectionShell id="notes" className="notes-section">
      <div className="section-heading">
        <h2>
          {content.sections.notes?.heading ?? "Code Chronicles"}
        </h2>
      </div>

      <div className="note-toolbar" aria-label="Code Chronicles categories">
        <div className="note-tabs" role="group" aria-label="Filter Code Chronicles by category">
          {content.noteCategories.map((category) => (
            <button
              className="note-tab"
              type="button"
              key={category}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <p className="note-count" aria-live="polite">
          {articleCountLabel}
        </p>
      </div>

      <div className="note-grid">
        {filteredNotes.map((note) => (
          <article className="note-card" key={note.title}>
            <div className="note-card-copy">
              <p className="note-category">{note.category}</p>
              <h3>{note.title}</h3>
              <p>{note.excerpt}</p>
            </div>
            <div className="note-card-footer">
              <time dateTime={note.date}>
                {noteDateFormatter.format(new Date(`${note.date}T00:00:00Z`))}
              </time>
              <a href={note.href} aria-label={`Read ${note.title}`}>
                <span>Read</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
