"use client";

import type { UIMessage } from "ai";
import { useEffect, useRef } from "react";

import { ChatMessage } from "./ChatMessage";
import { cn } from "@/lib/utils";

const DEFAULT_SUGGESTED_PROMPTS = [
  "What are the main topics covered in this document?",
  "Summarize the key conclusions in a few bullet points",
  "What definitions or terms are explained in the PDF?",
  "Are there any action items or recommendations listed?",
];

export function MessageList({
  messages,
  isLoading,
  onSendText,
  suggestedPrompts = DEFAULT_SUGGESTED_PROMPTS,
  suggestionsDisabled = false,
}: {
  messages: UIMessage[];
  isLoading: boolean;
  onSendText: (text: string) => void;
  suggestedPrompts?: string[];
  /** When true, suggested prompts cannot be sent (e.g. no active document). */
  suggestionsDisabled?: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      role="log"
      aria-label="Conversation"
      aria-busy={isLoading}
      className="mb-4 min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto"
    >
      {messages.length === 0 && (
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Try asking:</p>
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isLoading || suggestionsDisabled}
              onClick={() => onSendText(prompt)}
              className={cn(
                "rounded-lg border border-border/70 bg-card/40 px-3 py-3 text-left text-sm text-foreground transition-colors",
                "hover:border-border hover:bg-muted/40",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {messages.map((m) => (
        <ChatMessage key={m.id} message={m} />
      ))}

      {isLoading && messages.at(-1)?.role !== "assistant" && (
        <div className="animate-pulse rounded-lg border border-border/60 bg-muted/50 p-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Assistant</span>
          <p className="mt-1">Thinking…</p>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
