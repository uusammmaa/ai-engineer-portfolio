export const DEMO_NAV = [
  {
    href: "/",
    label: "Home",
    description: "Portfolio, projects and contact",
  },
  { href: "/coach", label: "Coach", description: "Next.js + streaming LLM" },
  {
    href: "/rag",
    label: "RAG · Pinecone",
    description: "FastAPI RAG + PDF + Pinecone",
  },
  {
    href: "/rag-supabase",
    label: "RAG · Supabase",
    description: "Same pipeline + pgvector in Postgres",
  },
  {
    href: "/agent",
    label: "Research Agent",
    description: "FastAPI agent + tool use + streaming steps",
  },
] as const;
