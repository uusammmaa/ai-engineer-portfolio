import { expect, test, type Page } from "@playwright/test";
import { E2E_BACKEND } from "./constants";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};

/** Pretend the FastAPI backend is up by answering its /health probe. */
async function mockHealthyBackend(page: Page) {
  await page.route(`${E2E_BACKEND}/health`, (route) =>
    route.fulfill({ status: 200, headers: CORS, json: { status: "ok" } }),
  );
}

const DEMOS = [
  {
    path: "/coach",
    heading: "Personal Branding Assistant",
    service: "coach API",
  },
  { path: "/rag", heading: "Document Q&A · Pinecone", service: "RAG API" },
  {
    path: "/rag-supabase",
    heading: "Document Q&A · Supabase pgvector",
    service: "RAG API",
  },
  {
    path: "/agent",
    heading: "Job Research Agent",
    service: "research agent API",
  },
];

for (const demo of DEMOS) {
  test(`${demo.path} shows the offline state with an example`, async ({
    page,
  }) => {
    await page.goto(demo.path);
    await expect(
      page.getByRole("heading", { level: 1, name: demo.heading }),
    ).toBeVisible();

    const offline = page.getByTestId("demo-offline");
    await expect(offline).toBeVisible();
    await expect(
      offline.getByRole("heading", { name: `Demo offline: ${demo.service}` }),
    ).toBeVisible();
    await expect(
      offline.getByRole("heading", { name: "Example output" }),
    ).toBeVisible();

    const current = page
      .getByRole("navigation", { name: "Demos" })
      .locator('[aria-current="page"]');
    await expect(current).toHaveAttribute("href", demo.path);
  });
}

test("/coach streams a reply when the API is configured", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        json: { online: true, models: ["claude-haiku-4-5-20251001"] },
      });
    }
    const chunks = [
      { type: "start", messageId: "m1" },
      { type: "text-start", id: "t1" },
      {
        type: "text-delta",
        id: "t1",
        delta: "Lead with the title recruiters search for.",
      },
      { type: "text-end", id: "t1" },
      { type: "finish" },
    ];
    return route.fulfill({
      headers: {
        "content-type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body:
        chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") +
        "data: [DONE]\n\n",
    });
  });

  await page.goto("/coach");
  const input = page.getByRole("textbox", { name: "Message the coach" });
  await input.fill("Help with my headline");
  await input.press("Enter");
  await expect(
    page.getByText("Lead with the title recruiters search for."),
  ).toBeVisible();
  await expect(page.getByTestId("demo-offline")).toHaveCount(0);
});

test("/coach shows rate-limit errors inline", async ({ page }) => {
  await page.route("**/api/chat", (route) =>
    route.request().method() === "GET"
      ? route.fulfill({
          json: { online: true, models: ["claude-haiku-4-5-20251001"] },
        })
      : route.fulfill({
          status: 429,
          json: {
            error: "Too many messages. Try again in 42s.",
            code: "rate_limited",
          },
        }),
  );
  await page.goto("/coach");
  const input = page.getByRole("textbox", { name: "Message the coach" });
  await input.fill("hello");
  await input.press("Enter");
  await expect(
    page.getByRole("alert").filter({ hasText: "Too many messages" }),
  ).toHaveText("Too many messages. Try again in 42s.");
});

test("/rag uploads and answers when the backend is up", async ({ page }) => {
  await mockHealthyBackend(page);
  await page.route(`${E2E_BACKEND}/upload`, (route) =>
    route.fulfill({
      headers: CORS,
      json: { doc_id: "doc-1", filename: "policy.pdf", chunks: 12 },
    }),
  );
  await page.route(`${E2E_BACKEND}/chat`, (route) =>
    route.fulfill({
      headers: { ...CORS, "content-type": "text/plain" },
      body: "Three remote days per week.",
    }),
  );

  await page.goto("/rag");
  await page.getByLabel("Upload a PDF document").setInputFiles({
    name: "policy.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 test"),
  });
  await expect(page.getByText("policy.pdf: 12 chunks indexed")).toBeVisible();

  const input = page.getByRole("textbox", { name: "Ask about your document" });
  await input.fill("How many remote days?");
  await input.press("Enter");
  await expect(page.getByText("Three remote days per week.")).toBeVisible();
});

test("/agent streams steps and a brief when the backend is up", async ({
  page,
}) => {
  await mockHealthyBackend(page);
  const brief = {
    role: "AI Engineer",
    company: "Example startup",
    location: "Remote",
    tech_stack: ["Python"],
    key_requirements: ["Ship RAG"],
    company_summary: "Builds developer tools.",
    culture_signals: [],
    talking_points: ["Eval harness"],
    red_flags: [],
    sources: [],
  };
  const lines = [
    {
      type: "tool_call",
      tool: "fetch_url",
      message: "Calling fetch_url: https://jobs.example.com/1",
    },
    {
      type: "tool_result",
      tool: "fetch_url",
      message: "fetch_url returned 100 characters",
      output: "...",
    },
    {
      type: "complete",
      message: "Research complete",
      output: JSON.stringify(brief),
    },
  ];
  await page.route(`${E2E_BACKEND}/agent/run`, (route) =>
    route.fulfill({
      headers: { ...CORS, "content-type": "text/plain" },
      body: lines.map((l) => JSON.stringify(l)).join("\n") + "\n",
    }),
  );

  await page.goto("/agent");
  await page.getByLabel("Job posting URL").fill("https://jobs.example.com/1");
  await page.getByRole("button", { name: "Research" }).click();
  await expect(
    page.getByText("Calling fetch_url: https://jobs.example.com/1"),
  ).toBeVisible();
  await expect(page.getByText("Example startup · Remote")).toBeVisible();
});

test("a backend that fails mid-session flips the demo offline", async ({
  page,
}) => {
  await mockHealthyBackend(page);
  await page.route(`${E2E_BACKEND}/agent/run`, (route) =>
    route.abort("connectionrefused"),
  );

  await page.goto("/agent");
  await page.getByLabel("Job posting URL").fill("https://jobs.example.com/1");
  await page.getByRole("button", { name: "Research" }).click();
  await expect(page.getByTestId("demo-offline")).toBeVisible();
});
