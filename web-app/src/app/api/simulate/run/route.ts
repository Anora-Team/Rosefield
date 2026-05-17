// POST /api/simulate/run
// Live recompute of a single simulation cell. The Per-Stay view calls this
// when the operator clicks "Run live" on a matrix cell — we ask Sonnet 4.6
// to project what would shift for this specific guest archetype under the
// hypothetical (time × weather) condition. Returns a short paragraph that
// the client splices into the cell's detail.
//
// Cached fixtures already cover all 25 cells per guest; this is the
// "watch it think" affordance for stage moments.

import { callJson, AgentCallError } from "@/lib/agents/_client";
import type { ConditionCell } from "@/lib/simulate/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RunRequest {
  guest_id: string;
  display_name: string;
  archetype: string;
  baseline_summary: string;
  cell: ConditionCell;
}

interface RunResponse {
  detail: string;
  source: "live" | "fallback";
}

const SYSTEM_PROMPT = `You are the **Simulation Recompute Agent**. The operator is stress-testing one specific guest archetype under one hypothetical condition (time of day × weather). Your job is to project — in restraint-tuned, property-internal prose — what the property's choreography would actually shift to under this condition.

CONSTRAINTS
- 2–3 sentences only. No headers, no lists, no markdown.
- Specific over generic: name staff teams, name rituals, name objects.
- Cultural register matches the guest archetype. No generic luxury language ("indulge", "unwind", "treat yourself", "experience").
- Do NOT repeat the cached headline verbatim — re-think the cell from the archetype's first principles.
- Surface ONE thing the cached projection might have missed, if anything.

OUTPUT
Return JSON only, no markdown fence:
{ "detail": "..." }`;

export async function POST(request: Request) {
  let body: RunRequest;
  try {
    body = (await request.json()) as RunRequest;
  } catch (err) {
    return Response.json(
      { error: "invalid_json", detail: (err as Error).message },
      { status: 400 },
    );
  }

  if (!body?.guest_id || !body.cell) {
    return Response.json(
      { error: "missing_fields", detail: "guest_id and cell are required" },
      { status: 400 },
    );
  }

  // Fallback ladder: if no API key, return a stable string that still reads.
  if (!process.env.ANTHROPIC_API_KEY) {
    const response: RunResponse = {
      detail:
        "Live recompute requires ANTHROPIC_API_KEY. Cached projection stands; consider it the property's current best read of this cell.",
      source: "fallback",
    };
    return Response.json(response);
  }

  try {
    const result = await callJson<{ detail: string }>(
      SYSTEM_PROMPT,
      {
        guest: {
          id: body.guest_id,
          display_name: body.display_name,
          archetype: body.archetype,
          baseline_summary: body.baseline_summary,
        },
        condition: {
          time: body.cell.time,
          weather: body.cell.weather,
        },
        cached_projection: {
          headline: body.cell.headline,
          detail: body.cell.detail,
          routed_to: body.cell.routed_to,
        },
      },
      { agentName: "simulate-recompute", maxTokens: 500 },
    );

    const response: RunResponse = {
      detail: result.detail,
      source: "live",
    };
    return Response.json(response);
  } catch (err) {
    const message =
      err instanceof AgentCallError
        ? `${err.kind}: ${err.message}`
        : (err as Error)?.message ?? "unknown";
    console.warn("[simulate/run] live recompute failed:", message);
    const response: RunResponse = {
      detail:
        "Live recompute hit an error — cached projection still applies. Check server logs for transport detail.",
      source: "fallback",
    };
    return Response.json(response);
  }
}
