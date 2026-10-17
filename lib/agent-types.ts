export type AgentStepType =
  | "tool_call"
  | "tool_result"
  | "repair"
  | "complete"
  | "error"
  | "run_summary";

export type AgentStep = {
  type: AgentStepType;
  tool?: string;
  input?: string;
  output?: string;
  message?: string;
  /** Structured extras; carries the RunSummary on "run_summary" steps. */
  data?: unknown;
};

/** One factual statement in the brief, tied to the page that supports it. */
export type Claim = {
  statement: string;
  /** http(s) URL of a page fetched or returned by search in this run. */
  source: string;
  /** Verbatim excerpt from the source. */
  quote: string;
};

export type ResearchBrief = {
  role: string;
  company: string;
  location: string;
  tech_stack: string[];
  key_requirements: string[];
  company_summary: string;
  culture_signals: string[];
  talking_points: string[];
  red_flags: string[];
  sources: string[];
  claims: Claim[];
};

export type ModelUsage = {
  calls: number;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  cost_usd: number;
  /** False when the model is missing from the backend's price catalog. */
  cost_known: boolean;
};

/** Last line of every agent stream: token usage and cost for the run. */
export type RunSummary = {
  status: string;
  trace_id?: string;
  elapsed_seconds: number;
  llm_calls: number;
  tool_calls: number;
  repairs: number;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
    cost_known: boolean;
    by_model: Record<string, ModelUsage>;
  };
};
