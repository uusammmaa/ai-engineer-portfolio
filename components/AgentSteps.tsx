"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  RotateCcw,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AgentStep, AgentStepType } from "@/lib/agent-types";

const stepConfig: Record<
  AgentStepType,
  { icon: LucideIcon; className: string }
> = {
  tool_call: {
    icon: Wrench,
    className: "border-primary/20 bg-primary/5",
  },
  tool_result: {
    icon: FileText,
    className: "border-border bg-muted/40",
  },
  repair: {
    icon: RotateCcw,
    className: "border-accent/30 bg-accent/5",
  },
  complete: {
    icon: CheckCircle2,
    className: "border-green-500/30 bg-green-500/5",
  },
  error: {
    icon: AlertCircle,
    className: "border-destructive/30 bg-destructive/5",
  },
  run_summary: {
    icon: CheckCircle2,
    className: "border-border bg-muted/40",
  },
};

export function AgentSteps({ steps }: { steps: AgentStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const config = stepConfig[step.type] ?? stepConfig.tool_result;
        const Icon = config.icon;

        return (
          <Card
            key={i}
            size="sm"
            className={cn("ring-0 border", config.className)}
          >
            <CardContent className="flex flex-col gap-1 pt-0">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Icon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="text-sm">{step.message}</span>
              </div>
              {(step.type === "tool_result" || step.type === "repair") &&
              step.output ? (
                <p className="truncate pl-6 text-xs text-muted-foreground">
                  {step.output}
                </p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
