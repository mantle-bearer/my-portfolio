import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sun, X } from "lucide-react";

import { useTheme } from "@/components/theme";
import { portfolioProfile } from "@/data/portfolio";

const links = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#projects" },
  { label: "Blog", href: "#notes" },
  { label: "Contact", href: "#contact" }
];

export function PortfolioNav() {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <header className={`portfolio-nav ${open ? "is-open" : ""}`}>
      <Link to="/portfolio" className="portfolio-brand" aria-label="Goodluck Igbokwe portfolio home">
        <img src="/images/portfolio/profile-passport-picture.jpg" alt="" />
      </Link>
      <nav className="portfolio-nav-links" aria-label="Portfolio navigation">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="portfolio-nav-actions">
        <button
          className="portfolio-theme-button"
          type="button"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          className="portfolio-menu-button"
          type="button"
          aria-label="Portfolio menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
      <button
        className="portfolio-mobile-backdrop"
        type="button"
        aria-label="Close mobile sidebar"
        onClick={() => setOpen(false)}
      />
      {open ? (
        <nav className="portfolio-mobile-menu" aria-label="Mobile portfolio navigation">
          <div className="portfolio-mobile-menu-top">
            <button
              className="portfolio-menu-button"
              type="button"
              aria-label="Close mobile sidebar"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
            <button
              className="portfolio-theme-button"
              type="button"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              onClick={toggleTheme}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
          <div className="portfolio-mobile-profile">
            <img src="/images/portfolio/profile-passport-picture.jpg" alt="" />
            <strong>{portfolioProfile.name}</strong>
            <span>{portfolioProfile.role}</span>
          </div>
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
