import type {
  PortfolioAboutCard,
  PortfolioAboutSummaryNote,
  PortfolioAsset,
  PortfolioContent,
  PortfolioLink,
  PortfolioNote,
  PortfolioProject,
  PortfolioService,
  PortfolioStack
} from "@/types/portfolio";

export type {
  PortfolioAboutCard,
  PortfolioAboutSummaryNote,
  PortfolioAsset,
  PortfolioAssetStatus,
  PortfolioContent,
  PortfolioLink,
  PortfolioNote,
  PortfolioProject,
  PortfolioService,
  PortfolioStack
} from "@/types/portfolio";

export type PortfolioNoteCategory = "Backend" | "Frontend" | "AI Tooling" | "Workflow";

export const portfolioAssets = {
  heroPortrait: {
    key: "heroPortrait",
    label: "Hero portrait",
    src: "/images/portfolio/hero-portrait.png",
    alt: "Goodluck Igbokwe, Software Engineer",
    finalPath: "/images/portfolio/hero-portrait.png",
    status: "final",
    notes: "Framed white-sweater portrait used as the hero composition."
  },
  consultationCard: {
    key: "consultationCard",
    label: "Book a consultation",
    src: "/images/portfolio/book-consultation.jfif",
    alt: "Goodluck Igbokwe offering a 30-minute web consultation",
    finalPath: "/images/portfolio/book-consultation.jfif",
    status: "final",
    notes: "Wide consultation artwork used beneath the contact links."
  },
  profilePortrait: {
    key: "profilePortrait",
    label: "Profile portrait",
    src: "/images/portfolio/profile-passport-picture.jpg",
    alt: "Goodluck Igbokwe",
    finalPath: "/images/portfolio/profile-passport-picture.jpg",
    status: "final",
    notes: "Compact portrait used in portfolio navigation."
  }
} satisfies Record<string, PortfolioAsset>;

export const portfolioProfile = {
  name: "Goodluck Igbokwe",
  role: "Software Engineer",
  email: "igbokwegoodluck8@gmail.com",
  heroTitle: {
    name: "Goodluck Igbokwe"
  },
  heroSummary: "I am a Software Engineer, building scalable and secure website applications. When AI is relevant, I use it pragmatically through RAG, prompt engineering, and workflow tooling to improve products and delivery.",
  heroPrimaryAction: { label: "View my work", href: "#projects" },
  heroSecondaryAction: { label: "Get in touch", href: "#contact" },
  socialLinks: [
    {
      platform: "LinkedIn",
      label: "mantle-bearer",
      href: "https://linkedin.com/in/mantle-bearer",
      iconKey: "linkedin"
    },
    {
      platform: "GitHub",
      label: "mantle-bearer",
      href: "https://github.com/mantle-bearer",
      iconKey: "github"
    },
    {
      platform: "Email",
      label: "igbokwegoodluck8@gmail.com",
      href: "mailto:igbokwegoodluck8@gmail.com",
      iconKey: "email"
    }
  ] satisfies PortfolioLink[]
};

export const portfolioHeroExpertise = [
  { label: "Python", iconKey: "python" },
  { label: "FastAPI", iconKey: "fastapi" },
  { label: "Django", iconKey: "django" },
  { label: "React", iconKey: "react" },
  { label: "Laravel", iconKey: "laravel" }
];

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
    title: "Code Ownership",
    summary: "Takes features from idea to end-to-end implementation, launch, and iteration.",
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

export const portfolioAboutSummaryNote = {
  title: "about-summary.sh",
  summary:
    "My workflow: understand the product, communicate clearly, use AI where it helps, monitor what matters, own the build, and turn messy work into clear steps."
} satisfies PortfolioAboutSummaryNote;

