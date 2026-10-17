import type { Metadata } from "next";
import { AgentDemoPanel } from "@/components/AgentDemoPanel";

export const metadata: Metadata = {
  title: "Research Agent Demo",
  description:
    "A Claude tool-use agent that turns a job posting into a structured research brief, streaming every tool call.",
  alternates: { canonical: "/agent" },
};

export default function AgentPage() {
  return <AgentDemoPanel />;
}
