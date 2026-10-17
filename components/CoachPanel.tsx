"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatModelSelect } from "@/components/ChatModelSelect";
import { DemoChecking, DemoOffline } from "@/components/DemoOffline";
import { MessageList } from "@/components/MessageList";
import { Button } from "@/components/ui/button";
import { CHAT_LIMITS, parseChatError } from "@/lib/chat-limits";
import {
  CHAT_MODELS,
  DEFAULT_CHAT_MODEL_ID,
  type ChatModelId,
} from "@/lib/chat-models";
import { COACH_EXAMPLE } from "@/lib/demo-recordings";
import {
  isNetworkError,
  useServiceStatus,
  type ProbeReader,
} from "@/lib/use-service-status";

const COACH_SUGGESTED_PROMPTS = [
  "Help me write a compelling LinkedIn headline",
  "Review my GitHub profile and suggest improvements",
  "Suggest 3 portfolio project ideas to showcase my skills",
  "How do I position myself for remote senior dev roles?",
];

const ALL_MODEL_IDS = CHAT_MODELS.map((m) => m.id);

const readCoachStatus: ProbeReader<{ models: ChatModelId[] }> = async (res) => {
  if (!res.ok) return "unreachable";
  const body = (await res.json()) as { online?: boolean; models?: unknown };
  const configured = Array.isArray(body.models) ? body.models : [];
  const models = ALL_MODEL_IDS.filter((id) => configured.includes(id));
  return body.online && models.length > 0 ? { models } : "unconfigured";
};

export function CoachPanel() {
  const service = useServiceStatus("/api/chat", readCoachStatus);
  const availableModels = service.data?.models ?? ALL_MODEL_IDS;

  const [preferredModel, setPreferredModel] = useState<ChatModelId>(
    DEFAULT_CHAT_MODEL_ID,
  );
  const selectedModel = availableModels.includes(preferredModel)
    ? preferredModel
    : availableModels[0];

  const { messages, sendMessage, status, setMessages, error, clearError } =
    useChat({
      onError(err) {
        const parsed = parseChatError(err);
        if (parsed?.code === "offline") service.markOffline("unconfigured");
        else if (!parsed && isNetworkError(err)) service.markOffline();
      },
    });
  const [input, setInput] = useState("");

  const isLoading = status === "submitted" || status === "streaming";
  const chatRequestBody = { model: selectedModel };
  const chatError = error
    ? (parseChatError(error)?.error ??
      "Something went wrong reaching the model. Please try again.")
    : null;

  function send(text: string) {
    clearError();
    sendMessage({ text }, { body: chatRequestBody });
  }

  function submitMessage() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    send(text);
  }

  const header = (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-foreground md:text-4xl">
            Personal Branding Assistant
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Streaming career coach for software engineers, built on the Vercel
            AI SDK.
          </p>
        </div>
        {service.status === "online" ? (
          <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <span id="coach-model-label" className="whitespace-nowrap">
              Model
            </span>
            <ChatModelSelect
              aria-labelledby="coach-model-label"
              models={availableModels}
              value={selectedModel}
              onChange={setPreferredModel}
              disabled={isLoading}
            />
          </div>
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
          }}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          New Chat
        </Button>
      )}
    </header>
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col px-4 py-6 md:px-8 md:py-8">
      {header}

      {service.status === "checking" ? (
        <DemoChecking service="coach API" />
      ) : service.reason ? (
        <DemoOffline
          service="coach API"
          reason={service.reason}
          onRetry={service.retry}
        >
          <div className="space-y-4">
            {COACH_EXAMPLE.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
          </div>
        </DemoOffline>
      ) : (
        <>
          <MessageList
            messages={messages}
            isLoading={isLoading}
            suggestedPrompts={COACH_SUGGESTED_PROMPTS}
            onSendText={send}
          />

          {chatError ? (
            <p role="alert" className="mb-3 text-sm text-destructive">
              {chatError}
            </p>
          ) : null}

          <ChatInput
            value={input}
            onChange={setInput}
            onSend={submitMessage}
            isLoading={isLoading}
            maxLength={CHAT_LIMITS.maxInputChars}
            label="Message the coach"
            placeholder="Ask about your personal brand… (Enter to send, Shift+Enter for new line)"
          />
        </>
      )}
    </div>
  );
}
