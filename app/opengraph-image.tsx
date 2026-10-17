import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.title}. ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background:
          "linear-gradient(135deg, #090a0c 0%, #121820 50%, #0a1210 100%)",
        color: "#f4f1ea",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <span
          style={{ fontSize: 28, letterSpacing: "0.15em", color: "#c9a227" }}
        >
          USAMA AKRAM
        </span>
        <span style={{ fontSize: 22, color: "#2dd4bf" }}>
          AI Engineer · Lahore · Remote
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.05,
            maxWidth: 960,
          }}
        >
          {SITE.tagline}
        </div>
        <div
          style={{
            fontSize: 30,
            color: "rgba(244,241,234,0.8)",
            maxWidth: 960,
          }}
        >
          Live demos: RAG on Pinecone and pgvector, a tool-using research agent,
          and a streaming Claude coach.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          color: "rgba(244,241,234,0.65)",
        }}
      >
        <span>Next.js · FastAPI · Claude API · LangGraph</span>
        <span>github.com/uusammmaa</span>
      </div>
    </div>,
    size,
  );
}
