export type PortfolioAssetStatus = "placeholder" | "final";

export type PortfolioAsset = {
  key?: string;
  label?: string;
  src: string;
  alt?: string;
  finalPath?: string;
  status?: PortfolioAssetStatus;
  notes?: string;
};

export type PortfolioProject = {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  case_study_markdown?: string;
  tags: string[];
  image?: string | null;
  href?: string;
  external_url?: string | null;
  live_url?: string | null;
  repository_url?: string | null;
  featured?: boolean;
  seo_title?: string;
  seo_description?: string;
};

export type PortfolioLink = {
  platform?: string;
  label: string;
  href: string;
  iconKey?: string;
};

export type PortfolioService = {
  id?: string;
  title: string;
  summary: string;
  iconKey?: string;
};

export type PortfolioAboutCard = {
  id?: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  layout: "tall" | "wide" | "small";
  tone: "navy" | "white" | "blue" | "orange";
  imageFit: "contain" | "cover";
  imageRatio?: "portrait" | "landscape" | null;
};

export type PortfolioAboutSummaryNote = {
  title: string;
  summary: string;
};

export type PortfolioNote = {
  id?: string;
  slug?: string;
  title: string;
  category: string;
  categorySlug?: string;
  excerpt: string;
  body_markdown?: string;
  date: string;
  href: string;
  cover_image?: string | null;
  seo_title?: string;
  seo_description?: string;
};

export type PortfolioStack = {
  id?: string;
  language: string;
  summary: string;
  tools: string[];
  snippet: string[];
  useCases: Array<{
    title: string;
    summary: string;
  }>;
};

export type PortfolioSection = {
  heading: string;
  navigationLabel: string;
  summary?: string | null;
  isVisible: boolean;
};

export type PortfolioContent = {
  profile: {
    name: string;
    role: string;
    email: string;
    heroTitle: { name: string };
    heroSummary: string;
    heroPrimaryAction: PortfolioLink;
    heroSecondaryAction: PortfolioLink;
    socialLinks: PortfolioLink[];
  };
  assets: {
    heroPortrait: PortfolioAsset;
    profilePortrait: PortfolioAsset;
    consultationCard: PortfolioAsset;
  };
  sections: Record<string, PortfolioSection>;
  navigation: Array<{
    key: string;
    label: string;
    href: string;
    isVisible: boolean;
  }>;
  heroExpertise: Array<{ label: string; iconKey: string }>;
  aboutCards: PortfolioAboutCard[];
  aboutSummaryNote: PortfolioAboutSummaryNote;
  stacks: PortfolioStack[];
  services: PortfolioService[];
  projects: PortfolioProject[];
  noteCategories: string[];
  notes: PortfolioNote[];
  consultation: { label: string; url: string };
  footerText: string;
  seo: {
    title: string;
    description: string;
    image?: string | null;
    canonicalUrl?: string;
    robots?: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string | null;
    themeColor?: string;
  };
  branding?: {
    name: string;
    logoAlt: string;
    logoLight?: PortfolioAsset;
    logoDark?: PortfolioAsset;
    markLight?: PortfolioAsset;
    markDark?: PortfolioAsset;
    favicon?: PortfolioAsset;
  };
};

export type PortfolioPublication = {
  id: string;
  version: number;
  checksum: string;
  published_by_id: string;
  restored_from_id?: string | null;
  published_at: string;
};

export type PortfolioContentResponse = {
  publication: PortfolioPublication | null;
  content: PortfolioContent | null;
  source: "published" | "draft" | "none";
};
