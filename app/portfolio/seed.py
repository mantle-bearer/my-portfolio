"""Idempotent seed of the current static portfolio into an empty draft."""

# Seed copy and code samples intentionally remain readable as complete string literals.
# ruff: noqa: E501

import hashlib
from datetime import UTC, datetime

from sqlmodel import Session

from app.portfolio.models import (
    AboutCard,
    HeroExpertise,
    MediaAsset,
    PortfolioPost,
    PortfolioProject,
    PortfolioSectionSetting,
    PortfolioService,
    PortfolioSite,
    PortfolioState,
    PostCategory,
    SocialLink,
    TechnologyStack,
)


def seed_portfolio_draft(session: Session) -> bool:
    """Seed today's portfolio only when no draft singleton exists."""
    if session.get(PortfolioSite, "default") is not None:
        return False

    media = {
        key: _static_media(session, filename, path, alt_text)
        for key, filename, path, alt_text in (
            (
                "hero",
                "hero-portrait.png",
                "/images/portfolio/hero-portrait.png",
                "Goodluck Igbokwe, Software Engineer",
            ),
            (
                "profile",
                "profile-passport-picture.jpg",
                "/images/portfolio/profile-passport-picture.jpg",
                "Goodluck Igbokwe",
            ),
            (
                "consultation",
                "book-consultation.jfif",
                "/images/portfolio/book-consultation.jfif",
                "Goodluck Igbokwe offering a 30-minute web consultation",
            ),
            (
                "product",
                "product-minded-engineer2.png",
                "/images/portfolio/product-minded-engineer2.png",
                "Product-minded engineering illustration with dashboards, goals, and code.",
            ),
            (
                "communication",
                "technical-communication.png",
                "/images/portfolio/technical-communication.png",
                "A developer explaining a technical system flow to a team.",
            ),
            (
                "ai",
                "ai-llm-developer-tooling.png",
                "/images/portfolio/ai-llm-developer-tooling.png",
                "AI tooling illustration with code, automation flow, and assistant bot.",
            ),
            (
                "observability",
                "observability-and-monitoring.png",
                "/images/portfolio/observability-and-monitoring.png",
                "Observability dashboards with metrics, alerts, and code.",
            ),
            (
                "ownership",
                "end-to-end-ownership2.png",
                "/images/portfolio/end-to-end-ownership2.png",
                "An engineering workflow moving from idea through launch and iteration.",
            ),
            (
                "operations",
                "operational-clarity.png",
                "/images/portfolio/operational-clarity.png",
                "An organized operational workflow with clear task columns.",
            ),
        )
    }
    session.flush()

    session.add(
        PortfolioSite(
            name="Goodluck Igbokwe",
            role="Software Engineer",
            public_email="igbokwegoodluck8@gmail.com",
            notification_email="igbokwegoodluck8@gmail.com",
            hero_summary=(
                "I am a Software Engineer, building scalable and secure website applications. "
                "When AI is relevant, I use it pragmatically through RAG, prompt engineering, "
                "and workflow tooling to improve products and delivery."
            ),
            hero_portrait_media_id=media["hero"].id,
            profile_media_id=media["profile"].id,
            about_note_title="about-summary.sh",
            about_note_summary=(
                "My workflow: understand the product, communicate clearly, use AI where it "
                "helps, monitor what matters, own the build, and turn messy work into clear steps."
            ),
            consultation_label="Book for Consultation",
            consultation_url="https://calendly.com/igbokwegoodluck8/30min",
            consultation_media_id=media["consultation"].id,
            footer_text="All rights reserved.",
            seo_title="Goodluck Igbokwe | Software Engineer",
            seo_description=(
                "Software engineering portfolio covering web applications, backend systems, "
                "automation, and practical AI tooling."
            ),
            brand_logo_alt="Goodluck Igbokwe",
            robots_directive="index,follow",
            og_title="Goodluck Igbokwe | Software Engineer",
            og_description=(
                "Helping businesses build powerful, scalable web applications that drive real results."
            ),
            twitter_card="summary_large_image",
            twitter_title="Goodluck Igbokwe | Software Engineer",
            twitter_description=(
                "Helping businesses build powerful, scalable web applications that drive real results."
            ),
            theme_color="#06245a",
        )
    )
    session.add(PortfolioState())

    for key, heading, label in (
        ("home", "Goodluck Igbokwe", "Home"),
        ("about", "About Me", "About"),
        ("stacks", "Stacks I Use", "Stack"),
        ("services", "My services", "Services"),
        ("projects", "My Portfolio", "Portfolio"),
        ("notes", "Code Chronicles", "Blog"),
        ("contact", "Contact Me", "Contact"),
    ):
        session.add(
            PortfolioSectionSetting(
                key=key,
                heading=heading,
                navigation_label=label,
                is_visible=True,
            )
        )

    for index, (label, icon_key) in enumerate(
        (
            ("Python", "python"),
            ("FastAPI", "fastapi"),
            ("Django", "django"),
            ("React", "react"),
            ("Laravel", "laravel"),
        )
    ):
        session.add(HeroExpertise(label=label, icon_key=icon_key, sort_order=index))

    for index, (platform, label, url, icon_key) in enumerate(
        (
            ("LinkedIn", "mantle-bearer", "https://linkedin.com/in/mantle-bearer", "linkedin"),
            ("GitHub", "mantle-bearer", "https://github.com/mantle-bearer", "github"),
            ("Email", "igbokwegoodluck8@gmail.com", "mailto:igbokwegoodluck8@gmail.com", "email"),
        )
    ):
        session.add(
            SocialLink(
                platform=platform,
                label=label,
                url=url,
                icon_key=icon_key,
                sort_order=index,
            )
        )

    about_cards = (
        (
            "Software Engineer",
            "I am a Product-Minded Developer, mobile & infrastructure engineer with a foundation in Management Information Systems, focused on building web applications, mobile experiences, and business software that solve real problems. My core work is product development across Python, FastAPI, Django, PHP, Laravel, React, Node.js and modern delivery workflows.",
            "product",
            "tall",
            "orange",
            "contain",
            "portrait",
        ),
        (
            "Technical Communication",
            "Explains tradeoffs, decisions, and complex systems clearly across teams.",
            "communication",
            "wide",
            "white",
            "cover",
            None,
        ),
        (
            "AI / LLM Tooling",
            "Uses AI and Machine Learning Models to speed up development and automate workflows.",
            "ai",
            "small",
            "blue",
            "contain",
            None,
        ),
        (
            "Monitoring & Observability",
            "Builds visibility into systems to debug and improve reliability.",
            "observability",
            "small",
            "orange",
            "contain",
            None,
        ),
        (
            "Code Ownership",
            "Takes features from idea to end-to-end implementation, launch, and iteration.",
            "ownership",
            "small",
            "white",
            "contain",
            "portrait",
        ),
        (
            "Operational Clarity",
            "Makes work visible, understandable, and easier to move forward. Also organizing messy work into clear steps and shipping it.",
            "operations",
            "wide",
            "navy",
            "contain",
            "landscape",
        ),
    )
    for index, (title, summary, media_key, layout, tone, image_fit, image_ratio) in enumerate(
        about_cards
    ):
        session.add(
            AboutCard(
                title=title,
                summary=summary,
                media_id=media[media_key].id,
                image_alt=media[media_key].alt_text,
                layout=layout,
                tone=tone,
                image_fit=image_fit,
                image_ratio=image_ratio,
                sort_order=index,
            )
        )

    for index, stack in enumerate(_stack_seed_data()):
        session.add(TechnologyStack(sort_order=index, **stack))

    for index, (title, summary, icon_key) in enumerate(
        (
            (
                "Web Development",
                "Responsive websites and web apps built around real business goals.",
                "code",
            ),
            (
                "Backend Systems",
                "FastAPI, Laravel-style workflows, authentication, dashboards, and admin tools.",
                "layers",
            ),
            (
                "API Development",
                "Clean endpoints for products, integrations, internal tools, and connected devices.",
                "performance",
            ),
            (
                "Database Management",
                "PostgreSQL and MySQL modeling, data flows, reporting, and maintenance.",
                "database",
            ),
            (
                "Business Automation",
                "Tools that reduce repeated manual work and keep operations moving.",
                "workflow",
            ),
            (
                "Consulting",
                "Focused technical direction before a new platform, feature, or rebuild.",
                "shield",
            ),
        )
    ):
        session.add(
            PortfolioService(title=title, summary=summary, icon_key=icon_key, sort_order=index)
        )

    categories: dict[str, PostCategory] = {}
    for index, name in enumerate(("Backend", "Frontend", "AI Tooling", "Workflow")):
        category = PostCategory(name=name, slug=name.lower().replace(" ", "-"), sort_order=index)
        session.add(category)
        categories[name] = category
    session.flush()

    posts = (
        (
            "Designing APIs that stay easy to use",
            "Backend",
            "2026-07-12",
            "Placeholder notes on building predictable endpoints, clean contracts, and backend flows that product teams can trust.",
        ),
        (
            "Frontend layouts that respect real content",
            "Frontend",
            "2026-07-10",
            "Placeholder lessons on responsive interfaces, spacing systems, and component decisions that keep pages readable.",
        ),
        (
            "Using AI tooling without losing judgment",
            "AI Tooling",
            "2026-07-08",
            "Placeholder thoughts on prompts, RAG, automation helpers, and where human engineering taste still matters.",
        ),
        (
            "Turning messy work into clear shipping steps",
            "Workflow",
            "2026-07-06",
            "Placeholder notes on breaking business ideas into small buildable phases, ownership loops, and launch-ready tasks.",
        ),
        (
            "What reliable dashboards need first",
            "Backend",
            "2026-07-04",
            "Placeholder guidance for data models, permissions, reporting views, and the backend details behind useful dashboards.",
        ),
        (
            "A practical rhythm for technical delivery",
            "Workflow",
            "2026-07-02",
            "Placeholder writing about discovery, implementation, feedback, and the habits that keep software work moving.",
        ),
    )
    for index, (title, category_name, published_on, excerpt) in enumerate(posts):
        slug = _slugify(title)
        session.add(
            PortfolioPost(
                category_id=categories[category_name].id,
                slug=slug,
                title=title,
                excerpt=excerpt,
                body_markdown=f"# {title}\n\n{excerpt}\n\nThis article is ready for editing in the portfolio CMS.",
                published_on=datetime.fromisoformat(published_on).replace(tzinfo=UTC),
                seo_title=title,
                seo_description=excerpt,
                sort_order=index,
            )
        )

    projects = (
        (
            "commerce-platform",
            "Commerce Platform",
            "Placeholder case study for a storefront, checkout, and operations dashboard.",
            ["React", "FastAPI", "Payments"],
            True,
        ),
        (
            "iot-operations",
            "IoT Operations",
            "Placeholder project for connected-device data, monitoring, and business workflows.",
            ["IoT", "API", "Dashboard"],
            False,
        ),
        (
            "business-automation",
            "Business Automation",
            "Placeholder project for reducing manual work with reliable internal tools.",
            ["Automation", "Workflows", "Integrations"],
            False,
        ),
    )
    for index, (slug, title, summary, tags, featured) in enumerate(projects):
        session.add(
            PortfolioProject(
                slug=slug,
                title=title,
                summary=summary,
                case_study_markdown=f"# {title}\n\n{summary}\n\nThis case study is ready for editing in the portfolio CMS.",
                tags=tags,
                is_featured=featured,
                seo_title=title,
                seo_description=summary,
                sort_order=index,
            )
        )

    session.commit()
    return True


