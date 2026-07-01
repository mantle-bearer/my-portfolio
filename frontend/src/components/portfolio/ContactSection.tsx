import type { FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa6";
import { SiGithub } from "react-icons/si";

import { portfolioProfile } from "@/data/portfolio";
import { SectionShell } from "@/components/portfolio/SectionShell";

export function ContactSection() {
  function openEmailDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const subject = String(form.get("subject") ?? "Project enquiry").trim();
    const message = String(form.get("message") ?? "").trim();
    const body = [`Name: ${name}`, `Email: ${email}`, "", message].join("\n");

    window.location.href = `mailto:${portfolioProfile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

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
              <FaLinkedinIn size={18} />
              LinkedIn
            </a>
            <a href={portfolioProfile.socialLinks[1].href} target="_blank" rel="noreferrer">
              <SiGithub size={18} />
              GitHub
            </a>
          </div>
        </div>
        <form className="contact-form" aria-label="Contact form" onSubmit={openEmailDraft}>
          <label>
            <span>Name</span>
            <input name="name" type="text" autoComplete="name" required />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            <span>Subject</span>
            <input name="subject" type="text" required />
          </label>
          <label>
            <span>Message</span>
            <textarea name="message" rows={5} required />
          </label>
          <button className="portfolio-button portfolio-button-primary" type="submit">
            Open email draft
            <Send size={17} />
          </button>
          <p className="contact-form-note">This opens your email app. Direct website sending is coming later.</p>
        </form>
      </div>
    </SectionShell>
  );
}
