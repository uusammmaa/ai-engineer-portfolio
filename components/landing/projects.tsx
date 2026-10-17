import Link from "next/link";
import { ArrowUpRight, FlaskConical } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PROJECTS } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { Section } from "./section";

export function Projects() {
  return (
    <Section
      id="projects"
      index="01"
      eyebrow="Open source"
      title="Projects"
      description="The two FastAPI backends behind the live demos. Read the code, run the evals, then try them in the browser."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {PROJECTS.map((p) => (
          <Card
            key={p.name}
            className="h-full border-border/80 bg-card/60 ring-0 transition-colors hover:border-primary/35"
          >
            <CardHeader className="gap-3">
              <CardTitle className="font-display text-2xl tracking-wide md:text-3xl">
                <h3>{p.name}</h3>
              </CardTitle>
              <CardDescription className="text-base leading-relaxed text-muted-foreground">
                {p.outcome}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-5">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Stack
                </p>
                <ul
                  className="flex flex-wrap gap-2"
                  aria-label={`${p.name} stack`}
                >
                  {p.stack.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs text-foreground"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FlaskConical
                    className="mt-0.5 size-4 shrink-0 self-start text-primary"
                    aria-hidden
                  />
                  <span>
                    <span className="mr-2 inline-block rounded-full border border-primary/40 px-2 py-px text-[0.7rem] font-medium uppercase tracking-wider text-primary">
                      {p.eval.label}
                    </span>
                    {p.eval.headline}
                  </span>
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {p.eval.detail}
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2 border-t border-border/60 bg-transparent pt-4">
              <a
                href={p.repoUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "px-4")}
              >
                View code on GitHub
                <ArrowUpRight aria-hidden />
                <span className="sr-only">
                  {" "}
                  for {p.name} (opens in a new tab)
                </span>
              </a>
              {p.demos.map((d) => (
                <Link
                  key={d.href}
                  href={d.href}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "px-4",
                  )}
                >
                  {d.label}
                </Link>
              ))}
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  );
}
