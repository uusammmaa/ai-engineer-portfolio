import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import {
  CHAT_LIMITS,
  type ChatErrorBody,
  type ChatErrorCode,
} from "@/lib/chat-limits";
import {
  CHAT_MODELS,
  DEFAULT_CHAT_MODEL_ID,
  getChatModelConfig,
  type ChatModelConfig,
} from "@/lib/chat-models";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

const SYSTEM = `You are a personal branding coach for software engineers.
        Help with LinkedIn optimization, portfolio presentation,
        GitHub profiles, resume tailoring, and thought leadership.
        Be concise, actionable, and specific to software engineering.`;

const rateLimit = createRateLimiter({
  limit:
    Number.parseInt(process.env.CHAT_RATE_LIMIT ?? "", 10) ||
    CHAT_LIMITS.rateLimit,
  windowMs: CHAT_LIMITS.rateWindowMs,
});

function jsonError(
  message: string,
  code: ChatErrorCode,
  status: number,
  headers: Record<string, string> = {},
) {
  const body: ChatErrorBody = { error: message, code };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function apiKeyFor(config: ChatModelConfig): string | undefined {
  return config.provider === "openai"
    ? process.env.OPEN_AI_API_KEY
    : process.env.ANTHROPIC_API_KEY;
}

function messageText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("");
}

function isUIMessageArray(value: unknown): value is UIMessage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (m) =>
        typeof m === "object" &&
        m !== null &&
        typeof (m as UIMessage).role === "string" &&
        Array.isArray((m as UIMessage).parts),
    )
  );
}

/** Caps model cost per request; keeps the trimmed thread starting on a user turn. */
function recentHistory(messages: UIMessage[]): UIMessage[] {
  const recent = messages.slice(-CHAT_LIMITS.maxHistoryMessages);
  const firstUser = recent.findIndex((m) => m.role === "user");
  return firstUser > 0 ? recent.slice(firstUser) : recent;
}

/** Lets the coach UI show the offline state before anyone types. */
export function GET() {
  const models = CHAT_MODELS.filter((m) => Boolean(apiKeyFor(m))).map(
    (m) => m.id,
  );
  return Response.json(
    { online: models.length > 0, models },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req));
  const rateHeaders = {
    "X-RateLimit-Limit": String(limit.limit),
    "X-RateLimit-Remaining": String(limit.remaining),
  };
  if (!limit.ok) {
    return jsonError(
      `Too many messages. Try again in ${limit.retryAfter}s.`,
      "rate_limited",
      429,
      { ...rateHeaders, "Retry-After": String(limit.retryAfter) },
    );
  }

  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > CHAT_LIMITS.maxBodyBytes) {
    return jsonError("Request is too large.", "too_large", 413);
  }

  let body: { messages?: unknown; model?: unknown };
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > CHAT_LIMITS.maxBodyBytes) {
      return jsonError("Request is too large.", "too_large", 413);
    }
    body = JSON.parse(raw);
  } catch {
    return jsonError("Request body must be JSON.", "bad_request", 400);
  }

  const { messages, model: modelIdRaw } = body;
  if (!isUIMessageArray(messages) || messages.length === 0) {
    return jsonError(
      "`messages` must be a non-empty array.",
      "bad_request",
      400,
    );
  }

  const tooLong = messages.some(
    (m) =>
      m.role === "user" && messageText(m).length > CHAT_LIMITS.maxInputChars,
  );
  if (tooLong) {
    return jsonError(
      `Messages are limited to ${CHAT_LIMITS.maxInputChars} characters.`,
      "too_large",
      413,
    );
  }

  const modelId =
    typeof modelIdRaw === "string" && modelIdRaw.trim()
      ? modelIdRaw.trim()
      : DEFAULT_CHAT_MODEL_ID;

  const config = getChatModelConfig(modelId);
  if (!config) {
    return jsonError(`Unknown model: ${modelId}`, "bad_request", 400);
  }

  const apiKey = apiKeyFor(config);
  if (!apiKey) {
    return jsonError(
      `${config.label} is not configured on this deployment.`,
      "offline",
      503,
    );
  }

  try {
    const model =
      config.provider === "openai"
        ? createOpenAI({ apiKey })(config.sdkModelId)
        : createAnthropic({ apiKey })(config.sdkModelId);

    const result = streamText({
      model,
      system: SYSTEM,
      messages: await convertToModelMessages(recentHistory(messages)),
      ...(config.provider === "openai"
        ? {
            maxOutputTokens: 4096,
            providerOptions: {
              openai: {
                reasoningEffort: "minimal" as const,
              },
            },
          }
        : { maxOutputTokens: 1024 }),
    });

    return result.toUIMessageStreamResponse({ headers: rateHeaders });
  } catch (error) {
    console.error("Chat API error:", error);
    return jsonError("The model request failed.", "upstream", 502);
  }
}
