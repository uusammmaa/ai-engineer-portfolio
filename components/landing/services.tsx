"use client";

import { motion } from "motion/react";
import {
  Bot,
  GitBranch,
  Database,
  Sparkles,
  Building2,
  Layers,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Section } from "./section";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "AI Chat Assistants & Copilots",
    description:
      "Custom Claude and GPT-powered assistants wired to your CRM, docs, and workflows—so teams get answers and actions without tab-hopping.",
    icon: Bot,
  },
  {
    title: "Agentic Systems",
    description:
      "LangGraph multi-agent pipelines that reason, plan, and call tools safely: research, drafting, approvals, and hand-offs built for production.",
    icon: GitBranch,
  },
  {
    title: "RAG & Knowledge Bases",
    description:
      "Semantic search over contracts, policies, and internal wikis with grounded citations—so leadership trusts the output, not vibes.",
    icon: Database,
  },
  {
    title: "AI-Powered SaaS Features",
    description:
      "Streaming AI embedded into your product: suggestions, summaries, and proactive UI that feels native, not bolted-on.",
    icon: Sparkles,
  },
  {
    title: "Real Estate & Domain-Specific AI",
    description:
      "Deal analysis, comps, valuations, and sector intelligence tuned to how you already underwrite and close.",
    icon: Building2,
  },
  {
    title: "Full-Stack AI Products",
    description:
      "End-to-end delivery: Next.js or Angular frontends, FastAPI services, Redis and Mongo where it fits, and the AI layer in between.",
    icon: Layers,
  },
] as const;

export function Services() {
  return (
    <Section
      id="services"
      index="02"
      eyebrow="Capabilities"
      title="What I Build For You"
      description="From first prototype to production traffic—systems designed around outcomes, latency, and maintainability."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card
              className={cn(
                "group h-full border-border/80 bg-card/60 transition-all duration-300",
                "hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_0_0_1px_rgba(45,212,191,0.12),0_24px_48px_-24px_rgba(0,0,0,0.65)]"
              )}
            >
              <CardHeader className="gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary transition-colors group-hover:border-primary/50 group-hover:bg-primary/15">
                  <item.icon className="size-5" aria-hidden />
                </div>
                <CardTitle className="font-display text-lg leading-snug tracking-wide md:text-xl">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
