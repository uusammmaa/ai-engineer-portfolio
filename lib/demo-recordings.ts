import type { UIMessage } from "ai";

import type { AgentStep, ResearchBrief, RunSummary } from "@/lib/agent-types";

/**
 * Example outputs shown when a demo backend is offline. Each one matches the
 * exact response shape its API returns, so swapping in a real captured run
 * only means replacing the values below.
 */

function text(id: string, role: UIMessage["role"], body: string): UIMessage {
  return { id, role, parts: [{ type: "text", text: body }] };
}

export const COACH_EXAMPLE: UIMessage[] = [
  text(
    "coach-example-user",
    "user",
    "Help me write a compelling LinkedIn headline",
  ),
  text(
    "coach-example-assistant",
    "assistant",
    `A formula that works for engineers: **role + specialty + proof**.

**Three options to adapt**

1. *Backend Engineer | Python and Go | Building payment APIs that serve 2M requests a day*
2. *Senior Frontend Engineer | React and TypeScript | Cut checkout load time by 40%*
3. *AI Engineer | RAG and agentic systems | Shipping LLM features that hold up in production*

**Tips**

- Lead with the title recruiters actually search for, not a creative one.
- A concrete number beats any adjective.
- Stay under about 120 characters so search results do not truncate it.
- Skip filler like "passionate" or "ninja".

Want me to draft one from your current role and a recent win?`,
  ),
];

export const RAG_EXAMPLE = {
  filename: "remote-work-policy.pdf",
  chunks: 38,
  messages: [
    text(
      "rag-example-user",
      "user",
      "How many remote days are allowed per week, and who approves exceptions?",
    ),
    text(
      "rag-example-assistant",
      "assistant",
      `Based on the document:

- **Remote days:** employees may work remotely up to **three days per week**, with Tuesday and Thursday set as in-office collaboration days.
- **Exceptions:** requests beyond three days go to the employee's **direct manager**, and anything longer than **four consecutive weeks** also needs sign-off from **People Operations**.

The policy does not say whether unused remote days roll over to the next week.`,
    ),
  ] satisfies UIMessage[],
};

const AGENT_JOB_URL = "https://jobs.example.com/senior-ai-engineer";
const AGENT_BLOG_URL = "https://blog.example.com/evals-before-upgrades";
const AGENT_REVIEWS_URL = "https://reviews.example.com/developer-platform";

export const AGENT_EXAMPLE: {
  jobUrl: string;
  steps: AgentStep[];
  brief: ResearchBrief;
  summary: RunSummary;
} = {
  jobUrl: AGENT_JOB_URL,
  steps: [
    {
      type: "tool_call",
      tool: "fetch_url",
      message: `Calling fetch_url: ${AGENT_JOB_URL}`,
    },
    {
      type: "tool_result",
      tool: "fetch_url",
      message: "fetch_url returned 6412 characters",
      output:
        "Senior AI Engineer (Remote, EMEA/APAC). Build retrieval and agent features for our developer platform. Python, FastAPI, Postgres, pgvector...",
    },
    {
      type: "tool_call",
      tool: "search_web",
      message:
        "Calling search_web: developer platform startup engineering culture",
    },
    {
      type: "tool_result",
      tool: "search_web",
      message: "search_web returned 4180 characters",
      output:
        "Engineering blog: how we run evals before every model upgrade. Series B announcement. Remote-first, async written culture...",
    },
    {
      type: "tool_call",
      tool: "search_web",
      message: "Calling search_web: developer platform startup reviews on-call",
    },
    {
      type: "tool_result",
      tool: "search_web",
      message: "search_web returned 3025 characters",
      output:
        "Reviews mention fast shipping cadence, strong documentation culture, and a recent on-call rotation change...",
    },
  ],
  brief: {
    role: "Senior AI Engineer",
    company: "Series B developer-platform startup (anonymised)",
    location: "Remote, EMEA or APAC time zones",
    tech_stack: [
      "Python",
      "FastAPI",
      "Postgres",
      "pgvector",
      "Claude API",
      "TypeScript",
    ],
    key_requirements: [
      "4+ years shipping backend services in Python",
      "Hands-on experience with retrieval pipelines and evaluation",
      "Comfort owning features end to end, including on-call",
    ],
    company_summary:
      "A remote-first developer platform that recently raised a Series B and is adding retrieval and agent features to its core product. The engineering blog emphasises evals before every model change.",
    culture_signals: [
      "Async, writing-first communication",
      "Public engineering blog with eval write-ups",
      "Small teams with end-to-end ownership",
    ],
    talking_points: [
      "Walk through a RAG pipeline you built on pgvector and how you measured retrieval quality",
      "Show an agent eval harness that covers malformed output and tool failures",
      "Mention experience streaming agent steps to a UI for transparency",
    ],
    red_flags: [
      "Recent on-call rotation change; ask how incidents are staffed",
    ],
    sources: [AGENT_JOB_URL, AGENT_BLOG_URL, AGENT_REVIEWS_URL],
    claims: [
      {
        statement: "The role is remote for EMEA and APAC time zones.",
        source: AGENT_JOB_URL,
        quote: "Senior AI Engineer (Remote, EMEA/APAC).",
      },
      {
        statement:
          "The engineering team runs evals before every model upgrade.",
        source: AGENT_BLOG_URL,
        quote: "how we run evals before every model upgrade",
      },
      {
        statement: "The on-call rotation changed recently.",
        source: AGENT_REVIEWS_URL,
        quote: "a recent on-call rotation change",
      },
    ],
  },
  // Priced like the backend does: claude-opus-5-5 at $4 / $20 per million tokens.
  summary: {
    status: "complete",
    elapsed_seconds: 41.3,
    llm_calls: 4,
    tool_calls: 3,
    repairs: 0,
    usage: {
      input_tokens: 15_800,
      output_tokens: 1_610,
      cost_usd: 0.0954,
      cost_known: true,
      by_model: {
        "claude-opus-5-5": {
          calls: 4,
          input_tokens: 15_800,
          output_tokens: 1_610,
          cache_read_tokens: 0,
          cache_write_tokens: 0,
          cost_usd: 0.0954,
          cost_known: true,
        },
      },
    },
  },
};
