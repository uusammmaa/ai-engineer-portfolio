import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Section({
  id,
  index,
  eyebrow,
  title,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24 border-b border-border/60 py-20 md:py-28",
        className
      )}
    >
      <span
        className="section-index pointer-events-none absolute left-2 top-6 select-none text-[clamp(3.5rem,12vw,10rem)] text-foreground/[0.06] md:left-6 md:top-10"
        data-index={index}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 md:px-8">
        <p className="font-display text-xs uppercase tracking-[0.35em] text-primary md:text-sm">
          {eyebrow}
        </p>
        <h2 className="font-display mt-3 max-w-3xl text-4xl leading-[0.95] tracking-tight text-foreground md:text-6xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
        ) : null}
        <div className="mt-12 md:mt-16">{children}</div>
      </div>
    </section>
  );
}
