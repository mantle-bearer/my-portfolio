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

export type PortfolioStat = {
  value: string;
  label: string;
};

export type PortfolioService = {
  title: string;
  summary: string;
};

export type PortfolioSkill = {
  label: string;
  value: number;
};

export type PortfolioAboutCard = {
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  layout: "tall" | "wide" | "small";
  tone: "navy" | "white" | "blue" | "orange";
  imageFit: "contain" | "cover";
  imageRatio?: "portrait" | "landscape";
};

export type PortfolioNote = {
  title: string;
  summary: string;
};

const subjectPlaceholder = "/images/portfolio/placeholders/subject-placeholder.svg";
const backgroundPlaceholder = "/images/portfolio/placeholders/tech-background-placeholder.svg";

export const portfolioAssets = {
  heroPortrait: {
    key: "heroPortrait",
    label: "Hero portrait",
    src: "/images/portfolio/hero-portrait.png",
    fallbackSrc: subjectPlaceholder,
    finalPath: "/images/portfolio/hero-portrait.png",
    fallbackFinalPath: "/images/portfolio/personal-portrait.png",
    status: "final",
    notes: "Framed white-sweater portrait used as the hero composition."
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
  role: "Software Engineer",
  email: "igbokwegoodluck8@gmail.com",
  heroTitle: {
    name: "Goodluck Igbokwe"
  },
  heroSummary: "I am a Software Engineer, building scalable and secure website applications. When AI is relevant, I use it pragmatically through RAG, prompt engineering, and workflow tooling to improve products and delivery.",
  aboutSummary:
    "I build practical web platforms, APIs, dashboards, and automation tools for businesses that need reliable software without unnecessary complexity.",
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

export const portfolioStats = [
  { value: "4+", label: "years of focused practice" },
  { value: "12+", label: "business workflows shaped" },
  { value: "5+", label: "core service areas" },
  { value: "100%", label: "practical build mindset" }
] satisfies PortfolioStat[];

export const portfolioSkills = [
  { label: "Frontend Development", value: 86 },
  { label: "Backend Development", value: 92 },
  { label: "API Design", value: 88 },
  { label: "Database Workflows", value: 82 },
  { label: "Automation Systems", value: 78 },
  { label: "Software Optimization", value: 74 }
] satisfies PortfolioSkill[];

export const portfolioAboutCards = [
  {
    title: "Software Engineer",
    summary: "I am a Product-Minded Developer, mobile & infrastructure engineer with a foundation in Management Information Systems, focused on building web applications, mobile experiences, and business software that solve real problems. My core work is product development across Python, FastAPI, Django, PHP, Laravel, React, Node.js and modern delivery workflows.",
    image: "/images/portfolio/product-minded-engineer2.png",
    imageAlt: "Product-minded engineering illustration with dashboards, goals, and code.",
    layout: "tall",
    tone: "orange",
    imageFit: "contain",
    imageRatio: "portrait"
  },
  {
    title: "Technical Communication",
    summary: "Explains tradeoffs, decisions, and complex systems clearly across teams.",
    image: "/images/portfolio/technical-communication.png",
    imageAlt: "Technical communication illustration showing a developer explaining system flow.",
    layout: "wide",
    tone: "white",
    imageFit: "cover"
  },
  {
    title: "AI / LLM Tooling",
    summary: "Uses AI and Machine Learning Models to speed up development and automate workflows.",
    image: "/images/portfolio/ai-llm-developer-tooling.png",
    imageAlt: "AI tooling illustration with code, automation flow, and assistant bot.",
    layout: "small",
    tone: "blue",
    imageFit: "contain"
  },
  {
    title: "Monitoring & Observability",
    summary: "Builds visibility into systems to debug and improve reliability.",
    image: "/images/portfolio/observability-and-monitoring.png",
    imageAlt: "Observability illustration with dashboards, metrics, alerts, and code.",
    layout: "small",
    tone: "orange",
    imageFit: "contain"
  },
  {
    title: "Technical Ownership",
    summary: "Takes features from idea to implementation, launch, and iteration.",
    image: "/images/portfolio/end-to-end-ownership2.png",
    imageAlt: "End-to-end ownership illustration showing idea, code, launch, and iteration.",
    layout: "small",
    tone: "white",
    imageFit: "contain",
    imageRatio: "portrait"
  },
  {
    title: "Operational Clarity",
    summary: "Makes work visible, understandable, and easier to move forward. Also organizing messy work into clear steps and shipping it.",
    image: "/images/portfolio/operational-clarity.png",
    imageAlt: "Operational clarity illustration with organized workflow columns and tasks.",
    layout: "wide",
    tone: "navy",
    imageFit: "contain",
    imageRatio: "landscape"
  }
] satisfies PortfolioAboutCard[];

export const portfolioServices = [
  {
    title: "Web Development",
    summary: "Responsive websites and web apps built around real business goals."
  },
  {
    title: "Backend Systems",
    summary: "FastAPI, Laravel-style workflows, authentication, dashboards, and admin tools."
  },
  {
    title: "API Development",
    summary: "Clean endpoints for products, integrations, internal tools, and connected devices."
  },
  {
    title: "Database Management",
    summary: "PostgreSQL and MySQL modeling, data flows, reporting, and maintenance."
  },
  {
    title: "Business Automation",
    summary: "Tools that reduce repeated manual work and keep operations moving."
  },
  {
    title: "Consulting",
    summary: "Focused technical direction before a new platform, feature, or rebuild."
  }
] satisfies PortfolioService[];

export const portfolioNotes = [
  {
    title: "Code Chronicles 001",
    summary: "Short practical notes on building useful software, APIs, and business tools."
  },
  {
    title: "Code Chronicles 002",
    summary: "A space for lessons from client workflows, product decisions, and implementation."
  },
  {
    title: "Code Chronicles 003",
    summary: "Placeholder journal entry for future writing about development and delivery."
  }
] satisfies PortfolioNote[];

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
