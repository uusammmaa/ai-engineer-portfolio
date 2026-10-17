import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

import { isHttpUrl } from "@/lib/agent-parse";
import type { Claim, ResearchBrief } from "@/lib/agent-types";
import { cn } from "@/lib/utils";

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function SourceLink({ url, className }: { url: string; className?: string }) {
  if (!isHttpUrl(url)) return <span className={className}>{url}</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-sm text-primary underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className="truncate">{hostname(url)}</span>
      <ArrowUpRight className="size-3 shrink-0" aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function ClaimsSection({ claims }: { claims: Claim[] }) {
  if (claims.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">
        Claims and evidence
      </h3>
      <ol className="space-y-3">
        {claims.map((claim, i) => (
          <li
            key={i}
            className="rounded-lg border border-border/70 bg-background/40 p-3"
          >
            <p className="text-sm text-foreground">{claim.statement}</p>
            {claim.quote ? (
              <blockquote className="mt-2 border-l-2 border-primary/50 pl-3 text-xs italic leading-relaxed text-muted-foreground">
                &ldquo;{claim.quote}&rdquo;
              </blockquote>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground">
              Source: <SourceLink url={claim.source} />
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function BriefSection({
  title,
  items,
  inline,
  highlight,
  danger,
}: {
  title: string;
  items: string[];
  inline?: boolean;
  highlight?: boolean;
  danger?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      {inline ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <Badge key={i} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li
              key={i}
              className={cn(
                "flex gap-2 text-sm",
                danger
                  ? "text-destructive"
                  : highlight
                    ? "text-foreground"
                    : "text-muted-foreground",
              )}
            >
              <span className="shrink-0">
                {danger ? "!" : highlight ? "→" : "•"}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ResearchBriefCard({ brief }: { brief: ResearchBrief }) {
  return (
    <Card className="ring-0">
      <CardHeader>
        <CardTitle className="font-display text-xl tracking-wide md:text-2xl">
          {brief.role}
        </CardTitle>
        <CardDescription>
          {brief.company} · {brief.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <BriefSection title="Tech Stack" items={brief.tech_stack} inline />
        <BriefSection title="Key Requirements" items={brief.key_requirements} />
        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Company Summary
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {brief.company_summary}
          </p>
        </div>
        <BriefSection title="Culture Signals" items={brief.culture_signals} />
        <ClaimsSection claims={brief.claims} />
        <BriefSection
          title="Talking Points for Application"
          items={brief.talking_points}
          highlight
        />
        {brief.red_flags.length > 0 ? (
          <BriefSection title="Red Flags" items={brief.red_flags} danger />
        ) : null}
        {brief.sources.length > 0 ? (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Sources
            </h3>
            <ul className="space-y-1.5 text-sm">
              {brief.sources.map((url, i) => (
                <li key={`${i}-${url}`} className="min-w-0">
                  <SourceLink url={url} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
