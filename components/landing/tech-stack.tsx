"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Cpu,
  Code2,
  Database,
  Cloud,
  type LucideIcon,
} from "lucide-react";
import { Section } from "./section";
import { cn } from "@/lib/utils";

type Item = { name: string; icon: LucideIcon };

const stack: Item[] = [
  { name: "Claude API", icon: Cpu },
  { name: "OpenAI", icon: Cpu },
  { name: "LangGraph", icon: Code2 },
  { name: "FastAPI", icon: Code2 },
  { name: "Next.js", icon: Code2 },
  { name: "React", icon: Code2 },
  { name: "Angular", icon: Code2 },
  { name: "TypeScript", icon: Code2 },
  { name: "MongoDB", icon: Database },
  { name: "Redis", icon: Database },
  { name: "Vercel", icon: Cloud },
];

export function TechStack() {
  const reduceMotion = useReducedMotion();

  return (
    <Section
      id="stack"
      index="04"
      eyebrow="Tooling"
      title="Tech Stack"
      description="The stack I reach for when reliability, velocity, and observability all have to land together."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {stack.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.45 }}
            className={cn(
              "group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/70 bg-card/40 px-3 py-5 text-center transition-all",
              "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_0_24px_-8px_rgba(45,212,191,0.35)]"
            )}
          >
            <motion.div
              aria-hidden
              animate={
                reduceMotion
                  ? undefined
                  : { y: [0, -4, 0] }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 4 + (i % 4),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.15,
                    }
              }
              className="flex size-10 items-center justify-center rounded-lg border border-border/80 bg-background/50 text-primary/90 group-hover:text-primary"
            >
              <item.icon className="size-5" />
            </motion.div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground md:text-sm">
              {item.name}
            </span>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
