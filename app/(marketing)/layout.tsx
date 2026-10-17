import type { Metadata } from "next";
import { MarketingProviders } from "@/components/marketing/marketing-providers";
import {
  marketingFontVariableClassName,
  marketingRootClassName,
} from "@/lib/marketing-fonts";
import { cn } from "@/lib/utils";
import "./marketing.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Usama Akram — AI Engineer",
    template: "%s | Usama Akram",
  },
  description:
    "Usama Akram, AI Engineer in Lahore (remote). I build AI systems that run in production—assistants, RAG, and agentic workflows.",
  keywords: [
    "AI engineer",
    "LLM",
    "LangGraph",
    "Next.js",
    "FastAPI",
    "RAG",
    "Lahore",
    "remote",
    "Claude API",
  ],
  authors: [{ name: "Usama Akram", url: siteUrl }],
  creator: "Usama Akram",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteUrl,
    siteName: "Usama Akram",
    title: "Usama Akram — AI Engineer",
    description:
      "I build AI systems that run in production. Lahore · remote.",
    images: [{ url: "/og", width: 1200, height: 630, alt: "Usama Akram" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Usama Akram — AI Engineer",
    description:
      "I build AI systems that run in production. Lahore · remote.",
    images: [`${siteUrl}/og`],
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Usama Akram",
  jobTitle: "AI Engineer",
  email: "usamaakram17@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lahore",
    addressCountry: "PK",
  },
  url: siteUrl,
  sameAs: [
    "https://www.linkedin.com/in/usama-akram17",
    "https://github.com/uusammmaa",
  ],
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
