"use client";

import { ArrowUpRight, CloudOff, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { OfflineReason } from "@/lib/use-service-status";

const REASON_COPY: Record<OfflineReason, string> = {
  unconfigured:
    "The backend for this demo is not connected on this deployment.",
  unreachable:
    "The backend for this demo is not responding right now. Free-tier hosts sleep when idle, so it may wake up if you try again in a minute.",
};

/**
 * Shown in place of a live demo when its backend is missing or down, followed
 * by an example output so visitors still see what the demo produces.
 */
export function DemoOffline({
  reason,
  service,
  repoUrl,
  onRetry,
  children,
}: {
  reason: OfflineReason;
  /** e.g. "RAG API" */
  service: string;
  repoUrl?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-5"
      data-testid="demo-offline"
    >
      <section
        aria-labelledby="demo-offline-title"
        className="rounded-xl border border-accent/40 bg-accent/10 p-4 md:p-5"
      >
        <div className="flex flex-wrap items-start gap-3">
          <CloudOff
            className="mt-0.5 size-5 shrink-0 text-accent"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <h2
              id="demo-offline-title"
              className="text-base font-semibold text-foreground"
            >
              Demo offline: {service}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {REASON_COPY[reason]} Below is an example of what this demo
              returns.
            </p>
            {repoUrl ? (
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Read the {service} source on GitHub
                <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            ) : null}
          </div>
          {onRetry ? (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              <RotateCw aria-hidden />
              Try again
            </Button>
          ) : null}
        </div>
      </section>

      <section
        aria-labelledby="example-output-title"
        className="min-h-0 flex-1"
      >
        <h2
          id="example-output-title"
          className="mb-3 flex items-center gap-2 font-display text-xs uppercase tracking-[0.28em] text-primary"
        >
          Example output
        </h2>
        {children}
      </section>
    </div>
  );
}

export function DemoChecking({ service }: { service: string }) {
  return (
    <p role="status" className="text-sm text-muted-foreground">
      Connecting to the {service}…
    </p>
  );
}
