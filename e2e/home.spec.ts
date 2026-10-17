import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("renders hero, projects and contact", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Usama Akram, AI Engineer/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /AI systems that run in production/,
      }),
    ).toBeVisible();

    const projects = page.locator("#projects");
    await expect(
      projects.getByRole("heading", { name: "RAG Document Chat API" }),
    ).toBeVisible();
    await expect(
      projects.getByRole("heading", { name: "AI Research Agent" }),
    ).toBeVisible();
    await expect(
      projects.locator(
        'a[href="https://github.com/uusammmaa/rag-api-pgvector-pinecone"]',
      ),
    ).toBeVisible();
    await expect(
      projects.locator(
        'a[href="https://github.com/uusammmaa/ai-research-agent"]',
      ),
    ).toBeVisible();
    await expect(
      projects.getByText("8/8 mocked eval cases pass"),
    ).toBeVisible();

    await expect(page.locator("#contact")).toBeAttached();
  });

  test("ships SEO metadata", async ({ page, request }) => {
    await page.goto("/");
    const head = page.locator("head");
    await expect(head.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /AI Engineer/,
    );
    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /^https?:\/\/[^/]+\/?$/,
    );
    await expect(head.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /opengraph-image/,
    );
    await expect(head.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(
      page.locator('script[type="application/ld+json"]'),
    ).toBeAttached();

    const og = await request.get("/opengraph-image");
    expect(og.status()).toBe(200);
    expect(og.headers()["content-type"]).toContain("image/png");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("/agent");

    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Sitemap:");
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
  });

  test("mobile menu opens and closes with the keyboard @mobile", async ({
    page,
  }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open menu" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("navigation", { name: "Mobile" });
    await expect(menu.getByRole("link", { name: "Projects" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });
});
