import { expect, type Page, test } from "@playwright/test";

const portfolioHeadline = "Goodluck Igbokwe";
const portfolioSummary =
  "I am a Software Engineer, building scalable and secure website applications. When AI is relevant, I use it pragmatically through RAG, prompt engineering, and workflow tooling to improve products and delivery.";

const sectionLinks = [
  { name: "Home", hash: "#home" },
  { name: "About", hash: "#about" },
  { name: "Stack", hash: "#stacks" },
  { name: "Services", hash: "#services" },
  { name: "Portfolio", hash: "#projects" },
  { name: "Blog", hash: "#notes" },
  { name: "Contact", hash: "#contact" }
] as const;

const responsiveViewports = [
  { name: "mobile", size: { width: 390, height: 844 } },
  { name: "tablet", size: { width: 768, height: 1024 } },
  { name: "desktop", size: { width: 1280, height: 900 } }
] as const;

const aboutCards = [
  { title: "Software Engineer", image: "/images/portfolio/product-minded-engineer2.png" },
  { title: "Technical Communication", image: "/images/portfolio/technical-communication.png" },
  { title: "AI / LLM Tooling", image: "/images/portfolio/ai-llm-developer-tooling.png" },
  { title: "Monitoring & Observability", image: "/images/portfolio/observability-and-monitoring.png" },
  { title: "Code Ownership", image: "/images/portfolio/end-to-end-ownership2.png" },
  { title: "Operational Clarity", image: "/images/portfolio/operational-clarity.png" }
] as const;

const noteCategories = ["All", "Backend", "Frontend", "AI Tooling", "Workflow"] as const;

const noteCards = [
  { title: "Designing APIs that stay easy to use", category: "Backend", date: "July 12, 2026" },
  { title: "Frontend layouts that respect real content", category: "Frontend", date: "July 10, 2026" },
  { title: "Using AI tooling without losing judgment", category: "AI Tooling", date: "July 8, 2026" },
  { title: "Turning messy work into clear shipping steps", category: "Workflow", date: "July 6, 2026" },
  { title: "What reliable dashboards need first", category: "Backend", date: "July 4, 2026" },
  { title: "A practical rhythm for technical delivery", category: "Workflow", date: "July 2, 2026" }
] as const;

const stackTabs = ["Python", "PHP", "Rust", "JavaScript", "Golang", "C#"] as const;

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const documentWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body?.scrollWidth ?? 0
        );
        const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
        return documentWidth - viewportWidth;
      })
    )
    .toBeLessThanOrEqual(1);
}

async function expectHashTargetInViewport(page: Page, hash: string) {
  await expect
    .poll(
      async () =>
        page.evaluate((targetHash) => {
          const target = document.querySelector(targetHash);
          if (!target) return { exists: false, visible: false };

          const rect = target.getBoundingClientRect();
          return {
            exists: true,
            visible: rect.bottom > 0 && rect.top < window.innerHeight
          };
        }, hash),
      { message: `${hash} should exist and be reachable in the viewport` }
    )
    .toEqual({ exists: true, visible: true });
}

test("portfolio root exposes accessible landmarks and anchor targets", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("main")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: portfolioHeadline
    })
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Portfolio navigation" })).toBeVisible();

  const anchorHrefs = await page.locator('a[href^="#"]').evaluateAll((links) =>
    Array.from(new Set(links.map((link) => link.getAttribute("href")).filter(Boolean)))
  );

  for (const { hash } of sectionLinks) {
    expect(anchorHrefs).toContain(hash);
    await expect(page.locator(hash)).toHaveCount(1);
  }
});

test("portfolio hero stays focused on its primary actions", async ({ page }) => {
  await page.goto("/");

  const hero = page.locator("#home");
  await expect(hero.getByRole("heading", { name: portfolioHeadline })).toBeVisible();
  await expect(hero.getByText(portfolioSummary)).toBeVisible();
  await expect(hero.getByRole("link", { name: "View my work" })).toHaveAttribute("href", "#projects");
  await expect(hero.getByRole("link", { name: "Get in touch" })).toHaveAttribute("href", "#contact");
  await expect(hero.getByLabel("Technical expertise").locator("span")).toHaveCount(5);
  await expect(hero.getByRole("img", { name: "Goodluck Igbokwe, Software Engineer" })).toHaveAttribute(
    "src",
    "/images/portfolio/hero-portrait.png"
  );
  await expect(hero.locator(".portfolio-kicker")).toHaveCount(0);
  await expect(hero.locator(".hero-socials")).toHaveCount(0);
  await expect(hero.locator(".portfolio-rings")).toHaveCount(0);
  await expect(hero.locator(".tech-backdrop")).toHaveCount(0);
});

