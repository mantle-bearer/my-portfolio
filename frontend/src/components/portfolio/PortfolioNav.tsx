import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { AppearanceButton } from "@/components/theme";

const links = [
  { label: "Home", href: "#home" },
  { label: "Projects", href: "#projects" },
  { label: "Consult", href: "#consultation" },
  { label: "Contact", href: "#contact" }
];

export function PortfolioNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="portfolio-nav">
      <Link to="/portfolio" className="portfolio-brand" aria-label="Goodluck Igbokwe portfolio home">
        <span>GI</span>
        <span>Goodluck Igbokwe</span>
      </Link>
      <nav className="portfolio-nav-links" aria-label="Portfolio navigation">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="portfolio-nav-actions">
        <AppearanceButton />
        <button
          className="portfolio-menu-button"
          type="button"
          aria-label={open ? "Close portfolio menu" : "Open portfolio menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
      {open ? (
        <nav className="portfolio-mobile-menu" aria-label="Mobile portfolio navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
