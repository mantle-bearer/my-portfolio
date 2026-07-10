import { expect, type Page, test } from "@playwright/test";

const portfolioHeadline = "Goodluck Igbokwe";
const portfolioSummary =
  "I am a Software Engineer, building scalable and secure website applications. When AI is relevant, I use it pragmatically through RAG, prompt engineering, and workflow tooling to improve products and delivery.";

const sectionLinks = [
  { name: "Home", hash: "#home" },
  { name: "About", hash: "#about" },
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
  { title: "Technical Ownership", image: "/images/portfolio/end-to-end-ownership2.png" },
  { title: "Operational Clarity", image: "/images/portfolio/operational-clarity.png" }
] as const;

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

test("portfolio route exposes accessible landmarks and anchor targets", async ({ page }) => {
  await page.goto("/portfolio");

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
  await page.goto("/portfolio");

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
  await page.goto("/portfolio");

  const nav = page.getByRole("navigation", { name: "Portfolio navigation" });

  for (const { name, hash } of sectionLinks) {
    await nav.getByRole("link", { name }).click();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(hash);
    await expectHashTargetInViewport(page, hash);
    await expectNoHorizontalOverflow(page);
  }
});

test("portfolio about section renders branded bento cards", async ({ page }) => {
  await page.goto("/portfolio#about");

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
  await expect(about.locator(".about-bento-card").filter({ hasText: "Technical Ownership" })).toHaveClass(
    /image-ratio-portrait/
  );
  await expect(about.locator(".about-bento-card").filter({ hasText: "Operational Clarity" })).toHaveClass(
    /image-ratio-landscape/
  );

  await expect(about.locator(".stat-card")).toHaveCount(0);
  await expect(about.locator(".skill-meter")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

for (const { name, size } of responsiveViewports) {
  test(`portfolio key sections fit without horizontal overflow on ${name}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/portfolio");

    await expect(page.getByRole("heading", { name: portfolioHeadline })).toBeVisible();
    await expect(page.getByRole("heading", { name: "About Me" })).toBeAttached();
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
  await page.goto("/portfolio");
  const nav = page.locator(".portfolio-nav");
  await expect(nav.getByRole("button", { name: /switch to dark mode|switch to light mode/i })).toBeVisible();
  await expect(nav.getByRole("link", { name: /profile/i })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Email Goodluck Igbokwe" })).toHaveCount(0);
});

test("portfolio mobile menu opens, closes, and reaches anchors", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/portfolio");

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
  await page.goto("/portfolio#contact");

  const form = page.getByRole("form", { name: "Contact form" });
  await expect(form).toBeVisible();
  await expect(form.getByLabel("Name")).toBeVisible();
  await expect(form.getByLabel("Email")).toHaveAttribute("type", "email");
  await expect(form.getByLabel("Subject")).toBeVisible();
  await expect(form.getByLabel("Message")).toBeVisible();
  await expect(form.getByRole("button", { name: "Open email draft" })).toHaveAttribute("type", "submit");

  await expect(page.getByRole("link", { name: /@/ })).toHaveAttribute("href", /^mailto:/);
  await expect(form.getByText(/Direct website sending is coming later/)).toBeVisible();
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
  await expectNoHorizontalOverflow(page);
});
