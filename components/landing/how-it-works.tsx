"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MagnifyingGlass,
  PenNib,
  RocketLaunch,
} from "@phosphor-icons/react";
import { Section } from "./section";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Discover",
    body: "We map workflows, data sources, and risk—so the AI solves the job your team actually does, not a generic chat toy.",
    Icon: MagnifyingGlass,
  },
  {
    title: "Design & Build",
    body: "Architecture, prompts, evals, and APIs: LangGraph where agents help, FastAPI where speed matters, and frontends that feel inevitable.",
    Icon: PenNib,
  },
  {
    title: "Deploy & Optimise",
    body: "Observability, cost controls, and iteration loops—shipping is the start; we tune latency, quality, and guardrails in production.",
    Icon: RocketLaunch,
  },
] as const;

export function HowItWorks() {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const tween = gsap.to(track, {
        x: () => Math.min(0, -(track.scrollWidth - pin.offsetWidth + 64)),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${Math.max(track.scrollWidth, pin.offsetWidth)}`,
          scrub: 0.75,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <Section
      id="process"
      index="03"
      eyebrow="Engagement"
      title="How It Works"
      description="A clear arc from ambiguity to a system your team trusts in production."
    >
      <div ref={pinRef} className="relative overflow-hidden md:min-h-[70vh]">
        <div
          ref={trackRef}
          className={cn(
            "flex flex-col gap-6 md:flex-row md:flex-nowrap md:gap-8 md:pr-24"
          )}
        >
          {steps.map((step, i) => (
            <article
              key={step.title}
              className="relative flex min-h-[200px] flex-1 flex-col rounded-xl border border-border/80 bg-card/50 p-6 md:min-w-[min(100%,380px)] md:max-w-md md:shrink-0 md:p-8"
            >
              <span
                className="decorative-index font-display text-5xl text-foreground/[0.07] md:text-6xl"
                data-index={String(i + 1).padStart(2, "0")}
                aria-hidden
              />
              <step.Icon
                className="mt-2 size-10 text-primary"
                weight="duotone"
                aria-hidden
              />
              <h3 className="font-display mt-4 text-2xl tracking-wide text-foreground md:text-3xl">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {step.body}
              </p>
              {i < steps.length - 1 ? (
                <span
                  className="mt-6 hidden font-display text-xs uppercase tracking-[0.3em] text-accent md:block"
                  aria-hidden
                >
                  →
                </span>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
