"use client";

import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "usamaakram17@gmail.com";

const linkedInUrl = "https://www.linkedin.com/in/usama-akram17";
const githubUrl = "https://github.com/uusammmaa";

export function ContactCta() {
  return (
    <section
      id="contact"
      className="relative scroll-mt-24 border-b border-border/60 py-20 md:py-28"
    >
      <span
        className="section-index pointer-events-none absolute left-2 top-8 select-none text-[clamp(3.5rem,12vw,10rem)] text-foreground/[0.06] md:left-6"
        aria-hidden
      >
        06
      </span>
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-8">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.35em] text-primary">
            Next step
          </p>
          <h2 className="font-display mt-3 text-4xl leading-[0.95] tracking-tight text-foreground md:text-6xl">
            Ready to add AI to your product?
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Tell me about the workflow, product surface, or KPI you want to move.
            I&apos;ll reply with a concrete approach—architecture, timeline, and what
            a first milestone looks like.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href={`mailto:${contactEmail}?subject=Project%20inquiry%20%E2%80%94%20Usama%20Akram`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 px-8 text-base shadow-lg shadow-primary/15"
              )}
            >
              Email me
            </a>
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 border-primary/35 bg-background/30 px-8 text-base backdrop-blur-sm"
              )}
            >
              LinkedIn
            </a>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 border-primary/35 bg-background/30 px-8 text-base backdrop-blur-sm"
              )}
            >
              GitHub
            </a>
          </motion.div>
        </div>

        <div
          className="relative flex min-h-[240px] items-center justify-center rounded-2xl border border-border/70 bg-linear-to-br from-card/80 to-background/40 p-8"
          aria-hidden
        >
          <svg
            viewBox="0 0 400 320"
            className="h-full w-full max-w-[400px] text-primary/90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="60" cy="160" r="8" fill="currentColor" opacity="0.9" />
            <circle cx="200" cy="80" r="8" fill="currentColor" opacity="0.7" />
            <circle cx="340" cy="140" r="8" fill="currentColor" opacity="0.85" />
            <circle cx="260" cy="240" r="8" fill="#c9a227" opacity="0.9" />
            <path
              d="M68 160 L192 88 M208 88 L332 140 M332 148 L268 232 M252 232 L68 168"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeOpacity="0.35"
            />
            <rect
              x="120"
              y="120"
              width="160"
              height="120"
              rx="12"
              stroke="currentColor"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
            <path
              d="M140 200c24-40 56-40 80 0s56 40 80 0"
              stroke="#c9a227"
              strokeWidth="2"
              strokeOpacity="0.55"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
