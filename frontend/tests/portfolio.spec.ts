import { expect, type Page, test } from "@playwright/test";

const portfolioHeadline = "Meet Goodluck Igbokwe";
const portfolioSummary = "A Software Developer building powerful, scalable web applications.";

const sectionLinks = [
  { name: "About", hash: "#home" },
  { name: "Work", hash: "#projects" },
  { name: "Services", hash: "#consultation" },
  { name: "Contact", hash: "#contact" }
] as const;

const responsiveViewports = [
  { name: "mobile", size: { width: 390, height: 844 } },
  { name: "tablet", size: { width: 768, height: 1024 } },
  { name: "desktop", size: { width: 1280, height: 900 } }
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
  await expect(hero.getByRole("link", { name: "Get In Touch" })).toHaveAttribute("href", "#contact");
  await expect(hero.getByRole("link", { name: "View Portfolio" })).toHaveAttribute("href", "#projects");
  await expect(hero.getByLabel("Technical expertise").locator("span")).toHaveCount(5);
  await expect(hero.getByRole("link", { name: "Scroll down to know more" })).toHaveAttribute("href", "#projects");
  await expect(hero.getByRole("img", { name: "Goodluck Igbokwe, Software Developer" })).toHaveAttribute(
    "src",
    "/images/portfolio/personal-portrait2.png"
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

for (const { name, size } of responsiveViewports) {
  test(`portfolio key sections fit without horizontal overflow on ${name}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/portfolio");

    await expect(page.getByRole("heading", { name: portfolioHeadline })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Practical builds for real business workflows." })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Tell me what you want to build." })).toBeAttached();
    await expectNoHorizontalOverflow(page);

    const projectsTop = await page.locator("#projects").evaluate((section) => section.getBoundingClientRect().top);
    expect(projectsTop).toBeLessThanOrEqual(size.height);

    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(page.getByRole("form", { name: "Contact form" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}

test("portfolio navigation exposes profile actions", async ({ page }) => {
  await page.goto("/portfolio");
  const nav = page.locator(".portfolio-nav");
  await expect(nav.getByRole("link", { name: "GitHub profile" })).toHaveAttribute(
    "href",
    "https://github.com/mantle-bearer"
  );
  await expect(nav.getByRole("link", { name: "LinkedIn profile" })).toHaveAttribute(
    "href",
    "https://linkedin.com/in/mantle-bearer"
  );
  await expect(nav.getByRole("link", { name: "Email Goodluck Igbokwe" })).toHaveAttribute("href", /^mailto:/);
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
  await expect(page.getByRole("link", { name: "LinkedIn", exact: true })).toHaveAttribute(
    "href",
    "https://linkedin.com/in/mantle-bearer"
  );
  await expect(page.getByRole("link", { name: "GitHub", exact: true })).toHaveAttribute(
    "href",
    "https://github.com/mantle-bearer"
  );
  await expectNoHorizontalOverflow(page);
});
