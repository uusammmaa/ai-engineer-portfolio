"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { VectorStoreId } from "@/lib/vector-store";

/** Keeps uploads to the hosted demo small; the API itself has no cap. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export type IndexedDocument = {
  doc_id: string;
  filename: string;
  chunks: number;
};

export function FileUpload({
  apiBase,
  vectorStore,
  onIndexed,
  onNetworkError,
}: {
  apiBase: string;
  vectorStore?: VectorStoreId;
  onIndexed?: (doc: IndexedDocument) => void;
  /** Called when the API cannot be reached at all. */
  onNetworkError?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    filename: string;
    chunks: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      setResult(null);
      setError("PDFs are limited to 10 MB in this demo.");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    if (vectorStore) {
      formData.append("vector_store", vectorStore);
    }

    try {
      const res = await fetch(`${apiBase}/upload`, {
        method: "POST",
        body: formData,
      });

      const raw = await res.text();
      if (!res.ok) {
        let detail = raw;
        try {
          const parsed = JSON.parse(raw) as { detail?: unknown };
          if (typeof parsed.detail === "string") detail = parsed.detail;
          else if (Array.isArray(parsed.detail))
            detail = parsed.detail.map(String).join(", ");
        } catch {
          /* use raw */
        }
        setError(detail || `Upload failed (${res.status})`);
        return;
      }

      const data = JSON.parse(raw) as {
        doc_id?: string;
        filename?: string;
        chunks?: number;
      };
      if (
        typeof data.doc_id === "string" &&
        typeof data.filename === "string" &&
        typeof data.chunks === "number"
      ) {
        setResult({ filename: data.filename, chunks: data.chunks });
        onIndexed?.({
          doc_id: data.doc_id,
          filename: data.filename,
          chunks: data.chunks,
        });
      } else {
        setError("Unexpected response from server");
      }
    } catch {
      setError("Could not reach the RAG API.");
      onNetworkError?.();
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card size="sm" className="mb-4 border-border/60 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          <label htmlFor="rag-pdf-upload">Upload a PDF document</label>
        </CardTitle>
        <CardDescription id="rag-pdf-upload-hint">
          Text-based PDFs up to 10 MB. Index the file before asking questions in
          the chat below.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <input
          aria-describedby="rag-pdf-upload-hint"
          id="rag-pdf-upload"
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => void handleUpload(e)}
          disabled={uploading}
          className={cn(
            "block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground",
            "hover:file:bg-primary/90 disabled:opacity-50",
            "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        />
        <div aria-live="polite">
          {uploading && (
            <p className="mt-2 text-sm text-muted-foreground">Processing…</p>
          )}
          {error && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {result && (
            <p className="mt-2 text-sm text-primary">
              {result.filename}: {result.chunks} chunks indexed
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
