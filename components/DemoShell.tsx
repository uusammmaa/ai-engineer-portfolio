"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MenuIcon } from "lucide-react";

import { DemoNavLinks } from "@/components/DemoNavLinks";
import { DemoSidebar } from "@/components/DemoSidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function DemoMain({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="font-body min-h-0 min-w-0 flex-1 overflow-y-auto outline-none"
    >
      {children}
    </main>
  );
}

export function DemoShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative flex h-svh min-h-0 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="mesh-blobs mesh-blobs--subtle h-full w-full"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background/45 via-transparent to-background/90" />
      </div>

      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-background/75 px-4 py-2.5 backdrop-blur-md md:px-5">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-2 text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to portfolio
        </Link>

        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
            >
              <MenuIcon className="size-5" />
              <span className="sr-only">Open demos menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="gap-0">
              <SheetHeader>
                <SheetTitle className="font-display text-left text-xl tracking-wide">
                  Demos
                </SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4">
                <DemoNavLinks
                  onNavigate={() => setMobileNavOpen(false)}
                  className="pt-1"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1">
        <DemoSidebar />
        <DemoMain>{children}</DemoMain>
      </div>
    </div>
  );
}
