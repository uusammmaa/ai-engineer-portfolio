"use client";

import { useCallback, useState } from "react";

import { parseBriefOutput } from "@/lib/agent-parse";
import type { AgentStep, ResearchBrief } from "@/lib/agent-types";

function parseStepLine(line: string): AgentStep | null {
  try {
    return JSON.parse(line) as AgentStep;
  } catch {
    return null;
  }
}

function handleStep(
  step: AgentStep,
  setSteps: React.Dispatch<React.SetStateAction<AgentStep[]>>,
  setBrief: React.Dispatch<React.SetStateAction<ResearchBrief | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
) {
  if (step.type === "complete") {
    const brief = parseBriefOutput(step.output);
    if (brief) {
      setBrief(brief);
    } else {
      setError("Failed to parse research brief");
    }
    return;
  }

  if (step.type === "error") {
    const brief = parseBriefOutput(step.output);
    if (brief) {
      setBrief(brief);
    } else {
      setError(step.message ?? "Agent error");
    }
    return;
  }

  setSteps((prev) => [...prev, step]);
}

export function useAgentStream({
  apiBase,
  onNetworkError,
}: {
  apiBase: string | null;
  /** Called when the agent API cannot be reached at all. */
  onNetworkError?: () => void;
}) {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const reset = useCallback(() => {
    setSteps([]);
    setBrief(null);
    setError(null);
  }, []);

  const run = useCallback(async (jobUrl: string) => {
    const trimmed = jobUrl.trim();
    if (!trimmed || !apiBase) return;

    setRunning(true);
    setSteps([]);
    setBrief(null);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/agent/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_url: trimmed }),
      });

      if (!res.ok) {
        setError(`Agent API returned ${res.status}`);
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
          if (step) handleStep(step, setSteps, setBrief, setError);
        }
      }

      if (buffer.trim()) {
        const step = parseStepLine(buffer);
        if (step) handleStep(step, setSteps, setBrief, setError);
      }
    } catch {
      setError("Failed to connect to agent API");
      onNetworkError?.();
    } finally {
      setRunning(false);
    }
  }, [apiBase, onNetworkError]);

  return { steps, brief, error, running, run, reset };
}
