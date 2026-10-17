import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ResearchBrief } from "@/lib/agent-types";

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
              <span className="shrink-0">{danger ? "!" : highlight ? "→" : "•"}</span>
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
        <BriefSection
          title="Talking Points for Application"
          items={brief.talking_points}
          highlight
        />
        {brief.red_flags.length > 0 ? (
          <BriefSection title="Red Flags" items={brief.red_flags} danger />
        ) : null}
        {brief.sources.length > 0 ? (
          <BriefSection title="Sources" items={brief.sources} />
        ) : null}
      </CardContent>
    </Card>
  );
}
