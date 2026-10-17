"use client";

import { useState } from "react";

import { AgentSteps } from "@/components/AgentSteps";
import { DemoChecking, DemoOffline } from "@/components/DemoOffline";
import { ResearchBriefCard } from "@/components/ResearchBrief";
import { RunSummaryCard } from "@/components/RunSummaryCard";
import { Button } from "@/components/ui/button";
import { agentApiBase, BACKEND_REPOS } from "@/lib/backends";
import { AGENT_EXAMPLE } from "@/lib/demo-recordings";
import { useAgentStream } from "@/lib/use-agent-stream";
import { healthOk, useServiceStatus } from "@/lib/use-service-status";

const AGENT_SERVICE = "research agent API";

function AgentExample() {
  return (
    <div className="grid min-h-0 gap-6 md:grid-cols-2 md:items-start">
      <div className="space-y-3">
        <p className="truncate text-sm text-muted-foreground">
          Job URL: {AGENT_EXAMPLE.jobUrl}
        </p>
        <AgentSteps steps={AGENT_EXAMPLE.steps} />
        <RunSummaryCard summary={AGENT_EXAMPLE.summary} />
      </div>
      <ResearchBriefCard brief={AGENT_EXAMPLE.brief} />
    </div>
  );
}

export function AgentDemoPanel() {
  const service = useServiceStatus(
    agentApiBase ? `${agentApiBase}/health` : null,
    healthOk,
  );
  const [url, setUrl] = useState("");
  const { steps, brief, summary, error, urlError, running, run, reset } =
    useAgentStream({
      apiBase: agentApiBase,
      onOffline: service.markOffline,
    });

  const hasResults = steps.length > 0 || brief !== null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!url.trim() || running) return;
    run(url);
  }

  function handleReset() {
    setUrl("");
    reset();
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col px-4 py-6 md:px-8 md:py-8">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl tracking-wide text-foreground md:text-4xl">
            Job Research Agent
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Paste a job posting URL. The agent fetches the listing, searches the
            company, and streams each tool step in real time.
          </p>
        </div>
        {service.status === "online" && (hasResults || summary) ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={running}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            New Research
          </Button>
        ) : null}
      </header>

      {service.status === "checking" ? (
        <DemoChecking service={AGENT_SERVICE} />
      ) : service.reason ? (
        <DemoOffline
          service={AGENT_SERVICE}
          reason={service.reason}
          repoUrl={BACKEND_REPOS.agent}
          onRetry={service.retry}
        >
          <AgentExample />
        </DemoOffline>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
            <div className="flex gap-2">
              <label htmlFor="agent-job-url" className="sr-only">
                Job posting URL
              </label>
              <input
                id="agent-job-url"
                type="url"
                required
                aria-invalid={urlError ? true : undefined}
                aria-describedby={urlError ? "agent-job-url-error" : undefined}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://jobs.example.com/senior-engineer"
                disabled={running}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 aria-invalid:border-destructive"
              />
              <Button type="submit" disabled={running || !url.trim()}>
                {running ? "Running…" : "Research"}
              </Button>
            </div>
            {urlError ? (
              <p
                id="agent-job-url-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {urlError}
              </p>
            ) : null}
          </form>

          {error ? (
            <p className="mb-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div
            className={
              brief
                ? "grid min-h-0 flex-1 gap-6 md:grid-cols-2 md:items-start"
                : "min-h-0 flex-1"
            }
          >
            <div
              className="min-h-0 space-y-3 overflow-y-auto"
              aria-live="polite"
              aria-busy={running}
            >
              {running && steps.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Agent is starting…
                </p>
              ) : null}
              <AgentSteps steps={steps} />
              {summary ? <RunSummaryCard summary={summary} /> : null}
            </div>

            {brief ? (
              <div className="min-h-0 overflow-y-auto">
                <ResearchBriefCard brief={brief} />
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
