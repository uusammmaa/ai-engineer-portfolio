import type { Metadata } from "next";
import { RagDemoPanel } from "@/components/RagDemoPanel";

export const metadata: Metadata = {
  title: "RAG Demo (Pinecone)",
  description:
    "Upload a PDF and ask questions answered only from that document. FastAPI, OpenAI embeddings, Pinecone and Claude.",
  alternates: { canonical: "/rag" },
};

export default function RagPage() {
  return (
    <RagDemoPanel
      vectorStore="pinecone"
      title="Document Q&A · Pinecone"
      description="PDF upload, embeddings, and retrieval against a Pinecone index."
    />
  );
}
