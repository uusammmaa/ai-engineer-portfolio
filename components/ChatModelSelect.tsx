"use client";

import { Select } from "@base-ui/react/select";
import { ChevronDown } from "lucide-react";

import {
  CHAT_MODELS,
  type ChatModelId,
} from "@/lib/chat-models";
import { cn } from "@/lib/utils";

const CHAT_MODEL_ITEMS = Object.fromEntries(
  CHAT_MODELS.map((m) => [m.id, m.label]),
) as Record<ChatModelId, string>;

export type ChatModelSelectProps = Readonly<{
  /** Subset of CHAT_MODELS to offer, e.g. only those with an API key. */
  models?: readonly ChatModelId[];
  value: ChatModelId;
  onChange: (value: ChatModelId) => void;
  disabled?: boolean;
  className?: string;
  "aria-labelledby"?: string;
}>;

export function ChatModelSelect({
  models,
  value,
  onChange,
  disabled = false,
  className,
  "aria-labelledby": ariaLabelledBy,
}: ChatModelSelectProps) {
  const options = models
    ? CHAT_MODELS.filter((m) => models.includes(m.id))
    : CHAT_MODELS;

  return (
    <Select.Root
      value={value}
      onValueChange={(next) => {
        if (next != null) onChange(next as ChatModelId);
      }}
      items={CHAT_MODEL_ITEMS}
      disabled={disabled}
    >
      <Select.Trigger
        aria-labelledby={ariaLabelledBy}
        className={cn(
          "inline-flex h-8 max-w-full min-w-40 items-center justify-between gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-left text-sm text-foreground shadow-sm outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
          "data-disabled:pointer-events-none data-disabled:opacity-50",
          "data-popup-open:border-ring data-popup-open:ring-2 data-popup-open:ring-ring/30",
          className,
        )}
      >
        <Select.Value className="min-w-0 flex-1 truncate" />
        <Select.Icon
          className={(state) =>
            cn(
              "text-muted-foreground shrink-0 [&_svg]:size-4 [&_svg]:transition-transform [&_svg]:duration-200",
              state.open && "[&_svg]:rotate-180",
            )
          }
        >
          <ChevronDown aria-hidden className="size-4" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner className="z-50 outline-none" sideOffset={6}>
          <Select.Popup
            className={cn(
              "max-h-[min(var(--available-height),20rem)] min-w-(--anchor-width) origin-(--transform-origin) rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg",
              "transition-[transform,scale,opacity] duration-100",
              "data-ending-style:scale-95 data-ending-style:opacity-0",
              "data-starting-style:scale-95 data-starting-style:opacity-0",
            )}
          >
            <Select.List className="outline-none">
              {options.map((m) => (
                <Select.Item
                  key={m.id}
                  value={m.id}
                  className={cn(
                    "flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm outline-none select-none",
                    "data-disabled:pointer-events-none data-disabled:opacity-50",
                    "data-highlighted:bg-muted data-highlighted:text-foreground",
                    "data-selected:bg-muted/70 data-selected:font-medium",
                  )}
                >
                  <Select.ItemText>{m.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
