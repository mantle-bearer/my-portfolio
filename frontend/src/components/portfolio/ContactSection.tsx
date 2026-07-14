import type { FormEvent } from "react";
import { useState } from "react";
import { Mail, Send } from "lucide-react";

import { portfolioIconMap } from "@/components/portfolio/iconMap";
import { SectionShell } from "@/components/portfolio/SectionShell";
import { api } from "@/lib/api";
import { messageFromError, validationMessagesFromError } from "@/lib/errors";
import { usePortfolioContent } from "@/lib/portfolio-content";

type ContactField = "name" | "email" | "subject" | "message";
type ContactFieldErrors = Partial<Record<ContactField, string>>;

const contactLimits = {
  name: 120,
  email: 320,
  subject: 180,
  message: 5000
} as const;

export function ContactSection() {
  const { content } = usePortfolioContent();
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});

  function clearFieldError(field: ContactField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("sending");
    setError("");
    setFieldErrors({});
    const form = new FormData(formElement);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      subject: String(form.get("subject") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
      website: String(form.get("website") ?? "")
    };
    const emailInput = formElement.elements.namedItem("email") as HTMLInputElement | null;
    const nextErrors: ContactFieldErrors = {};
    if (!payload.name) nextErrors.name = "Please enter your name.";
    if (!payload.email) nextErrors.email = "Please enter your email address.";
    else if (emailInput && !emailInput.validity.valid) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!payload.subject) nextErrors.subject = "Please enter a subject.";
    if (!payload.message) nextErrors.message = "Please enter a message.";
    const firstInvalidField = Object.keys(nextErrors)[0] as ContactField | undefined;
    if (firstInvalidField) {
      setStatus("idle");
      setFieldErrors(nextErrors);
      formElement.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)?.focus();
      return;
    }
    try {
      await api("/portfolio/contact", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      formElement.reset();
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      const validationMessages = validationMessagesFromError(err);
      const apiFieldErrors = Object.fromEntries(
        Object.entries(validationMessages).filter(([field]) =>
          ["name", "email", "subject", "message"].includes(field)
        )
      ) as ContactFieldErrors;
      setFieldErrors(apiFieldErrors);
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
        <form className="contact-form" aria-label="Contact form" onSubmit={submitContact} noValidate>
          <label className="contact-honeypot" aria-hidden="true">
            <span>Website</span>
            <input
              name="website"
              type="text"
              autoComplete="off"
              tabIndex={-1}
              data-1p-ignore
              data-lpignore="true"
            />
          </label>
          <label>
            <span>Name</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={contactLimits.name}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
              onInput={() => clearFieldError("name")}
            />
            {fieldErrors.name ? <small id="contact-name-error" className="contact-field-error">{fieldErrors.name}</small> : null}
          </label>
          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={contactLimits.email}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
              onInput={() => clearFieldError("email")}
            />
            {fieldErrors.email ? <small id="contact-email-error" className="contact-field-error">{fieldErrors.email}</small> : null}
          </label>
          <label>
            <span>Subject</span>
            <input
              name="subject"
              type="text"
              required
              maxLength={contactLimits.subject}
              aria-invalid={Boolean(fieldErrors.subject)}
              aria-describedby={fieldErrors.subject ? "contact-subject-error" : undefined}
              onInput={() => clearFieldError("subject")}
            />
            {fieldErrors.subject ? <small id="contact-subject-error" className="contact-field-error">{fieldErrors.subject}</small> : null}
          </label>
          <label>
            <span>Message</span>
            <textarea
              name="message"
              rows={5}
              required
              maxLength={contactLimits.message}
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
              onInput={() => clearFieldError("message")}
            />
            {fieldErrors.message ? <small id="contact-message-error" className="contact-field-error">{fieldErrors.message}</small> : null}
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