export const portfolioStacks = [
  {
    language: "Python",
    summary: "For APIs, dashboards, automation, and practical backend workflows.",
    tools: ["FastAPI", "Django", "Pydantic", "PostgreSQL"],
    snippet: [
      "from fastapi import FastAPI",
      "",
      "app = FastAPI(title=\"Business workflow API\")",
      "",
      "@app.post(\"/orders/sync\")",
      "async def sync_orders(payload: OrderSync):",
      "    result = await service.sync(payload)",
      "    return {\"status\": \"ready\", \"items\": result.count}"
    ],
    useCases: [
      {
        title: "API systems",
        summary: "Build clean endpoints for products, dashboards, and integrations."
      },
      {
        title: "Automation",
        summary: "Turn repeated business tasks into reliable background workflows."
      },
      {
        title: "Dashboards",
        summary: "Shape data views that help teams see what is happening."
      },
      {
        title: "Backend apps",
        summary: "Use Django or FastAPI when a product needs structure and speed."
      }
    ]
  },
  {
    language: "PHP",
    summary: "For Laravel-style business platforms, admin tools, and backend workflows.",
    tools: ["Laravel", "Eloquent", "Blade", "MySQL"],
    snippet: [
      "Route::post('/invoices/send', SendInvoiceController::class);",
      "",
      "public function __invoke(InvoiceRequest $request)",
      "{",
      "    $invoice = Invoice::create($request->validated());",
      "    SendInvoiceJob::dispatch($invoice);",
      "    return response()->json(['queued' => true]);",
      "}"
    ],
    useCases: [
      {
        title: "Admin systems",
        summary: "Create internal panels for managing records and operations."
      },
      {
        title: "Laravel APIs",
        summary: "Ship structured backend workflows with validation and queues."
      },
      {
        title: "Business logic",
        summary: "Model orders, invoices, users, roles, and permissions clearly."
      },
      {
        title: "Database work",
        summary: "Use migrations and Eloquent patterns to keep data maintainable."
      }
    ]
  },
  {
    language: "Rust",
    summary: "For performance-minded tooling, reliable services, and CLI experiments.",
    tools: ["Actix", "Axum", "Tokio", "Serde"],
    snippet: [
      "#[tokio::main]",
      "async fn main() -> anyhow::Result<()> {",
      "    let app = Router::new()",
      "        .route(\"/health\", get(health_check));",
      "",
      "    serve(listener, app).await?;",
      "    Ok(())",
      "}"
    ],
    useCases: [
      {
        title: "CLI tools",
        summary: "Build fast utilities for local automation and developer workflows."
      },
      {
        title: "Reliable services",
        summary: "Explore strongly typed services where correctness matters."
      },
      {
        title: "Data tasks",
        summary: "Process structured data with predictable memory and speed."
      },
      {
        title: "Systems learning",
        summary: "Use Rust to deepen performance and architecture instincts."
      }
    ]
  },
  {
    language: "JavaScript",
    summary: "For interactive interfaces, frontend systems, and Node.js workflows.",
    tools: ["React", "TypeScript", "Node.js", "Vite"],
    snippet: [
      "const workflow = useMemo(() => {",
      "  return projects.filter((project) => project.ready);",
      "}, [projects]);",
      "",
      "return <Dashboard items={workflow} onSelect={openProject} />;"
    ],
    useCases: [
      {
        title: "React UI",
        summary: "Build responsive screens, dashboards, and polished interactions."
      },
      {
        title: "TypeScript",
        summary: "Keep frontend behavior safer with clear types and contracts."
      },
      {
        title: "Node workflows",
        summary: "Create scripts, integrations, and lightweight service glue."
      },
      {
        title: "Product screens",
        summary: "Turn business requirements into usable browser experiences."
      }
    ]
  },
  {
    language: "Golang",
    summary: "For APIs, service workflows, and concurrent backend processes.",
    tools: ["Gin", "Fiber", "Goroutines", "PostgreSQL"],
    snippet: [
      "func SyncJobs(ctx context.Context, jobs []Job) error {",
      "    group, ctx := errgroup.WithContext(ctx)",
      "    for _, job := range jobs {",
      "        job := job",
      "        group.Go(func() error { return runJob(ctx, job) })",
      "    }",
      "    return group.Wait()",
      "}"
    ],
    useCases: [
      {
        title: "Service APIs",
        summary: "Build simple backend services with predictable performance."
      },
      {
        title: "Concurrency",
        summary: "Handle background jobs and parallel workflows cleanly."
      },
      {
        title: "Integrations",
        summary: "Connect systems where speed and simplicity matter."
      },
      {
        title: "Ops tooling",
        summary: "Create compact tools for deployment and maintenance tasks."
      }
    ]
  },
  {
    language: "C#",
    summary: "For .NET business applications, typed backend systems, and structured APIs.",
    tools: [".NET", "ASP.NET Core", "Entity Framework", "SQL Server"],
    snippet: [
      "app.MapPost(\"/customers\", async (CustomerDto input, AppDb db) =>",
      "{",
      "    var customer = Customer.From(input);",
      "    db.Customers.Add(customer);",
      "    await db.SaveChangesAsync();",
      "    return Results.Created($\"/customers/{customer.Id}\", customer);",
      "});"
    ],
    useCases: [
      {
        title: "Typed APIs",
        summary: "Create structured endpoints with strong models and contracts."
      },
      {
        title: "Business apps",
        summary: "Build workflows for records, approvals, and internal operations."
      },
      {
        title: "Data models",
        summary: "Use Entity Framework patterns for maintainable persistence."
      },
      {
        title: "Enterprise fit",
        summary: "Support teams that prefer the .NET ecosystem."
      }
    ]
  }
] satisfies PortfolioStack[];

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

