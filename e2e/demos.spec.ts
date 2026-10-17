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
      json: {
        doc_id: "doc-1",
        filename: "policy.pdf",
        chunks: 12,
        pages: 4,
        vector_store: "pinecone",
        chunk_strategy: "recursive",
      },
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
  await expect(
    page.getByText("policy.pdf: 12 chunks indexed from 4 pages"),
  ).toBeVisible();

  const input = page.getByRole("textbox", { name: "Ask about your document" });
  await input.fill("How many remote days?");
  await input.press("Enter");
  await expect(page.getByText("Three remote days per week.")).toBeVisible();
});

test("/agent streams steps, cited claims and run cost", async ({ page }) => {
  await mockHealthyBackend(page);
  const jobUrl = "https://jobs.example.com/1";
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
    sources: [jobUrl, "javascript:alert(1)"],
    claims: [
      {
        statement: "The role is fully remote.",
        source: jobUrl,
        quote: "This is a fully remote position.",
      },
      {
        statement: "Unsafe links are dropped.",
        source: "javascript:alert(1)",
        quote: "x",
      },
    ],
  };
  const summary = {
    status: "complete",
    elapsed_seconds: 12.4,
    llm_calls: 3,
    tool_calls: 2,
    repairs: 1,
    usage: {
      input_tokens: 11600,
      output_tokens: 1420,
      cost_usd: 0.0748,
      cost_known: true,
      by_model: {
        "claude-opus-5-5": {
          calls: 3,
          input_tokens: 11600,
          output_tokens: 1420,
          cache_read_tokens: 0,
          cache_write_tokens: 0,
          cost_usd: 0.0748,
          cost_known: true,
        },
      },
    },
  };
  const lines = [
    {
      type: "tool_call",
      tool: "fetch_url",
      message: `Calling fetch_url: ${jobUrl}`,
    },
    {
      type: "tool_result",
      tool: "fetch_url",
      message: "fetch_url returned 100 characters",
      output: "...",
    },
    {
      type: "repair",
      message: "Brief failed validation, asking for a fix (1/2)",
      output: "claims: field required",
    },
    {
      type: "complete",
      message: "Research complete",
      output: JSON.stringify(brief),
    },
    {
      type: "run_summary",
      message: "complete: 3 LLM calls, 2 tool calls, $0.0748",
      data: summary,
    },
  ];
  await page.route(`${E2E_BACKEND}/agent/run`, (route) =>
    route.fulfill({
      headers: { ...CORS, "content-type": "text/plain" },
      body: lines.map((l) => JSON.stringify(l)).join("\n") + "\n",
    }),
  );

  await page.goto("/agent");
  await page.getByLabel("Job posting URL").fill(jobUrl);
  await page.getByRole("button", { name: "Research" }).click();
  await expect(page.getByText(`Calling fetch_url: ${jobUrl}`)).toBeVisible();
  await expect(
    page.getByText("Brief failed validation, asking for a fix (1/2)"),
  ).toBeVisible();
  await expect(page.getByText("Example startup · Remote")).toBeVisible();

  const claim = page.getByRole("listitem").filter({
    hasText: "The role is fully remote.",
  });
  await expect(claim).toContainText("This is a fully remote position.");
  await expect(claim.getByRole("link")).toHaveAttribute("href", jobUrl);
  await expect(page.getByText("Unsafe links are dropped.")).toHaveCount(0);
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);

  const cost = page.getByTestId("run-summary");
  await expect(cost).toContainText("$0.0748");
  await expect(cost).toContainText("11,600 / 1,420");
  await expect(
    cost.getByRole("cell", { name: "claude-opus-5-5" }),
  ).toBeVisible();
  // run_summary is shown as the cost card, not as another step.
  await expect(
    page.getByText("complete: 3 LLM calls, 2 tool calls, $0.0748"),
  ).toHaveCount(0);
});

test("/agent shows a 422 for a non-http(s) job URL inline", async ({
  page,
}) => {
  await mockHealthyBackend(page);
  await page.route(`${E2E_BACKEND}/agent/run`, (route) =>
    route.fulfill({
      status: 422,
      headers: CORS,
      json: {
        detail: [
          {
            type: "value_error",
            loc: ["body", "job_url"],
            msg: "Value error, job_url must be an http(s) URL",
          },
        ],
      },
    }),
  );

  await page.goto("/agent");
  const input = page.getByLabel("Job posting URL");
  await input.fill("ftp://jobs.example.com/1");
  await page.getByRole("button", { name: "Research" }).click();
  const message = page
    .getByRole("alert")
    .filter({ hasText: "starts with http:// or https://" });
  await expect(message).toBeVisible();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("demo-offline")).toHaveCount(0);
});

test("/agent goes offline when the API reports it is unconfigured (503)", async ({
  page,
}) => {
  await mockHealthyBackend(page);
  await page.route(`${E2E_BACKEND}/agent/run`, (route) =>
    route.fulfill({
      status: 503,
      headers: CORS,
      json: {
        detail: "ANTHROPIC_API_KEY and TAVILY_API_KEY must be configured",
      },
    }),
  );
  await page.goto("/agent");
  await page.getByLabel("Job posting URL").fill("https://jobs.example.com/1");
  await page.getByRole("button", { name: "Research" }).click();
  await expect(page.getByTestId("demo-offline")).toContainText(
    "not connected on this deployment",
  );
});

for (const { status, body, title, detail } of [
  {
    status: 415,
    body: {
      error: {
        code: "unsupported_media_type",
        message: "The file is not a PDF (missing %PDF header).",
        request_id: "r1",
      },
    },
    title: "That file type is not supported.",
    detail: "The file is not a PDF (missing %PDF header).",
  },
  {
    status: 422,
    body: {
      error: {
        code: "unprocessable_document",
        message:
          "This PDF is password-protected. Remove the password and upload it again.",
        request_id: "r2",
      },
    },
    title: "This PDF could not be indexed.",
    detail:
      "This PDF is password-protected. Remove the password and upload it again.",
  },
]) {
  test(`/rag shows a ${status} upload error inline`, async ({ page }) => {
    await mockHealthyBackend(page);
    await page.route(`${E2E_BACKEND}/upload`, (route) =>
      route.fulfill({ status, headers: CORS, json: body }),
    );
    await page.goto("/rag");
    await page.getByLabel("Upload a PDF document").setInputFiles({
      name: "locked.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });
    const alert = page.getByRole("alert").filter({ hasText: title });
    await expect(alert).toContainText(detail);
    await expect(page.getByLabel("Upload a PDF document")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    // A rejected upload keeps the demo online and the composer locked.
    await expect(page.getByTestId("demo-offline")).toHaveCount(0);
    await expect(
      page.getByRole("textbox", { name: "Ask about your document" }),
    ).toBeDisabled();
  });
}

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
