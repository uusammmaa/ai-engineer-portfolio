"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useMemo, useState } from "react";

import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { DemoChecking, DemoOffline } from "@/components/DemoOffline";
import { FileUpload } from "@/components/FileUpload";
import { MessageList } from "@/components/MessageList";
import { Button } from "@/components/ui/button";
import { BACKEND_REPOS, ragApiBase } from "@/lib/backends";
import { RAG_EXAMPLE } from "@/lib/demo-recordings";
import {
  healthOk,
  isNetworkError,
  useServiceStatus,
} from "@/lib/use-service-status";
import type { VectorStoreId } from "@/lib/vector-store";

const RAG_SERVICE = "RAG API";

function textFromUserMessage(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("");
}

function RagExample() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-primary">
        {RAG_EXAMPLE.filename}: {RAG_EXAMPLE.chunks} chunks indexed
      </p>
      {RAG_EXAMPLE.messages.map((m) => (
        <ChatMessage key={m.id} message={m} />
      ))}
    </div>
  );
}

export function RagDemoPanel({
  vectorStore,
  title,
  description,
}: {
  vectorStore: VectorStoreId;
  title: string;
  description?: string;
}) {
  const service = useServiceStatus(
    ragApiBase ? `${ragApiBase}/health` : null,
    healthOk,
  );
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState(0);

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: `${ragApiBase ?? ""}/chat`,
        prepareSendMessagesRequest: ({ messages }) => {
          const lastUser = [...messages]
            .reverse()
            .find((m) => m.role === "user");
          const question = lastUser ? textFromUserMessage(lastUser) : "";
          return {
            body: {
              question,
              doc_id: activeDocId ?? "",
              vector_store: vectorStore,
            },
          };
        },
      }),
    [activeDocId, vectorStore],
  );

  const chatId = activeDocId
    ? `rag-${vectorStore}-${activeDocId}`
    : `rag-${vectorStore}-pending`;

  const { messages, sendMessage, status, setMessages, error, clearError } =
    useChat({
      id: chatId,
      transport,
      onError(err) {
        if (isNetworkError(err)) service.markOffline();
      },
    });
  const [input, setInput] = useState("");

  const isLoading = status === "submitted" || status === "streaming";

  function send(text: string) {
    clearError();
    sendMessage({ text });
  }

  function submitMessage() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    send(text);
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col px-4 py-6 md:px-8 md:py-8">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl tracking-wide text-foreground md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {service.status === "online" && messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              clearError();
              setMessages([]);
              setActiveDocId(null);
              setUploadKey((k) => k + 1);
            }}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            New Chat
          </Button>
        )}
      </header>

      {service.status === "checking" ? (
        <DemoChecking service={RAG_SERVICE} />
      ) : service.reason ? (
        <DemoOffline
          service={RAG_SERVICE}
          reason={service.reason}
          repoUrl={BACKEND_REPOS.rag}
          onRetry={service.retry}
        >
          <RagExample />
        </DemoOffline>
      ) : (
        <>
          <FileUpload
            key={uploadKey}
            apiBase={ragApiBase ?? ""}
            vectorStore={vectorStore}
            onIndexed={(doc) => setActiveDocId(doc.doc_id)}
            onNetworkError={() => service.markOffline()}
          />

          <MessageList
            messages={messages}
            isLoading={isLoading}
            suggestionsDisabled={!activeDocId}
            onSendText={send}
          />

          {error && !isNetworkError(error) ? (
            <p role="alert" className="mb-3 text-sm text-destructive">
              The RAG API could not answer that question. Please try again.
            </p>
          ) : null}

          <ChatInput
            value={input}
            onChange={setInput}
            onSend={submitMessage}
            isLoading={isLoading}
            disabled={!activeDocId}
            label="Ask about your document"
            placeholder={
              activeDocId
                ? "Ask a question about your uploaded document… (Enter to send, Shift+Enter for new line)"
                : "Upload a PDF above, then ask a question…"
            }
          />
        </>
      )}
    </div>
  );
}
