import { BACKEND_REPOS } from "@/lib/backends";

export type Project = {
  name: string;
  repoUrl: string;
  /** One line: what it does for the user. */
  outcome: string;
  stack: string[];
  eval: {
    /** Short tag shown before the headline, e.g. "mock eval". */
    label: string;
    headline: string;
    detail: string;
  };
  demos: { href: string; label: string }[];
};

export const PROJECTS: Project[] = [
  {
    name: "RAG Document Chat API",
    repoUrl: BACKEND_REPOS.rag,
    outcome:
      "Upload a text PDF and get streamed answers grounded only in that document, on Pinecone or Postgres pgvector (local or Supabase) behind one API.",
    stack: [
      "FastAPI",
      "Claude Haiku 5.5",
      "OpenAI embeddings",
      "Pinecone",
      "pgvector (psycopg)",
      "Docker",
    ],
    eval: {
      label: "mock eval",
      headline: "Recursive chunking, k=5: recall@5 0.798, MRR 0.577",
      detail:
        "Best of fixed, recursive and heading-based chunking at k=3 and k=5, scored on 38 labelled questions over 3 public-domain PDFs. Mock mode runs offline in CI with lexical embeddings; live numbers come from make eval-live.",
    },
    demos: [
      { href: "/rag", label: "Pinecone demo" },
      { href: "/rag-supabase", label: "pgvector demo" },
    ],
  },
  {
    name: "AI Research Agent",
    repoUrl: BACKEND_REPOS.agent,
    outcome:
      "Turns a job posting URL into a structured research brief where every claim cites a retrieved source and quote, streaming each tool call and the run's token cost.",
    stack: [
      "FastAPI",
      "Claude tool use",
      "Tavily search",
      "Pydantic",
      "OpenTelemetry",
      "NDJSON streaming",
    ],
    eval: {
      label: "evals + tests",
      headline:
        "18 mock evals incl. citation-accuracy and groundedness checks, 105 tests",
      detail:
        "Scripted runs exercise retries, model fallback, brief repair and timeouts for real, and three cases plant a fabricated quote, a misattributed source or a changed number that the scorer must flag. A live suite runs against current postings.",
    },
    demos: [{ href: "/agent", label: "Agent demo" }],
  },
];
