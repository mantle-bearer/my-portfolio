export type PortfolioAssetStatus = "placeholder" | "final";

export type PortfolioAsset = {
  key: string;
  label: string;
  src: string;
  finalPath: string;
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

export type PortfolioService = {
  title: string;
  summary: string;
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

export type PortfolioAboutSummaryNote = {
  title: string;
  summary: string;
};

export type PortfolioNoteCategory = "Backend" | "Frontend" | "AI Tooling" | "Workflow";

export type PortfolioNote = {
  title: string;
  category: PortfolioNoteCategory;
  excerpt: string;
  date: string;
  href: string;
};

export type PortfolioStack = {
  language: string;
  summary: string;
  tools: string[];
  snippet: string[];
  useCases: Array<{
    title: string;
    summary: string;
  }>;
};

export const portfolioAssets = {
  heroPortrait: {
    key: "heroPortrait",
    label: "Hero portrait",
    src: "/images/portfolio/hero-portrait.png",
    finalPath: "/images/portfolio/hero-portrait.png",
    status: "final",
    notes: "Framed white-sweater portrait used as the hero composition."
  },
  consultationCard: {
    key: "consultationCard",
    label: "Book a consultation",
    src: "/images/portfolio/book-consultation.jfif",
    finalPath: "/images/portfolio/book-consultation.jfif",
    status: "final",
    notes: "Wide consultation artwork used beneath the contact links."
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
  socialLinks: [
    { label: "LinkedIn", href: "https://linkedin.com/in/mantle-bearer" },
    { label: "GitHub", href: "https://github.com/mantle-bearer" },
    { label: "Email", href: "mailto:igbokwegoodluck8@gmail.com" }
  ] satisfies PortfolioLink[]
};

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
    title: "Designing APIs that stay easy to use",
    category: "Backend",
    excerpt: "Placeholder notes on building predictable endpoints, clean contracts, and backend flows that product teams can trust.",
    date: "2026-07-12",
    href: "#contact"
  },
  {
    title: "Frontend layouts that respect real content",
    category: "Frontend",
    excerpt: "Placeholder lessons on responsive interfaces, spacing systems, and component decisions that keep pages readable.",
    date: "2026-07-10",
    href: "#contact"
  },
  {
    title: "Using AI tooling without losing judgment",
    category: "AI Tooling",
    excerpt: "Placeholder thoughts on prompts, RAG, automation helpers, and where human engineering taste still matters.",
    date: "2026-07-08",
    href: "#contact"
  },
  {
    title: "Turning messy work into clear shipping steps",
    category: "Workflow",
    excerpt: "Placeholder notes on breaking business ideas into small buildable phases, ownership loops, and launch-ready tasks.",
    date: "2026-07-06",
    href: "#contact"
  },
  {
    title: "What reliable dashboards need first",
    category: "Backend",
    excerpt: "Placeholder guidance for data models, permissions, reporting views, and the backend details behind useful dashboards.",
    date: "2026-07-04",
    href: "#contact"
  },
  {
    title: "A practical rhythm for technical delivery",
    category: "Workflow",
    excerpt: "Placeholder writing about discovery, implementation, feedback, and the habits that keep software work moving.",
    date: "2026-07-02",
    href: "#contact"
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
