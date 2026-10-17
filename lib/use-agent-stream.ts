"use client";

import { useCallback, useState } from "react";

import {
  agentHttpErrorMessage,
  parseBriefOutput,
  parseRunSummary,
} from "@/lib/agent-parse";
import type { AgentStep, ResearchBrief, RunSummary } from "@/lib/agent-types";
import type { OfflineReason } from "@/lib/use-service-status";

function parseStepLine(line: string): AgentStep | null {
  try {
    return JSON.parse(line) as AgentStep;
  } catch {
    return null;
  }
}

type Setters = {
  setSteps: React.Dispatch<React.SetStateAction<AgentStep[]>>;
  setBrief: React.Dispatch<React.SetStateAction<ResearchBrief | null>>;
  setSummary: React.Dispatch<React.SetStateAction<RunSummary | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
};

function handleStep(step: AgentStep, s: Setters) {
  switch (step.type) {
    case "complete": {
      const brief = parseBriefOutput(step.output);
      if (brief) s.setBrief(brief);
      else s.setError("Failed to parse research brief");
      return;
    }
    case "error": {
      const brief = parseBriefOutput(step.output);
      if (brief) s.setBrief(brief);
      else s.setError(step.message ?? "Agent error");
      return;
    }
    case "run_summary":
      s.setSummary(parseRunSummary(step.data));
      return;
    default:
      s.setSteps((prev) => [...prev, step]);
  }
}

export function useAgentStream({
  apiBase,
  onOffline,
}: {
  apiBase: string | null;
  /** Called when the agent API is unreachable (network) or unconfigured (503). */
  onOffline?: (reason: OfflineReason) => void;
}) {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** The API rejected the job URL itself (422). */
  const [urlError, setUrlError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const reset = useCallback(() => {
    setSteps([]);
    setBrief(null);
    setSummary(null);
    setError(null);
    setUrlError(null);
  }, []);

  const run = useCallback(
    async (jobUrl: string) => {
      const trimmed = jobUrl.trim();
      if (!trimmed || !apiBase) return;

      setRunning(true);
      reset();
      const setters: Setters = { setSteps, setBrief, setSummary, setError };

      try {
        const res = await fetch(`${apiBase}/agent/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_url: trimmed }),
        });

        if (!res.ok) {
          const message = agentHttpErrorMessage(res.status, await res.text());
          if (res.status === 422) setUrlError(message);
          else if (res.status === 503) onOffline?.("unconfigured");
          else setError(message);
          return;
        }

        if (!res.body) {
          setError("Agent API returned no response body");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            const step = parseStepLine(line);
            if (step) handleStep(step, setters);
          }
        }

        if (buffer.trim()) {
          const step = parseStepLine(buffer);
          if (step) handleStep(step, setters);
        }
      } catch {
        setError("Failed to connect to agent API");
        onOffline?.("unreachable");
      } finally {
        setRunning(false);
      }
    },
    [apiBase, onOffline, reset],
  );

  return { steps, brief, summary, error, urlError, running, run, reset };
}
