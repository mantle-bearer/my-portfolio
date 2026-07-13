import type { FormEvent } from "react";
import { useState } from "react";
import { Mail, Send } from "lucide-react";

import { portfolioIconMap } from "@/components/portfolio/iconMap";
import { SectionShell } from "@/components/portfolio/SectionShell";
import { api } from "@/lib/api";
import { messageFromError } from "@/lib/errors";
import { usePortfolioContent } from "@/lib/portfolio-content";

export function ContactSection() {
  const { content } = usePortfolioContent();
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("sending");
    setError("");
    const form = new FormData(formElement);
    try {
      await api("/portfolio/contact", {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") ?? "").trim(),
          email: String(form.get("email") ?? "").trim(),
          subject: String(form.get("subject") ?? "Project enquiry").trim(),
          message: String(form.get("message") ?? "").trim(),
          company: String(form.get("company") ?? "")
        })
      });
      formElement.reset();
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(messageFromError(err));
    }
  }

  const contactLinks = content.profile.socialLinks;

  return (
    <SectionShell id="contact" className="contact-section">
      <div className="section-heading">
        <h2>{content.sections.contact?.heading ?? "Contact Me"}</h2>
      </div>
      <div className="contact-grid">
        <div className="contact-aside">
          <div className="hero-expertise" aria-label="Technical expertise">
            <p>Connect with Me</p>
            <div>
              {contactLinks.map((link) => {
                const Icon = portfolioIconMap[link.iconKey ?? link.platform?.toLowerCase() ?? "email"] ?? portfolioIconMap.email;
                return (
                  <span key={link.href} title={link.platform ?? link.label} aria-label={link.platform ?? link.label}>
                    <Icon aria-hidden="true" />
                  </span>
                );
              })}
            </div>
            <div className="contact-links">
              <a href={`mailto:${content.profile.email}`}>
                <Mail size={18} aria-hidden="true" />
                {content.profile.email}
              </a>
              {contactLinks
                .filter((link) => !link.href.startsWith("mailto:"))
                .map((link) => {
                  const Icon = portfolioIconMap[link.iconKey ?? link.platform?.toLowerCase() ?? "code"] ?? portfolioIconMap.code;
                  return (
                    <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                      <Icon size={18} aria-hidden="true" />
                      {link.label}
                    </a>
                  );
                })}
            </div>
          </div>
          <aside className="consultation-card" aria-label="Book a consultation">
            <div className="consultation-card-image">
              <img
                src={content.assets.consultationCard.src}
                alt={
                  content.assets.consultationCard.alt ||
                  `${content.profile.name} offering a web consultation`
                }
              />
            </div>
            <a
              className="portfolio-button portfolio-button-primary consultation-card-link"
              href={content.consultation.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {content.consultation.label}
            </a>
          </aside>
        </div>
        <form className="contact-form" aria-label="Contact form" onSubmit={submitContact}>
          <label className="contact-honeypot" aria-hidden="true">
            <span>Company</span>
            <input name="company" type="text" autoComplete="off" tabIndex={-1} />
          </label>
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
          <button
            className="portfolio-button portfolio-button-primary"
            type="submit"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending..." : "Send message"}
            <Send size={17} />
          </button>
          <p className="contact-form-note" aria-live="polite">
            {status === "sent" ? "Message received. I will get back to you soon." : error}
          </p>
        </form>
      </div>
    </SectionShell>
  );
}
