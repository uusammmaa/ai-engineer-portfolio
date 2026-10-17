"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Section } from "./section";

const data = [
  { stage: "Ingest", score: 88 },
  { stage: "Embed", score: 94 },
  { stage: "Retrieve", score: 91 },
  { stage: "Reason", score: 96 },
  { stage: "Act", score: 84 },
];

export function TechnicalFlair() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Section
      id="pipeline"
      index="06"
      eyebrow="Systems view"
      title="From Raw Data to Decisions"
      description="A stylised pipeline scorecard—how I think about quality across a typical RAG + agent deployment (not live metrics)."
    >
      <div className="min-h-0 min-w-0 rounded-xl border border-border/80 bg-card/40 p-4 md:p-6">
        <div className="h-[280px] min-h-[200px] min-w-0 w-full md:h-[320px]">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <XAxis
                dataKey="stage"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                cursor={{ fill: "rgba(45,212,191,0.06)" }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--foreground)",
                }}
              />
              <Bar
                dataKey="score"
                radius={[6, 6, 0, 0]}
                fill="url(#barGrad)"
                maxBarSize={48}
              />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#c9a227" stopOpacity={0.55} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted/20 text-sm text-muted-foreground">
              Loading chart…
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
