import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, Menu, X } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa6";
import { SiGithub } from "react-icons/si";

import { portfolioProfile } from "@/data/portfolio";

const links = [
  { label: "Work", href: "#projects" },
  { label: "Services", href: "#consultation" },
  { label: "About", href: "#home" },
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
        <a href={portfolioProfile.socialLinks[1].href} target="_blank" rel="noreferrer" aria-label="GitHub profile">
          <SiGithub size={17} />
        </a>
        <a href={portfolioProfile.socialLinks[0].href} target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
          <FaLinkedinIn size={17} />
        </a>
        <a href={`mailto:${portfolioProfile.email}`} aria-label="Email Goodluck Igbokwe">
          <Mail size={17} />
        </a>
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
