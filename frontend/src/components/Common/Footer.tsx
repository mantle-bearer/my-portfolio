import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const socialLinks = [
  { icon: FaGithub, href: "https://github.com/fastapi/fastapi", label: "GitHub" },
  { icon: FaXTwitter, href: "https://x.com/fastapi", label: "X" },
  { icon: FaLinkedinIn, href: "https://linkedin.com/company/fastapi", label: "LinkedIn" }
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <p>Full Stack FastAPI Template - {currentYear}</p>
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
