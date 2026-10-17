/**
 * Fixed-window, in-memory rate limiter keyed by client id (usually IP).
 *
 * State lives in the server instance's memory, so on serverless hosts each
 * warm instance keeps its own counters. That is enough to stop casual abuse of
 * a public demo; swap in a shared store (e.g. Redis) for a hard global limit.
 */
export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the current window resets. */
  retryAfter: number;
};

type Window = { count: number; resetAt: number };

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 5000,
}: {
  limit: number;
  windowMs: number;
  /** Upper bound on tracked clients so memory cannot grow without limit. */
  maxKeys?: number;
}) {
  const windows = new Map<string, Window>();

  function prune(now: number) {
    for (const [key, w] of windows) {
      if (w.resetAt <= now) windows.delete(key);
    }
    // Still full after dropping expired windows: evict oldest insertions.
    while (windows.size >= maxKeys) {
      const oldest = windows.keys().next().value;
      if (oldest === undefined) break;
      windows.delete(oldest);
    }
  }

  return function check(key: string, now = Date.now()): RateLimitResult {
    let w = windows.get(key);
    if (!w || w.resetAt <= now) {
      if (windows.size >= maxKeys) prune(now);
      w = { count: 0, resetAt: now + windowMs };
      windows.set(key, w);
    }

    w.count += 1;
    const retryAfter = Math.max(1, Math.ceil((w.resetAt - now) / 1000));
    return {
      ok: w.count <= limit,
      limit,
      remaining: Math.max(0, limit - w.count),
      retryAfter,
    };
  };
}

/** Best-effort client id. On Vercel these headers are set by the platform. */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "anonymous";
}
