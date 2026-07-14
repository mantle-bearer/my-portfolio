import { expect, test } from "@playwright/test";

test("admin can sign in and see admin users", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("textbox").first().fill("admin@example.com");
  await page.getByRole("textbox").nth(1).fill("ChangeMe123!");
  const loginResponse = page.waitForResponse((response) =>
    response.url().includes("/api/v1/auth/login")
  );
  await page.getByRole("button", { name: "Log In" }).click();
  await expect((await loginResponse).status()).toBe(200);
  await expect(page.getByRole("heading", { name: /Hi,/ })).toBeVisible({
    timeout: 15000
  });
  await page.getByRole("link", { name: "Users" }).click();
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
});

test("normal user sees items but not admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("textbox").first().fill("user@example.com");
  await page.getByRole("textbox").nth(1).fill("ChangeMe123!");
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page.getByRole("heading", { name: /Hi,/ })).toBeVisible({
    timeout: 15000
  });
  await expect(page.getByRole("link", { name: "Items" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Content" })).toHaveCount(0);
});

test("user can create and delete an item", async ({ page }) => {
  const title = `Playwright item ${Date.now()}`;
  await page.goto("/login");
  await page.getByRole("textbox").first().fill("user@example.com");
  await page.getByRole("textbox").nth(1).fill("ChangeMe123!");
  await page.getByRole("button", { name: "Log In" }).click();
  await page.getByRole("link", { name: "Items" }).click();
  await page.getByRole("button", { name: "Add Item" }).click();
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Description").fill("Created by browser test");
  await page.getByRole("button", { name: "Create item" }).click();
  const row = page.getByRole("row").filter({ hasText: title });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Actions" }).click();
  await row.getByRole("button", { name: "Delete" }).click();
  await expect(row).toHaveCount(0);
});

test("password recovery screen returns safe response", async ({ page }) => {
  await page.goto("/recover-password");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByRole("button", { name: "Recover Password" }).click();
  await expect(page.getByText("If that email is registered")).toBeVisible();
});

test("mobile user can navigate drawer and manage item cards", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const title = `Mobile item ${Date.now()}`;

  await page.goto("/login");
  await page.getByRole("textbox").first().fill("user@example.com");
  await page.getByRole("textbox").nth(1).fill("ChangeMe123!");
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page.getByRole("heading", { name: /Hi,/ })).toBeVisible({
    timeout: 15000
  });

  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);
  await page.getByRole("link", { name: "Items" }).click();
  await expect(page.getByRole("heading", { name: "Items" })).toBeVisible();

  await page.getByRole("button", { name: "Add Item" }).click();
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Description").fill("Created from mobile card test");
  await page.getByRole("button", { name: "Create item" }).click();

  const card = page.locator(".mobile-row-card").filter({ hasText: title });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Actions" }).click();
  await expect(page.getByRole("dialog", { name: "Row actions" })).toBeVisible();
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(card).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test("mobile admin users render card actions inside viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/login");
  await page.getByRole("textbox").first().fill("admin@example.com");
  await page.getByRole("textbox").nth(1).fill("ChangeMe123!");
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page.getByRole("heading", { name: /Hi,/ })).toBeVisible({
    timeout: 15000
  });

  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("link", { name: "Users" }).click();
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(page.locator(".mobile-row-card").first()).toBeVisible();

  await page.locator(".mobile-row-card").first().getByRole("button", { name: "Actions" }).click();
  const sheet = page.getByRole("dialog", { name: "Row actions" });
  await expect(sheet).toBeVisible();
  const box = await sheet.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test("admin can navigate the portfolio CMS screens", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("textbox").first().fill("admin@example.com");
  await page.getByRole("textbox").nth(1).fill("ChangeMe123!");
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page.getByRole("heading", { name: /Hi,/ })).toBeVisible({ timeout: 15000 });

  await page.getByRole("link", { name: "Content" }).click();
  await expect(page.getByRole("heading", { name: "Portfolio content" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Profile and global content" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Preview" })).toHaveAttribute(
    "href",
    "/dashboard/content/preview"
  );

  await page.getByRole("navigation", { name: "Portfolio content screens" }).getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("heading", { name: "About cards" })).toBeVisible();
  await expect(page.locator(".cms-record")).toHaveCount(6);

  await page.getByRole("navigation", { name: "Portfolio content screens" }).getByRole("link", { name: "Contact" }).click();
  await expect(page.getByRole("heading", { name: "Contact inbox" })).toBeVisible();
  const firstContact = page.locator(".cms-contact-item").first();
  if (await firstContact.count()) {
    await expect(firstContact.getByText("Delivery", { exact: true })).toBeVisible();
    await expect(firstContact.getByText("Attempts", { exact: true })).toBeVisible();
    await expect(firstContact.getByText("Last attempt", { exact: true })).toBeVisible();
  }
});
