export const SITE = {
  name: "Usama Akram",
  role: "AI Engineer",
  title: "Usama Akram, AI Engineer",
  tagline: "I build AI systems that run in production.",
  description:
    "Usama Akram, AI Engineer (Lahore, remote). Production RAG, agentic workflows and streaming LLM apps, with live demos and open-source FastAPI backends.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    "http://localhost:3000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "usamaakram17@gmail.com",
  linkedin: "https://www.linkedin.com/in/usama-akram17",
  github: "https://github.com/uusammmaa",
  /** Matches --background in marketing.css. */
  themeColor: "#090a0c",
} as const;
