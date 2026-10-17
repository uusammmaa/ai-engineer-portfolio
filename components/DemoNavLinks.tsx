"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DEMO_NAV } from "@/lib/demo-nav";
import { cn } from "@/lib/utils";

export function DemoNavLinks({
  onNavigate,
  className,
}: {
  /** Called after a link is chosen (e.g. close mobile sheet). */
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Demos" className={cn("flex flex-col gap-1.5", className)}>
      {DEMO_NAV.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href ||
              pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-lg border border-l-4 px-3 py-2.5 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-border/50 border-l-primary bg-primary/10 text-foreground"
                : "border-border/60 border-l-transparent bg-card/30 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground",
            )}
          >
            <span className="block text-sm font-medium text-foreground">
              {item.label}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {item.description}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
