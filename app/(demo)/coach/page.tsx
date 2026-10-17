import type { Metadata } from "next";
import { CoachPanel } from "@/components/CoachPanel";

export const metadata: Metadata = {
  title: "Career Coach Demo",
  description:
    "Streaming Claude chat built with Next.js and the Vercel AI SDK, with rate limiting and input caps on the API route.",
  alternates: { canonical: "/coach" },
};

export default function CoachPage() {
  return <CoachPanel />;
}
