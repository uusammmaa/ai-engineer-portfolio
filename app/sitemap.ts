import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const ROUTES = [
  { path: "", priority: 1 },
  { path: "/agent", priority: 0.8 },
  { path: "/rag", priority: 0.8 },
  { path: "/rag-supabase", priority: 0.7 },
  { path: "/coach", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, priority }) => ({
    url: `${SITE.url}${path}`,
    changeFrequency: "monthly",
    priority,
  }));
}
