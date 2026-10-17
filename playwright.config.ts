import { defineConfig, devices } from "@playwright/test";
import { E2E_BACKEND } from "./e2e/constants";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Demo backends point at a closed local port, so by default every demo takes
 * its offline path. Tests that need an "online" backend mock it with
 * page.route. NEXT_PUBLIC_* values are inlined at build time, so the build
 * must see these too: the webServer below builds with them, and CI sets the
 * same values on its build step and passes E2E_SKIP_BUILD=1.
 */

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {},
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      grepInvert: /@mobile/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      grep: /@mobile/,
    },
  ],
  webServer: {
    command: process.env.E2E_SKIP_BUILD
      ? `npm run start -- -p ${PORT}`
      : `npm run build && npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      NEXT_PUBLIC_API_URL: E2E_BACKEND,
      NEXT_PUBLIC_AGENT_API_URL: E2E_BACKEND,
      NEXT_PUBLIC_SITE_URL: baseURL,
      CHAT_RATE_LIMIT: "5",
      ANTHROPIC_API_KEY: "",
      OPEN_AI_API_KEY: "",
    },
  },
});
