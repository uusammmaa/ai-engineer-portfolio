import type { Metadata } from "next";
import { RagDemoPanel } from "@/components/RagDemoPanel";

export const metadata: Metadata = {
  title: "RAG Demo (Supabase pgvector)",
  description:
    "The same RAG pipeline with vectors stored in Postgres via pgvector and similarity search through a SQL RPC.",
  alternates: { canonical: "/rag-supabase" },
};

export default function RagSupabasePage() {
  return (
    <RagDemoPanel
      vectorStore="supabase"
      title="Document Q&A · Supabase pgvector"
      description="Same RAG pipeline with vectors stored in Postgres (pgvector) and similarity via SQL RPC."
    />
  );
}
