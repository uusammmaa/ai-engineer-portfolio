"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useMemo, useState } from "react";

import { ChatInput } from "@/components/ChatInput";
import { FileUpload } from "@/components/FileUpload";
import { MessageList } from "@/components/MessageList";
import { Button } from "@/components/ui/button";
import type { VectorStoreId } from "@/lib/vector-store";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function textFromUserMessage(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("");
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
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState(0);

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: `${apiBase}/chat`,
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

  const { messages, sendMessage, status, setMessages } = useChat({
    id: chatId,
    transport,
  });
  const [input, setInput] = useState("");

  const isLoading = status === "submitted" || status === "streaming";

  function submitMessage() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage({ text });
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
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
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

      <FileUpload
        key={uploadKey}
        vectorStore={vectorStore}
        onIndexed={(doc) => setActiveDocId(doc.doc_id)}
      />

      <MessageList
        messages={messages}
        isLoading={isLoading}
        suggestionsDisabled={!activeDocId}
        onSendText={(text) => sendMessage({ text })}
      />

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={submitMessage}
        isLoading={isLoading}
        disabled={!activeDocId}
        placeholder={
          activeDocId
            ? "Ask a question about your uploaded document… (Enter to send, Shift+Enter for new line)"
            : "Upload a PDF above, then ask a question…"
        }
      />
    </div>
  );
}
