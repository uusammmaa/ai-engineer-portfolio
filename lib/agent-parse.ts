import type {
  Claim,
  ModelUsage,
  ResearchBrief,
  RunSummary,
} from "@/lib/agent-types";

/** Only http(s) URLs are ever rendered as links (no javascript: or data:). */
export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "")
    : [];
}

function claims(value: unknown): Claim[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((c) => {
    if (typeof c !== "object" || c === null) return [];
    const { statement, source, quote } = c as Record<string, unknown>;
    if (typeof statement !== "string" || !statement.trim()) return [];
    if (typeof quote !== "string" || !isHttpUrl(source)) return [];
    return [{ statement: statement.trim(), source, quote: quote.trim() }];
  });
}

/** Coerces untrusted model output into a ResearchBrief, or null if unusable. */
function normalizeBrief(raw: unknown): ResearchBrief | null {
  if (typeof raw !== "object" || raw === null) return null;
  const b = raw as Record<string, unknown>;
  if (typeof b.role !== "string" || !b.role.trim()) return null;
  if (typeof b.company !== "string" || !b.company.trim()) return null;
  return {
    role: b.role,
    company: b.company,
    location: typeof b.location === "string" ? b.location : "",
    tech_stack: strings(b.tech_stack),
    key_requirements: strings(b.key_requirements),
    company_summary:
      typeof b.company_summary === "string" ? b.company_summary : "",
    culture_signals: strings(b.culture_signals),
    talking_points: strings(b.talking_points),
    red_flags: strings(b.red_flags),
    sources: strings(b.sources),
    claims: claims(b.claims),
  };
}

export function extractBriefFromText(text: string): ResearchBrief | null {
  const fence = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i);
  const candidates = [fence?.[1]?.trim(), text.trim()].filter(
    Boolean,
  ) as string[];

  for (const source of candidates) {
    let idx = source.indexOf("{");
    while (idx !== -1) {
      try {
        const brief = normalizeBrief(JSON.parse(source.slice(idx)));
        if (brief) return brief;
      } catch {
        // try next opening brace
      }
      idx = source.indexOf("{", idx + 1);
    }
  }

  return null;
}

export function parseBriefOutput(
  output: string | undefined,
): ResearchBrief | null {
  if (!output) return null;
  try {
    return normalizeBrief(JSON.parse(output));
  } catch {
    return extractBriefFromText(output);
  }
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Reads the `data` of a run_summary step; null when it is missing or malformed. */
export function parseRunSummary(data: unknown): RunSummary | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  const usage = d.usage as Record<string, unknown> | undefined;
  if (typeof usage !== "object" || usage === null) return null;

  const byModel: Record<string, ModelUsage> = {};
  if (typeof usage.by_model === "object" && usage.by_model !== null) {
    for (const [model, raw] of Object.entries(usage.by_model)) {
      const m = (raw ?? {}) as Record<string, unknown>;
      byModel[model] = {
        calls: num(m.calls),
        input_tokens: num(m.input_tokens),
        output_tokens: num(m.output_tokens),
        cache_read_tokens: num(m.cache_read_tokens),
        cache_write_tokens: num(m.cache_write_tokens),
        cost_usd: num(m.cost_usd),
        cost_known: m.cost_known !== false,
      };
    }
  }

  return {
    status: typeof d.status === "string" ? d.status : "unknown",
    trace_id: typeof d.trace_id === "string" ? d.trace_id : undefined,
    elapsed_seconds: num(d.elapsed_seconds),
    llm_calls: num(d.llm_calls),
    tool_calls: num(d.tool_calls),
    repairs: num(d.repairs),
    usage: {
      input_tokens: num(usage.input_tokens),
      output_tokens: num(usage.output_tokens),
      cost_usd: num(usage.cost_usd),
      cost_known: usage.cost_known !== false,
      by_model: byModel,
    },
  };
}

/**
 * Message for a non-2xx /agent/run response. FastAPI validation errors (422)
 * arrive as { detail: [{ msg }] }; HTTPExceptions as { detail: "..." }.
 */
export function agentHttpErrorMessage(status: number, body: string): string {
  let detail: string | null = null;
  try {
    const parsed = JSON.parse(body) as { detail?: unknown };
    if (typeof parsed.detail === "string") detail = parsed.detail;
    else if (Array.isArray(parsed.detail)) {
      const msg = (parsed.detail[0] as { msg?: unknown } | undefined)?.msg;
      if (typeof msg === "string")
        detail = msg.replace(/^Value error,\s*/i, "");
    }
  } catch {
    /* not JSON */
  }

  if (status === 422) {
    return "Enter a job posting link that starts with http:// or https://.";
  }
  return detail ?? `The agent API returned an error (${status}).`;
}
