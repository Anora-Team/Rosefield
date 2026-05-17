// ElevenLabs server-side client.
//
// Streams MPEG audio for a given text via the ElevenLabs Text-to-Speech API.
// All ElevenLabs traffic terminates on the server so the API key never leaves
// the host. The route handler ([app/api/voice/tts/route.ts]) calls
// `streamTts` and forwards the body straight to the browser.

const DEFAULT_VOICE_ID = "XB0fDUnXU5powFXDhCwa"; // Charlotte
const DEFAULT_MODEL_ID = "eleven_turbo_v2_5";
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";

export class ElevenLabsError extends Error {
  readonly status: number;
  readonly bodySnippet?: string;
  constructor(message: string, status: number, bodySnippet?: string) {
    super(`[elevenlabs:${status}] ${message}`);
    this.name = "ElevenLabsError";
    this.status = status;
    this.bodySnippet = bodySnippet;
  }
}

export interface TtsRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  /** 0–1; ElevenLabs default is 0.5. Higher = more consistent, lower = more expressive. */
  stability?: number;
  /** 0–1; ElevenLabs default is 0.75. Higher = closer to the voice's training tone. */
  similarity_boost?: number;
  /** Optional language hint for the multilingual model (e.g. "en", "zh"). */
  language_code?: string;
}

/**
 * Fetch a streaming MPEG response from ElevenLabs. Caller is responsible for
 * piping `response.body` to the client. Throws ElevenLabsError on non-2xx.
 */
export async function streamTts(req: TtsRequest): Promise<Response> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new ElevenLabsError("ELEVENLABS_API_KEY is not set", 500);
  }
  if (!req.text || !req.text.trim()) {
    throw new ElevenLabsError("text is required", 400);
  }

  const voiceId =
    req.voice_id ?? process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID;
  const modelId =
    req.model_id ?? process.env.ELEVENLABS_MODEL_ID ?? DEFAULT_MODEL_ID;

  const url = new URL(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream`,
  );
  url.searchParams.set("output_format", DEFAULT_OUTPUT_FORMAT);

  const body: Record<string, unknown> = {
    text: req.text,
    model_id: modelId,
    voice_settings: {
      stability: req.stability ?? 0.45,
      similarity_boost: req.similarity_boost ?? 0.8,
    },
  };
  if (req.language_code) body.language_code = req.language_code;

  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify(body),
  });

  if (!upstream.ok || !upstream.body) {
    const snippet = await upstream.text().catch(() => "");
    throw new ElevenLabsError(
      upstream.statusText || "request failed",
      upstream.status,
      snippet.slice(0, 400),
    );
  }

  return upstream;
}
