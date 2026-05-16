// Shared Anthropic SDK helper for all eight agents.
// Each agent module imports `callJson` and passes a system prompt + a JSON
// payload describing the input. The model is instructed (in its own system
// prompt) to return JSON only — we parse it here, with a single retry on
// parse failure (asking the model to repair its own output).

import Anthropic from "@anthropic-ai/sdk";

// Sonnet 4.6 — sponsor stack per docs/03 §12.
export const MODEL_ID = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 1500;

// Lazy singleton so we don't create a client during module import (helps Next
// dev rebuilds and avoids surprises when the env var is missing at import).
let _client: Anthropic | null = null;
function client(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AgentCallError(
      "ANTHROPIC_API_KEY not set in environment — cannot call Claude.",
      "missing_api_key",
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

export class AgentCallError extends Error {
  readonly kind:
    | "missing_api_key"
    | "transport"
    | "parse"
    | "validation"
    | "unknown";
  readonly raw?: string;
  constructor(
    message: string,
    kind: AgentCallError["kind"],
    raw?: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "AgentCallError";
    this.kind = kind;
    this.raw = raw;
  }
}

interface CallJsonOptions {
  maxTokens?: number;
  /** Optional human-readable name to make errors easier to attribute. */
  agentName?: string;
}

/**
 * Call Claude Sonnet 4.6 with a system prompt + a JSON-stringified user
 * payload. Expect a JSON object back; parse and return it as T.
 *
 * Retries once on parse failure by asking the model to repair its own output.
 */
export async function callJson<T>(
  systemPrompt: string,
  userPayload: unknown,
  options: CallJsonOptions = {},
): Promise<T> {
  const agentName = options.agentName ?? "agent";
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
  const userMessage = JSON.stringify(userPayload, null, 2);

  let raw: string;
  try {
    raw = await complete(systemPrompt, userMessage, maxTokens);
  } catch (err) {
    if (err instanceof AgentCallError) throw err;
    throw new AgentCallError(
      `[${agentName}] transport error calling Claude: ${(err as Error).message}`,
      "transport",
      undefined,
      { cause: err },
    );
  }

  const firstAttempt = tryParseJson<T>(raw);
  if (firstAttempt.ok) return firstAttempt.value;

  // Retry once: send the bad output back and ask for a repair.
  const repairPrompt =
    systemPrompt +
    "\n\nIMPORTANT: Your previous output was not valid JSON. Reply with JSON only — no prose, no markdown fences, no explanation.";
  let repairRaw: string;
  try {
    repairRaw = await complete(
      repairPrompt,
      [
        "The previous attempt produced this output, which failed to parse:",
        "---",
        raw,
        "---",
        "Original input was:",
        userMessage,
        "Return JSON only.",
      ].join("\n"),
      maxTokens,
    );
  } catch (err) {
    throw new AgentCallError(
      `[${agentName}] repair attempt failed: ${(err as Error).message}`,
      "transport",
      raw,
      { cause: err },
    );
  }

  const secondAttempt = tryParseJson<T>(repairRaw);
  if (secondAttempt.ok) return secondAttempt.value;

  throw new AgentCallError(
    `[${agentName}] could not parse JSON from Claude after one retry.`,
    "parse",
    repairRaw,
  );
}

async function complete(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
): Promise<string> {
  const message = await client().messages.create({
    model: MODEL_ID,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  // The Anthropic SDK returns content as an array of blocks; gather text.
  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("\n")
    .trim();
  return text;
}

function tryParseJson<T>(
  raw: string,
): { ok: true; value: T } | { ok: false; error: string } {
  if (!raw) return { ok: false, error: "empty response" };

  // Strip common markdown fences if present.
  let candidate = raw.trim();
  if (candidate.startsWith("```")) {
    candidate = candidate.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
    candidate = candidate.trim();
  }

  // Find first { and last } to be forgiving of leading/trailing prose.
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    candidate = candidate.slice(firstBrace, lastBrace + 1);
  }

  try {
    const value = JSON.parse(candidate) as T;
    return { ok: true, value };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
