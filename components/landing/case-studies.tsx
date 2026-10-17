import Image from "next/image";
import { blurDataUrlFromRemote } from "@/lib/placeholder";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Section } from "./section";
import { CaseStudyMux } from "./case-study-mux";

const CASES = [
  {
    title: "AI Real Estate Deal Analyser",
    summary:
      "Multi-step LangGraph workflows with Claude reasoning plus Rentcast-backed comps—so analysts get defensible narratives in minutes, not overnight spreadsheets.",
    tags: ["LangGraph", "Claude", "Rentcast", "FastAPI"],
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&auto=format&fit=crop",
  },
  {
    title: "LinkedIn Autopilot",
    summary:
      "AI post generation with a self-improving engagement loop: drafts, schedules, measures resonance, and tightens prompts—without losing your voice.",
    tags: ["OpenAI", "Next.js", "Redis", "Queues"],
    image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80&auto=format&fit=crop",
  },
  {
    title: "Social Media Analytics SaaS AI Chat",
    summary:
      "Multi-model routing with SSE streaming and proactive chart generation—users ask in plain language and get live visuals grounded in their workspace data.",
    tags: ["SSE", "Claude", "Charts", "TypeScript"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop",
  },
] as const;

export async function CaseStudies() {
  const blurs = await Promise.all(
    CASES.map(async (c) => {
      try {
        return await blurDataUrlFromRemote(c.image);
      } catch {
        return undefined;
      }
    })
  );

  return (
    <Section
      id="work"
      index="05"
      eyebrow="Selected work"
      title="Case Studies & Highlights"
      description="Representative builds—where architecture, models, and product UX had to ship as one coherent system."
    >
      <div className="grid gap-8 lg:grid-cols-3">
        {CASES.map((c, i) => (
          <Card
            key={c.title}
            className="group overflow-hidden border-border/80 bg-card/50 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.7)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={c.image}
                alt={c.title}
                fill
                sizes="(max-width:1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                {...(blurs[i]
                  ? { placeholder: "blur" as const, blurDataURL: blurs[i] }
                  : { placeholder: "empty" as const })}
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent" />
            </div>
            <CardHeader>
              <CardTitle className="font-display text-xl tracking-wide md:text-2xl">
                <h3>{c.title}</h3>
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                {c.summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 pt-0">
              {c.tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="border border-border/60 bg-muted/40 text-xs font-normal text-muted-foreground"
                >
                  {t}
                </Badge>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <CaseStudyMux />
    </Section>
  );
}