export const portfolioNoteCategories = [
  "All",
  "Backend",
  "Frontend",
  "AI Tooling",
  "Workflow"
] satisfies readonly ("All" | PortfolioNoteCategory)[];

export const portfolioNotes = [
  {
    slug: "designing-apis-that-stay-easy-to-use",
    title: "Designing APIs that stay easy to use",
    category: "Backend",
    excerpt: "Placeholder notes on building predictable endpoints, clean contracts, and backend flows that product teams can trust.",
    date: "2026-07-12",
    href: "/blog/designing-apis-that-stay-easy-to-use",
    body_markdown: "# Designing APIs that stay easy to use\n\nA practical article draft ready for editing in the CMS."
  },
  {
    slug: "frontend-layouts-that-respect-real-content",
    title: "Frontend layouts that respect real content",
    category: "Frontend",
    excerpt: "Placeholder lessons on responsive interfaces, spacing systems, and component decisions that keep pages readable.",
    date: "2026-07-10",
    href: "/blog/frontend-layouts-that-respect-real-content",
    body_markdown: "# Frontend layouts that respect real content\n\nA practical article draft ready for editing in the CMS."
  },
  {
    slug: "using-ai-tooling-without-losing-judgment",
    title: "Using AI tooling without losing judgment",
    category: "AI Tooling",
    excerpt: "Placeholder thoughts on prompts, RAG, automation helpers, and where human engineering taste still matters.",
    date: "2026-07-08",
    href: "/blog/using-ai-tooling-without-losing-judgment",
    body_markdown: "# Using AI tooling without losing judgment\n\nA practical article draft ready for editing in the CMS."
  },
  {
    slug: "turning-messy-work-into-clear-shipping-steps",
    title: "Turning messy work into clear shipping steps",
    category: "Workflow",
    excerpt: "Placeholder notes on breaking business ideas into small buildable phases, ownership loops, and launch-ready tasks.",
    date: "2026-07-06",
    href: "/blog/turning-messy-work-into-clear-shipping-steps",
    body_markdown: "# Turning messy work into clear shipping steps\n\nA practical article draft ready for editing in the CMS."
  },
  {
    slug: "what-reliable-dashboards-need-first",
    title: "What reliable dashboards need first",
    category: "Backend",
    excerpt: "Placeholder guidance for data models, permissions, reporting views, and the backend details behind useful dashboards.",
    date: "2026-07-04",
    href: "/blog/what-reliable-dashboards-need-first",
    body_markdown: "# What reliable dashboards need first\n\nA practical article draft ready for editing in the CMS."
  },
  {
    slug: "a-practical-rhythm-for-technical-delivery",
    title: "A practical rhythm for technical delivery",
    category: "Workflow",
    excerpt: "Placeholder writing about discovery, implementation, feedback, and the habits that keep software work moving.",
    date: "2026-07-02",
    href: "/blog/a-practical-rhythm-for-technical-delivery",
    body_markdown: "# A practical rhythm for technical delivery\n\nA practical article draft ready for editing in the CMS."
  }
] satisfies PortfolioNote[];

