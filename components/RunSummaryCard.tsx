import { Coins } from "lucide-react";

import type { RunSummary } from "@/lib/agent-types";

const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
const int = (n: number) => n.toLocaleString("en-US");

/** Token usage and cost reported by the agent's final run_summary line. */
export function RunSummaryCard({ summary }: { summary: RunSummary }) {
  const { usage } = summary;
  const models = Object.entries(usage.by_model);

  return (
    <section
      aria-labelledby="run-cost-title"
      className="rounded-xl border border-border/80 bg-card/50 p-4"
      data-testid="run-summary"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3
          id="run-cost-title"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <Coins className="size-4 text-accent" aria-hidden />
          Run cost
        </h3>
        <p className="text-lg font-semibold tabular-nums text-foreground">
          {usd(usage.cost_usd)}
          {usage.cost_known ? null : (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (partial: a model had no price)
            </span>
          )}
        </p>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-4">
        <div>
          <dt>Tokens in / out</dt>
          <dd className="tabular-nums text-foreground">
            {int(usage.input_tokens)} / {int(usage.output_tokens)}
          </dd>
        </div>
        <div>
          <dt>LLM calls</dt>
          <dd className="tabular-nums text-foreground">{summary.llm_calls}</dd>
        </div>
        <div>
          <dt>Tool calls</dt>
          <dd className="tabular-nums text-foreground">{summary.tool_calls}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd className="tabular-nums text-foreground">
            {summary.elapsed_seconds.toFixed(1)}s
          </dd>
        </div>
      </dl>

      {models.length > 0 ? (
        <table className="mt-3 w-full text-left text-xs">
          <caption className="sr-only">Cost per model</caption>
          <thead className="text-muted-foreground">
            <tr>
              <th scope="col" className="py-1 font-medium">
                Model
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                Calls
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                Tokens in / out
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                Cost
              </th>
            </tr>
          </thead>
          <tbody className="tabular-nums text-foreground">
            {models.map(([model, m]) => (
              <tr key={model} className="border-t border-border/60">
                <td className="py-1 font-mono">{model}</td>
                <td className="py-1 text-right">{m.calls}</td>
                <td className="py-1 text-right">
                  {int(
                    m.input_tokens + m.cache_read_tokens + m.cache_write_tokens,
                  )}{" "}
                  / {int(m.output_tokens)}
                </td>
                <td className="py-1 text-right">
                  {m.cost_known ? usd(m.cost_usd) : "n/a"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
