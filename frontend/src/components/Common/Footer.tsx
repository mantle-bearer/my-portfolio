import { Mail } from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { staticPortfolioContent } from "@/data/portfolio";

const socialLinks = [
  { icon: FaGithub, href: "https://github.com/mantle-bearer", label: "GitHub" },
  { icon: FaLinkedinIn, href: "https://linkedin.com/in/mantle-bearer", label: "LinkedIn" },
  { icon: Mail, href: "mailto:igbokwegoodluck8@gmail.com", label: "Email" }
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <p>{staticPortfolioContent.profile.name} - {currentYear}</p>
      <div className="social-links">
        {socialLinks.map(({ icon: Icon, href, label }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
            <Icon />
          </a>
        ))}
      </div>
    </footer>
  );
}
