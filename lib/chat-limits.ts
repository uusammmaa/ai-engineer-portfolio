/** Shared by the /api/chat route and the coach UI so both enforce the same caps. */
export const CHAT_LIMITS = {
  /** Longest single user message, in characters. */
  maxInputChars: 2000,
  /** Raw request body cap. Covers the whole thread the client resends. */
  maxBodyBytes: 64 * 1024,
  /** Only the most recent messages are forwarded to the model. */
  maxHistoryMessages: 20,
  /** Default requests per client per window; override with CHAT_RATE_LIMIT. */
  rateLimit: 10,
  rateWindowMs: 60_000,
} as const;

/** Error codes the coach UI understands. */
export type ChatErrorCode =
  | "offline"
  | "rate_limited"
  | "too_large"
  | "bad_request"
  | "upstream";

export type ChatErrorBody = { error: string; code: ChatErrorCode };

/** useChat surfaces non-2xx bodies as Error.message; recover our JSON shape. */
export function parseChatError(err: unknown): ChatErrorBody | null {
  if (!(err instanceof Error)) return null;
  try {
    const parsed = JSON.parse(err.message) as Partial<ChatErrorBody>;
    if (typeof parsed.error === "string" && typeof parsed.code === "string") {
      return parsed as ChatErrorBody;
    }
  } catch {
    /* not our JSON */
  }
  return null;
}