def _static_media(
    session: Session,
    filename: str,
    static_path: str,
    alt_text: str,
) -> MediaAsset:
    media = MediaAsset(
        filename=filename,
        mime_type=_mime_for(filename),
        checksum=hashlib.sha256(static_path.encode()).hexdigest(),
        alt_text=alt_text,
        storage_kind="static",
        static_path=static_path,
    )
    session.add(media)
    return media


def _mime_for(filename: str) -> str:
    lowered = filename.lower()
    if lowered.endswith(".png"):
        return "image/png"
    if lowered.endswith(".webp"):
        return "image/webp"
    return "image/jpeg"


def _slugify(value: str) -> str:
    return "-".join(
        "".join(character.lower() if character.isalnum() else " " for character in value).split()
    )


def _stack_seed_data() -> tuple[dict[str, object], ...]:
    return (
        {
            "language": "Python",
            "summary": "For APIs, dashboards, automation, and practical backend workflows.",
            "tools": ["FastAPI", "Django", "Pydantic", "PostgreSQL"],
            "code_snippet": "\n".join(
                (
                    "from fastapi import FastAPI",
                    "",
                    'app = FastAPI(title="Business workflow API")',
                    "",
                    '@app.post("/orders/sync")',
                    "async def sync_orders(payload: OrderSync):",
                    "    result = await service.sync(payload)",
                    '    return {"status": "ready", "items": result.count}',
                )
            ),
            "use_cases": _use_cases(
                (
                    "API systems",
                    "Build clean endpoints for products, dashboards, and integrations.",
                ),
                ("Automation", "Turn repeated business tasks into reliable background workflows."),
                ("Dashboards", "Shape data views that help teams see what is happening."),
                ("Backend apps", "Use Django or FastAPI when a product needs structure and speed."),
            ),
        },
        {
            "language": "PHP",
            "summary": "For Laravel-style business platforms, admin tools, and backend workflows.",
            "tools": ["Laravel", "Eloquent", "Blade", "MySQL"],
            "code_snippet": "Route::post('/invoices/send', SendInvoiceController::class);\n\npublic function __invoke(InvoiceRequest $request)\n{\n    $invoice = Invoice::create($request->validated());\n    SendInvoiceJob::dispatch($invoice);\n    return response()->json(['queued' => true]);\n}",
            "use_cases": _use_cases(
                ("Admin systems", "Create internal panels for managing records and operations."),
                ("Laravel APIs", "Ship structured backend workflows with validation and queues."),
                (
                    "Business logic",
                    "Model orders, invoices, users, roles, and permissions clearly.",
                ),
                (
                    "Database work",
                    "Use migrations and Eloquent patterns to keep data maintainable.",
                ),
            ),
        },
        {
            "language": "Rust",
            "summary": "For performance-minded tooling, reliable services, and CLI experiments.",
            "tools": ["Actix", "Axum", "Tokio", "Serde"],
            "code_snippet": '#[tokio::main]\nasync fn main() -> anyhow::Result<()> {\n    let app = Router::new()\n        .route("/health", get(health_check));\n\n    serve(listener, app).await?;\n    Ok(())\n}',
            "use_cases": _use_cases(
                ("CLI tools", "Build fast utilities for local automation and developer workflows."),
                ("Reliable services", "Explore strongly typed services where correctness matters."),
                ("Data tasks", "Process structured data with predictable memory and speed."),
                ("Systems learning", "Use Rust to deepen performance and architecture instincts."),
            ),
        },
        {
            "language": "JavaScript",
            "summary": "For interactive interfaces, frontend systems, and Node.js workflows.",
            "tools": ["React", "TypeScript", "Node.js", "Vite"],
            "code_snippet": "const workflow = useMemo(() => {\n  return projects.filter((project) => project.ready);\n}, [projects]);\n\nreturn <Dashboard items={workflow} onSelect={openProject} />;",
            "use_cases": _use_cases(
                ("React UI", "Build responsive screens, dashboards, and polished interactions."),
                ("TypeScript", "Keep frontend behavior safer with clear types and contracts."),
                ("Node workflows", "Create scripts, integrations, and lightweight service glue."),
                ("Product screens", "Turn business requirements into usable browser experiences."),
            ),
        },
        {
            "language": "Golang",
            "summary": "For APIs, service workflows, and concurrent backend processes.",
            "tools": ["Gin", "Fiber", "Goroutines", "PostgreSQL"],
            "code_snippet": "func SyncJobs(ctx context.Context, jobs []Job) error {\n    group, ctx := errgroup.WithContext(ctx)\n    for _, job := range jobs {\n        job := job\n        group.Go(func() error { return runJob(ctx, job) })\n    }\n    return group.Wait()\n}",
            "use_cases": _use_cases(
                ("Service APIs", "Build simple backend services with predictable performance."),
                ("Concurrency", "Handle background jobs and parallel workflows cleanly."),
                ("Integrations", "Connect systems where speed and simplicity matter."),
                ("Ops tooling", "Create compact tools for deployment and maintenance tasks."),
            ),
        },
        {
            "language": "C#",
            "summary": "For .NET business applications, typed backend systems, and structured APIs.",
            "tools": [".NET", "ASP.NET Core", "Entity Framework", "SQL Server"],
            "code_snippet": 'app.MapPost("/customers", async (CustomerDto input, AppDb db) =>\n{\n    var customer = Customer.From(input);\n    db.Customers.Add(customer);\n    await db.SaveChangesAsync();\n    return Results.Created($"/customers/{customer.Id}", customer);\n});',
            "use_cases": _use_cases(
                ("Typed APIs", "Create structured endpoints with strong models and contracts."),
                (
                    "Business apps",
                    "Build workflows for records, approvals, and internal operations.",
                ),
                ("Data models", "Use Entity Framework patterns for maintainable persistence."),
                ("Enterprise fit", "Support teams that prefer the .NET ecosystem."),
            ),
        },
    )


def _use_cases(*items: tuple[str, str]) -> list[dict[str, str]]:
    return [{"title": title, "summary": summary} for title, summary in items]
