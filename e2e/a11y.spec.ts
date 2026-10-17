import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/coach", "/rag", "/rag-supabase", "/agent"];

test.use({ reducedMotion: "reduce" });

for (const path of ROUTES) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    if (path !== "/") {
      await expect(page.getByTestId("demo-offline")).toBeVisible();
    }

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({
        id: v.id,
        help: v.help,
        targets: v.nodes.map((n) => n.target.join(" ")).slice(0, 5),
      }));
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}
