import { BACKEND_REPOS } from "@/lib/backends";

export type Project = {
  name: string;
  repoUrl: string;
  /** One line: what it does for the user. */
  outcome: string;
  stack: string[];
  eval: {
    headline: string;
    detail: string;
    /** "measured" = a number the repo's own harness produces today. */
    status: "measured" | "in-progress";
  };
  demos: { href: string; label: string }[];
};

export const PROJECTS: Project[] = [
  {
    name: "RAG Document Chat API",
    repoUrl: BACKEND_REPOS.rag,
    outcome:
      "Upload a text PDF and get streamed answers grounded only in that document, on Pinecone or Supabase pgvector behind one API.",
    stack: [
      "FastAPI",
      "Claude Haiku 4.5",
      "OpenAI embeddings",
      "Pinecone",
      "Supabase pgvector",
      "LangChain splitters",
    ],
    eval: {
      headline: "Eval suite in progress",
      detail:
        "Retrieval is scoped per document (top 5 chunks) and the prompt refuses when the context lacks the answer. Retrieval hit rate and groundedness scoring are next.",
      status: "in-progress",
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
      "Turns a job posting URL into a structured research brief (stack, requirements, culture signals, talking points, red flags) while streaming every tool call.",
    stack: [
      "FastAPI",
      "Claude tool use",
      "Tavily search",
      "BeautifulSoup",
      "Pydantic",
      "NDJSON streaming",
    ],
    eval: {
      headline: "8/8 mocked eval cases pass",
      detail:
        "Covers fenced and prose-wrapped JSON, malformed output, missing fields, the iteration cap, unexpected stop reasons and tool-error recovery. A live suite runs the real loop against current postings.",
      status: "measured",
    },
    demos: [{ href: "/agent", label: "Agent demo" }],
  },
];