test("portfolio navigation anchors reach their sections", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Portfolio navigation" });

  for (const { name, hash } of sectionLinks) {
    await nav.getByRole("link", { name }).click();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(hash);
    await expectHashTargetInViewport(page, hash);
    await expectNoHorizontalOverflow(page);
  }
});

test("portfolio about section renders branded bento cards", async ({ page }) => {
  await page.goto("/#about");

  const about = page.locator("#about");
  await expect(about.getByRole("heading", { name: "About Me" })).toBeVisible();
  await expect(about.locator(".about-bento-card")).toHaveCount(6);

  for (const { title, image } of aboutCards) {
    const card = about.locator(".about-bento-card").filter({ hasText: title });
    await expect(card.getByRole("heading", { name: title })).toBeVisible();
    await expect(card.getByRole("img")).toHaveAttribute("src", image);
  }

  await expect(about.locator(".about-bento-card").filter({ hasText: "Software Engineer" })).toHaveClass(
    /image-ratio-portrait/
  );
  await expect(about.locator(".about-bento-card").filter({ hasText: "Code Ownership" })).toHaveClass(
    /image-ratio-portrait/
  );
  await expect(about.locator(".about-bento-card").filter({ hasText: "Operational Clarity" })).toHaveClass(
    /image-ratio-landscape/
  );
  await expect(about.getByLabel("About summary note")).toContainText("about-summary.sh");
  await expect(about.getByLabel("About summary note")).toContainText("My workflow:");

  await expect(about.locator(".stat-card")).toHaveCount(0);
  await expect(about.locator(".skill-meter")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("portfolio stacks section switches language panels", async ({ page }) => {
  await page.goto("/#stacks");

  const stacks = page.locator("#stacks");
  await expect(stacks.getByRole("heading", { name: "Stacks I Use", exact: true })).toBeVisible();

  for (const tab of stackTabs) {
    await expect(stacks.getByRole("tab", { name: tab, exact: true })).toBeVisible();
  }

  await expect(stacks.getByRole("tab", { name: "Python", exact: true })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(stacks.getByRole("tabpanel")).toContainText("FastAPI");
  await expect(stacks.getByLabel("Python frameworks and tools")).toContainText("Django");
  await expect(stacks.getByLabel("Python code snippet", { exact: true })).toContainText(
    "from fastapi import FastAPI"
  );

  await stacks.getByRole("tab", { name: "Rust", exact: true }).click();
  await expect(stacks.getByRole("tab", { name: "Rust", exact: true })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(stacks.getByRole("tabpanel")).toContainText("performance-minded tooling");
  await expect(stacks.getByLabel("Rust frameworks and tools")).toContainText("Tokio");
  await expect(stacks.getByLabel("Rust frameworks and tools")).toContainText("Serde");
  await expect(stacks.getByLabel("Rust code snippet", { exact: true })).toContainText(
    "#[tokio::main]"
  );

  await stacks.getByRole("tab", { name: "JavaScript", exact: true }).click();
  await expect(stacks.getByRole("tabpanel")).toContainText("interactive interfaces");
  await expect(stacks.getByLabel("JavaScript frameworks and tools")).toContainText("React");
  await expect(stacks.getByLabel("JavaScript frameworks and tools")).toContainText("TypeScript");
  await expect(stacks.getByLabel("JavaScript code snippet", { exact: true })).toContainText(
    "const workflow = useMemo"
  );
  await expectNoHorizontalOverflow(page);
});

test("portfolio code chronicles filters placeholder articles", async ({ page }) => {
  await page.goto("/#notes");

  const notes = page.locator("#notes");
  await expect(notes.getByRole("heading", { name: "Code Chronicles", exact: true })).toBeVisible();

  for (const category of noteCategories) {
    await expect(notes.getByRole("button", { name: category, exact: true })).toBeVisible();
  }

  await expect(notes.getByRole("button", { name: "All", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(notes.getByText("6 articles")).toBeVisible();
  await expect(notes.locator(".note-card")).toHaveCount(6);

  for (const { title, category, date } of noteCards) {
    const card = notes.locator(".note-card").filter({ hasText: title });
    await expect(card.getByRole("heading", { name: title })).toBeVisible();
    await expect(card.getByText(category, { exact: true })).toBeVisible();
    await expect(card.getByText(date)).toBeVisible();
    await expect(card.getByRole("link", { name: `Read ${title}` })).toHaveAttribute("href", /\/blog\//);
  }

  await notes.getByRole("button", { name: "Backend", exact: true }).click();
  await expect(notes.getByRole("button", { name: "Backend", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(notes.getByText("2 articles")).toBeVisible();
  await expect(notes.locator(".note-card")).toHaveCount(2);
  await expect(notes.getByRole("heading", { name: "Frontend layouts that respect real content" })).toHaveCount(0);

  await notes.getByRole("button", { name: "AI Tooling", exact: true }).click();
  await expect(notes.getByText("1 article")).toBeVisible();
  await expect(notes.locator(".note-card")).toHaveCount(1);
  await expect(notes.getByRole("heading", { name: "Using AI tooling without losing judgment" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

for (const { name, size } of responsiveViewports) {
  test(`portfolio key sections fit without horizontal overflow on ${name}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/");

    await expect(page.getByRole("heading", { name: portfolioHeadline })).toBeVisible();
    await expect(page.getByRole("heading", { name: "About Me" })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Stacks I Use", exact: true })).toBeAttached();
    await expect(page.getByRole("heading", { name: "My services" })).toBeAttached();
    await expect(page.getByRole("heading", { name: "My Portfolio" })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Code Chronicles", exact: true })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Contact me" })).toBeAttached();
    await expectNoHorizontalOverflow(page);

    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(page.getByRole("form", { name: "Contact form" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}

test("portfolio navigation exposes theme controls without social shortcuts", async ({ page }) => {
  await page.goto("/");
  const nav = page.locator(".portfolio-nav");
  await expect(nav.getByRole("button", { name: /switch to dark mode|switch to light mode/i })).toBeVisible();
  await expect(nav.getByRole("link", { name: /profile/i })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Email Goodluck Igbokwe" })).toHaveCount(0);
});

test("portfolio mobile menu opens, closes, and reaches anchors", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: /portfolio menu/i });
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");

  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");

  const mobileNav = page.getByRole("navigation", { name: "Mobile portfolio navigation" });
  await expect(mobileNav).toBeVisible();
  for (const { name } of sectionLinks) {
    await expect(mobileNav.getByRole("link", { name })).toBeVisible();
  }

  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Mobile portfolio navigation" })).toHaveCount(0);
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");

  await menuButton.click();
  await page
    .getByRole("navigation", { name: "Mobile portfolio navigation" })
    .getByRole("link", { name: "Contact" })
    .click();
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("#contact");
  await expectHashTargetInViewport(page, "#contact");
  await expect(page.getByRole("navigation", { name: "Mobile portfolio navigation" })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("portfolio contact form exposes expected fields and actions", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/#contact");

  const form = page.getByRole("form", { name: "Contact form" });
  await expect(form).toBeVisible();
  await expect(form.getByLabel("Name")).toBeVisible();
  await expect(form.getByLabel("Email")).toHaveAttribute("type", "email");
  await expect(form.getByLabel("Subject")).toBeVisible();
  await expect(form.getByLabel("Message")).toBeVisible();
  await expect(form.getByRole("button", { name: "Send message" })).toHaveAttribute("type", "submit");

  await expect(page.getByRole("link", { name: /@/ })).toHaveAttribute("href", /^mailto:/);
  await expect(page.locator(`a[href="https://linkedin.com/in/mantle-bearer"]`)).toHaveCount(1);
  await expect(page.locator(`a[href="https://github.com/mantle-bearer"]`)).toHaveCount(1);
  await expect(page.locator(`a[href="https://linkedin.com/in/mantle-bearer"]`)).toHaveAttribute(
    "href",
    "https://linkedin.com/in/mantle-bearer"
  );
  await expect(page.locator(`a[href="https://github.com/mantle-bearer"]`)).toHaveAttribute(
    "href",
    "https://github.com/mantle-bearer"
  );

  const consultationCard = page.getByRole("complementary", { name: "Book a consultation" });
  await expect(consultationCard).toBeVisible();
  await expect(
    consultationCard.getByRole("img", { name: "Goodluck Igbokwe offering a 30-minute web consultation" })
  ).toHaveAttribute("src", "/images/portfolio/book-consultation.jfif");

  const consultationLink = consultationCard.getByRole("link", { name: "Book for Consultation" });
  await expect(consultationLink).toHaveAttribute("href", "https://calendly.com/igbokwegoodluck8/30min");
  await expect(consultationLink).toHaveAttribute("target", "_blank");
  await expect(consultationLink).toHaveAttribute("rel", "noopener noreferrer");

  const [asideBox, formBox] = await Promise.all([
    page.locator(".contact-aside").boundingBox(),
    form.boundingBox()
  ]);
  expect(asideBox).not.toBeNull();
  expect(formBox).not.toBeNull();
  expect(asideBox!.height).toBeLessThanOrEqual(formBox!.height + 1);
  await expectNoHorizontalOverflow(page);
});

test("legacy portfolio route redirects and preserves its anchor", async ({ page }) => {
  await page.goto("/portfolio#about");
  await expect.poll(() => new URL(page.url()).pathname).toBe("/");
  await expect.poll(() => new URL(page.url()).hash).toBe("#about");
  await expect(page.locator("#about")).toBeVisible();
});

test("contact form stores a direct website enquiry", async ({ page }) => {
  await page.goto("/#contact");
  const form = page.getByRole("form", { name: "Contact form" });
  await form.getByLabel("Name").fill("Q");
  await form.getByLabel("Email").fill("browser@example.com");
  await form.getByLabel("Subject").fill("Hi");
  await form.getByLabel("Message").fill("Call");
  const request = page.waitForResponse((response) =>
    response.url().includes("/api/v1/portfolio/contact")
  );
  await form.getByRole("button", { name: "Send message" }).click();
  await expect((await request).status()).toBe(202);
  await expect(form.getByText("Message received. I will get back to you soon.")).toBeVisible();
});

test("contact form explains invalid fields before sending", async ({ page }) => {
  await page.goto("/#contact");
  const form = page.getByRole("form", { name: "Contact form" });
  await form.getByLabel("Name").fill("   ");
  await form.getByLabel("Email").fill("not-an-email");
  await form.getByLabel("Subject").fill("   ");
  await form.getByLabel("Message").fill("   ");
  await form.getByRole("button", { name: "Send message" }).click();

  await expect(form.getByText("Please enter your name.")).toBeVisible();
  await expect(form.getByText("Please enter a valid email address.")).toBeVisible();
  await expect(form.getByText("Please enter a subject.")).toBeVisible();
  await expect(form.getByText("Please enter a message.")).toBeVisible();
});

test("runtime manifest uses valid application URLs", async ({ page }) => {
  const manifestWarnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" && message.text().includes("Manifest:")) {
      manifestWarnings.push(message.text());
    }
  });
  await page.goto("/");
  const manifest = await page.evaluate(async () => {
    const href = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.href;
    if (!href) return null;
    return fetch(href).then((response) => response.json());
  });

  expect(manifest).not.toBeNull();
  expect(new URL(manifest.start_url).origin).toBe(new URL(page.url()).origin);
  expect(new URL(manifest.scope).origin).toBe(new URL(page.url()).origin);
  expect(new URL(manifest.icons[0].src).origin).toBe(new URL(page.url()).origin);
  expect(manifestWarnings).toEqual([]);
});

test("placeholder posts and projects have internal detail pages", async ({ page }) => {
  await page.goto("/blog/designing-apis-that-stay-easy-to-use");
  await expect(page.getByRole("heading", { name: "Designing APIs that stay easy to use" }).first()).toBeVisible();
  await expect(page.locator(".markdown-content")).toContainText("practical article draft");

  await page.goto("/projects/commerce-platform");
  await expect(page.getByRole("heading", { name: "Commerce Platform" }).first()).toBeVisible();
  await expect(page.locator(".markdown-content")).toContainText("placeholder case study");
});
