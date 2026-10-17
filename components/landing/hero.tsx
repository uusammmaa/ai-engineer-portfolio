"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HeroCanvas = dynamic(
  () => import("./hero-canvas").then((m) => m.HeroCanvas),
  { ssr: false, loading: () => null }
);

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  return (
    <section className="relative isolate min-h-[92svh] overflow-hidden border-b border-border/60">
      <div className="mesh-blobs" aria-hidden />
      <HeroCanvas />

      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background/20 via-transparent to-background" />

      <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-6xl flex-col justify-center px-4 pb-24 pt-28 md:px-8 md:pb-32 md:pt-32">
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="font-display text-xs uppercase tracking-[0.4em] text-primary md:text-sm"
        >
          Usama Akram, AI Engineer · Lahore · Remote
        </motion.p>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="font-display mt-6 max-w-4xl text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.92] tracking-tight text-foreground"
        >
          I build AI systems that run in production.
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          I&apos;m{" "}
          <span className="text-foreground">Usama Akram</span>, an AI engineer
          based in <span className="text-accent">Lahore</span>, working{" "}
          <span className="text-foreground">remote</span>. I ship assistants,
          RAG pipelines, and agentic workflows—the kind you can operate, not
          just demo.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-10 flex flex-wrap gap-3"
        >
          <a
            href="#work"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 px-6 text-base shadow-lg shadow-primary/10"
            )}
          >
            See My Work
          </a>
          <a
            href="#contact"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 border-primary/40 bg-background/40 px-6 text-base backdrop-blur-sm hover:bg-muted/50"
            )}
          >
            Let&apos;s Talk
          </a>
        </motion.div>
      </div>
    </section>
  );
}