export const portfolioProjects = [
  {
    slug: "commerce-platform",
    title: "Commerce Platform",
    summary: "Placeholder case study for a storefront, checkout, and operations dashboard.",
    case_study_markdown: "# Commerce Platform\n\nA placeholder case study ready for editing in the CMS.",
    tags: ["React", "FastAPI", "Payments"],
    featured: true
  },
  {
    slug: "iot-operations",
    title: "IoT Operations",
    summary: "Placeholder project for connected-device data, monitoring, and business workflows.",
    case_study_markdown: "# IoT Operations\n\nA placeholder case study ready for editing in the CMS.",
    tags: ["IoT", "API", "Dashboard"]
  },
  {
    slug: "business-automation",
    title: "Business Automation",
    summary: "Placeholder project for reducing manual work with reliable internal tools.",
    case_study_markdown: "# Business Automation\n\nA placeholder case study ready for editing in the CMS.",
    tags: ["Automation", "Workflows", "Integrations"]
  }
] satisfies PortfolioProject[];

export const portfolioSections = {
  home: { heading: "Goodluck Igbokwe", navigationLabel: "Home", isVisible: true },
  about: { heading: "About Me", navigationLabel: "About", isVisible: true },
  stacks: { heading: "Stacks I Use", navigationLabel: "Stack", isVisible: true },
  services: { heading: "My services", navigationLabel: "Services", isVisible: true },
  projects: { heading: "My Portfolio", navigationLabel: "Portfolio", isVisible: true },
  notes: { heading: "Code Chronicles", navigationLabel: "Blog", isVisible: true },
  contact: { heading: "Contact Me", navigationLabel: "Contact", isVisible: true }
};

export const portfolioNavigation = [
  { key: "home", label: "Home", href: "#home", isVisible: true },
  { key: "about", label: "About", href: "#about", isVisible: true },
  { key: "stacks", label: "Stack", href: "#stacks", isVisible: true },
  { key: "services", label: "Services", href: "#services", isVisible: true },
  { key: "projects", label: "Portfolio", href: "#projects", isVisible: true },
  { key: "notes", label: "Blog", href: "#notes", isVisible: true },
  { key: "contact", label: "Contact", href: "#contact", isVisible: true }
];

export const staticPortfolioContent: PortfolioContent = {
  profile: portfolioProfile,
  assets: {
    heroPortrait: portfolioAssets.heroPortrait,
    profilePortrait: portfolioAssets.profilePortrait,
    consultationCard: portfolioAssets.consultationCard
  },
  sections: portfolioSections,
  navigation: portfolioNavigation,
  heroExpertise: portfolioHeroExpertise,
  aboutCards: portfolioAboutCards,
  aboutSummaryNote: portfolioAboutSummaryNote,
  stacks: portfolioStacks,
  services: portfolioServices,
  projects: portfolioProjects,
  noteCategories: [...portfolioNoteCategories],
  notes: portfolioNotes,
  consultation: {
    label: "Book for Consultation",
    url: "https://calendly.com/igbokwegoodluck8/30min"
  },
  footerText: "All rights reserved.",
  seo: {
    title: "Goodluck Igbokwe | Software Engineer",
    description:
      "Software engineering portfolio covering web applications, backend systems, automation, and practical AI tooling.",
    image: "/images/portfolio/hero-portrait.png",
    ogTitle: "Goodluck Igbokwe | Software Engineer",
    ogDescription: "Helping businesses build powerful, scalable web applications that drive real results.",
    twitterCard: "summary_large_image",
    twitterTitle: "Goodluck Igbokwe | Software Engineer",
    twitterDescription: "Helping businesses build powerful, scalable web applications that drive real results.",
    twitterImage: "/images/portfolio/hero-portrait.png",
    themeColor: "#06245a"
  },
  branding: {
    name: "Goodluck Igbokwe",
    logoAlt: "Goodluck Igbokwe",
    markLight: { src: "/assets/images/brand-mark.svg", alt: "Goodluck Igbokwe" },
    markDark: { src: "/assets/images/brand-mark.svg", alt: "Goodluck Igbokwe" },
    favicon: { src: "/assets/images/brand-mark.svg", alt: "Goodluck Igbokwe" }
  }
};
