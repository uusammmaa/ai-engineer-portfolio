/**
 * Backend origins for the live demos. NEXT_PUBLIC_* values are inlined at
 * build time. In development an unset URL falls back to the usual local
 * uvicorn port; in a production build an unset URL means "not deployed", and
 * the demo renders its offline state instead of calling localhost.
 */
const isDev = process.env.NODE_ENV === "development";

function origin(
  value: string | undefined,
  devFallback?: string,
): string | null {
  const trimmed = value?.trim().replace(/\/+$/, "");
  if (trimmed) return trimmed;
  return isDev && devFallback ? devFallback : null;
}

/** FastAPI RAG service (Pinecone + Supabase pgvector). */
export const ragApiBase = origin(
  process.env.NEXT_PUBLIC_API_URL,
  "http://localhost:8000",
);

/** FastAPI research agent. Falls back to the RAG origin when unset. */
export const agentApiBase =
  origin(process.env.NEXT_PUBLIC_AGENT_API_URL) ?? ragApiBase;

export const BACKEND_REPOS = {
  rag: "https://github.com/uusammmaa/rag-api-pgvector-pinecone",
  agent: "https://github.com/uusammmaa/ai-research-agent",
} as const;
