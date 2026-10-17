import type { Metadata } from "next";
import { MarketingProviders } from "@/components/marketing/marketing-providers";
import {
  marketingFontVariableClassName,
  marketingRootClassName,
} from "@/lib/marketing-fonts";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import "./marketing.css";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  jobTitle: SITE.role,
  description: SITE.description,
  email: `mailto:${SITE.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lahore",
    addressCountry: "PK",
  },
  url: SITE.url,
  knowsAbout: [
    "Retrieval-augmented generation",
    "AI agents",
    "Large language models",
    "FastAPI",
    "Next.js",
  ],
  sameAs: [SITE.linkedin, SITE.github],
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        className={cn(
          marketingRootClassName,
          marketingFontVariableClassName,
        )}
      >
        <MarketingProviders>{children}</MarketingProviders>
      </div>
    </>
  );
}
