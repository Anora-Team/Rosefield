// POST /api/voice/tts
// Body: { text: string; voice_id?: string; model_id?: string; language_code?: string }
// Response: streaming audio/mpeg, or JSON error on failure.
//
// Why a server route: keeps ELEVENLABS_API_KEY off the client. We forward the
// upstream stream straight to the browser so playback can begin before the
// full synthesis completes.

import { streamTts, ElevenLabsError } from "@/lib/voice/elevenlabs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TtsBody {
  text?: unknown;
  voice_id?: unknown;
  model_id?: unknown;
  language_code?: unknown;
}

export async function POST(request: Request) {
  let body: TtsBody;
  try {
    body = (await request.json()) as TtsBody;
  } catch (err) {
    return Response.json(
      { error: "invalid_json", detail: (err as Error).message },
      { status: 400 },
    );
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return Response.json(
      { error: "missing_fields", detail: "text is required" },
      { status: 400 },
    );
  }

  try {
    const upstream = await streamTts({
      text,
      voice_id: typeof body.voice_id === "string" ? body.voice_id : undefined,
      model_id: typeof body.model_id === "string" ? body.model_id : undefined,
      language_code:
        typeof body.language_code === "string" ? body.language_code : undefined,
    });
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof ElevenLabsError) {
      console.warn("[voice/tts] upstream failed", {
        status: err.status,
        bodySnippet: err.bodySnippet,
      });
      return Response.json(
        { error: "tts_upstream_failed", status: err.status, detail: err.message },
        { status: err.status === 401 ? 401 : 502 },
      );
    }
    console.error("[voice/tts] unexpected", err);
    return Response.json(
      { error: "tts_unexpected", detail: (err as Error).message },
      { status: 500 },
    );
  }
}
