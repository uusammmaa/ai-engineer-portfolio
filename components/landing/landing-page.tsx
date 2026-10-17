import { Suspense } from "react";
import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { Projects } from "@/components/landing/projects";
import { Services } from "@/components/landing/services";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TechStack } from "@/components/landing/tech-stack";
import { CaseStudies } from "@/components/landing/case-studies";
import { TechnicalFlair } from "@/components/landing/technical-flair";
import { ContactCta } from "@/components/landing/contact-cta";

function CaseStudiesFallback() {
  return (
    <section className="border-b border-border/60 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <p className="text-muted-foreground">Loading highlights…</p>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="font-body outline-none">
        <Hero />
        <Projects />
        <Services />
        <HowItWorks />
        <TechStack />
        <Suspense fallback={<CaseStudiesFallback />}>
          <CaseStudies />
        </Suspense>
        <TechnicalFlair />
        <ContactCta />
      </main>
      <footer className="border-t border-border/60 py-10 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Usama Akram · Lahore · Remote ·{" "}
          <a
            href="https://github.com/uusammmaa"
            className="rounded-sm text-primary underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </>
  );
}
