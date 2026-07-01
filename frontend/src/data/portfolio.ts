export type PortfolioAssetStatus = "placeholder" | "final";

export type PortfolioAsset = {
  key: string;
  label: string;
  src: string;
  fallbackSrc?: string;
  finalPath: string;
  fallbackFinalPath?: string;
  status: PortfolioAssetStatus;
  notes: string;
};

export type PortfolioProject = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  href?: string;
  featured?: boolean;
};

export type PortfolioLink = {
  label: string;
  href: string;
};

const subjectPlaceholder = "/images/portfolio/placeholders/subject-placeholder.svg";
const backgroundPlaceholder = "/images/portfolio/placeholders/tech-background-placeholder.svg";

export const portfolioAssets = {
  heroPortrait: {
    key: "heroPortrait",
    label: "Hero portrait",
    src: "/images/portfolio/personal-portrait2.png",
    fallbackSrc: subjectPlaceholder,
    finalPath: "/images/portfolio/personal-portrait2.png",
    fallbackFinalPath: "/images/portfolio/personal-portrait.png",
    status: "final",
    notes: "Tightly cropped transparent white-sweater portrait used for the split hero composition."
  },
  projectsPortrait: {
    key: "projectsPortrait",
    label: "Projects portrait",
    src: "/images/portfolio/projects-portrait.png",
    finalPath: "/images/portfolio/projects-portrait.png",
    status: "final",
    notes: "Transparent seated portrait with laptop and award composition."
  },
  consultationPortrait: {
    key: "consultationPortrait",
    label: "Consultation portrait",
    src: "/images/portfolio/projects-portrait.png",
    finalPath: "/images/portfolio/projects-portrait.png",
    status: "placeholder",
    notes: "Using the seated projects portrait until a separate consultation portrait is provided."
  },
  laptopAward: {
    key: "laptopAward",
    label: "Laptop and award",
    src: "/images/portfolio/laptop-award.png",
    finalPath: "/images/portfolio/laptop-award.png",
    status: "final",
    notes: "Transparent supporting composition for project and CTA sections."
  },
  heroBackgroundLight: {
    key: "heroBackgroundLight",
    label: "Light hero technology background",
    src: "/images/portfolio/hero-bg-light.png",
    finalPath: "/images/portfolio/hero-bg-light.png",
    status: "final",
    notes: "Wide 3:1 technology background for light mode."
  },
  heroBackgroundDark: {
    key: "heroBackgroundDark",
    label: "Dark hero technology background",
    src: "/images/portfolio/hero-bg-dark.png",
    finalPath: "/images/portfolio/hero-bg-dark.png",
    status: "final",
    notes: "Wide 3:1 technology background for dark mode."
  },
  fallbackSubject: {
    key: "fallbackSubject",
    label: "Fallback subject placeholder",
    src: subjectPlaceholder,
    finalPath: subjectPlaceholder,
    status: "placeholder",
    notes: "Temporary transparent subject placeholder for future project imagery."
  },
  fallbackBackground: {
    key: "fallbackBackground",
    label: "Fallback background placeholder",
    src: backgroundPlaceholder,
    finalPath: backgroundPlaceholder,
    status: "placeholder",
    notes: "Temporary abstract technology background placeholder."
  }
} satisfies Record<string, PortfolioAsset>;

export const portfolioAssetList = Object.values(portfolioAssets);

export const portfolioProfile = {
  name: "Goodluck Igbokwe",
  role: "Software Developer",
  email: "igbokwegoodluck8@gmail.com",
  heroTitle: {
    intro: "Meet",
    name: "Goodluck Igbokwe"
  },
  heroSummary: "A Software Developer building powerful, scalable web applications.",
  projectIntro:
    "From e-commerce solutions to IoT integrations, see how I help businesses thrive online.",
  consultationHeadline: "Book a consultation",
  consultationText:
    "Have a web application, business platform, or automation idea to shape? Start with a focused conversation.",
  socialLinks: [
    { label: "LinkedIn", href: "https://linkedin.com/in/mantle-bearer" },
    { label: "GitHub", href: "https://github.com/mantle-bearer" },
    { label: "Email", href: "mailto:igbokwegoodluck8@gmail.com" }
  ] satisfies PortfolioLink[]
};

export const portfolioProjects = [
  {
    slug: "commerce-platform",
    title: "Commerce Platform",
    summary: "Placeholder case study for a storefront, checkout, and operations dashboard.",
    tags: ["React", "FastAPI", "Payments"],
    featured: true
  },
  {
    slug: "iot-operations",
    title: "IoT Operations",
    summary: "Placeholder project for connected-device data, monitoring, and business workflows.",
    tags: ["IoT", "API", "Dashboard"]
  },
  {
    slug: "business-automation",
    title: "Business Automation",
    summary: "Placeholder project for reducing manual work with reliable internal tools.",
    tags: ["Automation", "Workflows", "Integrations"]
  }
] satisfies PortfolioProject[];
