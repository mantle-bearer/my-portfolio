import { Github, Linkedin, Mail } from "lucide-react";

import { portfolioProfile } from "@/data/portfolio";
import { SectionShell } from "@/components/portfolio/SectionShell";

export function ContactSection() {
  return (
    <SectionShell id="contact" className="contact-section">
      <div className="contact-grid">
        <div>
          <p className="portfolio-kicker">Contact</p>
          <h2>Tell me what you want to build.</h2>
          <p className="portfolio-copy">
            The form is prepared for a future backend endpoint. For now, use email or the profile links.
          </p>
          <div className="contact-links">
            <a href={`mailto:${portfolioProfile.email}`}>
              <Mail size={18} />
              {portfolioProfile.email}
            </a>
            <a href={portfolioProfile.socialLinks[0].href} target="_blank" rel="noreferrer">
              <Linkedin size={18} />
              LinkedIn
            </a>
            <a href={portfolioProfile.socialLinks[1].href} target="_blank" rel="noreferrer">
              <Github size={18} />
              GitHub
            </a>
          </div>
        </div>
        <form className="contact-form" aria-label="Contact form">
          <label>
            <span>Name</span>
            <input name="name" type="text" autoComplete="name" />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" />
          </label>
          <label>
            <span>Subject</span>
            <input name="subject" type="text" />
          </label>
          <label>
            <span>Message</span>
            <textarea name="message" rows={5} />
          </label>
          <button className="portfolio-button portfolio-button-secondary" type="button">
            Backend coming later
          </button>
        </form>
      </div>
    </SectionShell>
  );
}
