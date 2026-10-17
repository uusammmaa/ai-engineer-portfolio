"use client";

import { type FormEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_PLACEHOLDER =
  "Message… (Enter to send, Shift+Enter for new line)";

export function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  placeholder = DEFAULT_PLACEHOLDER,
  disabled = false,
  maxLength,
  label = "Message",
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  placeholder?: string;
  /** When true, blocks sending (e.g. no document indexed yet). */
  disabled?: boolean;
  /** Hard cap on characters; a counter appears as the user nears it. */
  maxLength?: number;
  /** Accessible name for the textarea. */
  label?: string;
}) {
  const showCounter = maxLength !== undefined && value.length > maxLength * 0.8;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSend();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    onSend();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <textarea
          aria-label={label}
          aria-describedby={showCounter ? "chat-input-counter" : undefined}
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          className={cn(
            "min-h-18 max-h-48 w-full resize-y rounded-lg border border-border bg-card px-3 py-3 text-sm text-foreground shadow-sm outline-none transition-[box-shadow,border-color]",
            "placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          disabled={isLoading || disabled}
        />
        {showCounter ? (
          <p
            id="chat-input-counter"
            aria-live="polite"
            className="text-right text-xs text-muted-foreground"
          >
            {value.length}/{maxLength} characters
          </p>
        ) : null}
      </div>
      <Button
        type="submit"
        disabled={isLoading || disabled || !value.trim()}
        className="shrink-0 self-end"
      >
        Send
      </Button>
    </form>
  );
}
