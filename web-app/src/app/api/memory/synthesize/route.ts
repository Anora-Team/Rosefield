// POST /api/memory/synthesize
// Accepts accumulated decision events for one guest, returns a Memory
// Artifact (2-paragraph, in-voice-of-place, optionally bilingual).
//
// Next 16 route handler conventions: see /api/companion/turn/route.ts.

import * as memoryAgent from "@/lib/agents/memory";
import { AgentCallError } from "@/lib/agents/_client";
import { getPersona } from "@/lib/fixtures/personas";
import type {
  MemorySynthesizeRequest,
  MemorySynthesizeResponse,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: MemorySynthesizeRequest;
  try {
    body = (await request.json()) as MemorySynthesizeRequest;
  } catch (err) {
    return Response.json(
      {
        error: "invalid_json",
        detail: (err as Error).message,
      },
      { status: 400 },
    );
  }

  if (!body?.guest_id || !Array.isArray(body.events)) {
    return Response.json(
      {
        error: "missing_fields",
        detail: "guest_id and events[] are required",
      },
      { status: 400 },
    );
  }

  const guestProfile = getPersona(body.guest_id);

  try {
    const memory = await memoryAgent.call({
      guest_profile: guestProfile,
      events: body.events,
    });
    const response: MemorySynthesizeResponse = { memory };
    return Response.json(response);
  } catch (err) {
    const isAgentErr = err instanceof AgentCallError;
    console.warn("[memory/synthesize] agent failed", {
      kind: isAgentErr ? err.kind : "unknown",
      message: (err as Error).message,
    });
    return Response.json(
      {
        error: "memory_agent_failed",
        detail: (err as Error).message,
        kind: isAgentErr ? err.kind : "unknown",
      },
      { status: 503 },
    );
  }
}
