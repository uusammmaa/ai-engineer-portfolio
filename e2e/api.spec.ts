import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

/**
 * A fresh client key per call site, so rate-limit counters never carry over
 * between tests, repeats, or runs against a reused server.
 */
const client = () => ({ "x-forwarded-for": `e2e-${randomUUID()}` });

function userMessage(text: string) {
  return { id: "1", role: "user", parts: [{ type: "text", text }] };
}

test.describe("/api/chat", () => {
  test("reports offline when no model key is configured", async ({
    request,
  }) => {
    const res = await request.get("/api/chat");
    expect(await res.json()).toEqual({ online: false, models: [] });

    const post = await request.post("/api/chat", {
      headers: client(),
      data: { messages: [userMessage("hi")] },
    });
    expect(post.status()).toBe(503);
    expect((await post.json()).code).toBe("offline");
  });

  test("rejects malformed bodies", async ({ request }) => {
    const res = await request.post("/api/chat", {
      headers: { ...client(), "content-type": "application/json" },
      data: "not json",
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("bad_request");
  });

  test("rejects messages over the input limit", async ({ request }) => {
    const res = await request.post("/api/chat", {
      headers: client(),
      data: { messages: [userMessage("x".repeat(2001))] },
    });
    expect(res.status()).toBe(413);
    expect((await res.json()).code).toBe("too_large");
  });

  test("rejects oversized request bodies", async ({ request }) => {
    const res = await request.post("/api/chat", {
      headers: client(),
      data: { messages: [userMessage("hi")], padding: "x".repeat(70 * 1024) },
    });
    expect(res.status()).toBe(413);
  });

  test("rate limits per client", async ({ request }) => {
    // The e2e server runs with CHAT_RATE_LIMIT=5.
    const headers = client();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await request.post("/api/chat", {
        headers,
        data: { messages: [userMessage("hi")] },
      });
      statuses.push(res.status());
      if (res.status() === 429) {
        expect(Number(res.headers()["retry-after"])).toBeGreaterThan(0);
      }
    }
    expect(statuses.slice(0, 5)).not.toContain(429);
    expect(statuses[5]).toBe(429);

    const other = await request.post("/api/chat", {
      headers: client(),
      data: { messages: [userMessage("hi")] },
    });
    expect(other.status()).not.toBe(429);
  });
});
