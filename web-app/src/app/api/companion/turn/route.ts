// POST /api/companion/turn
// Accepts a CompanionTurnRequest, runs the agent pipeline, returns a
// CompanionTurnResponse. On pipeline error or missing API key, falls back
// to a pre-warmed JSON for the matching scenario_hint when one exists.
//
// Next 16 notes (from node_modules/next/dist/docs/01-app/.../route.md):
//  - await request.json() for body
//  - Response.json({...}) for JSON response
//  - runtime: "nodejs" required because we call the Anthropic SDK
//  - dynamic: "force-dynamic" because every request is unique
//  - params is a Promise in v15+ (not used here)

import { runPipeline, PipelineError } from "@/lib/orchestrator";
import { getFallback } from "@/lib/fixtures/fallbacks";
import type {
  CompanionTurnRequest,
  CompanionTurnResponse,
  PipelineOutput,
  ThreadMessage,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: CompanionTurnRequest;
  try {
    body = (await request.json()) as CompanionTurnRequest;
  } catch (err) {
    return Response.json(
      {
        error: "invalid_json",
        detail: (err as Error).message,
      },
      { status: 400 },
    );
  }

  if (!body?.guest_id || typeof body.message !== "string") {
    return Response.json(
      {
        error: "missing_fields",
        detail: "guest_id and message are required",
      },
      { status: 400 },
    );
  }

  // Demo strategy: if a pre-warmed fallback exists for the scenario_hint,
  // return it immediately. The audience sees zero-latency panel reveals and
  // a stable narrative path. Live LLM runs only when no fallback matches
  // (e.g. ad-hoc input during exploration) or when the caller explicitly
  // opts in via header `x-rosefield-mode: live`.
  const preferFallback = request.headers.get("x-rosefield-mode") !== "live";
  let pipeline: PipelineOutput | null = preferFallback
    ? getFallback(body.scenario_hint)
    : null;
  let pipelineError: Error | null = null;

  if (!pipeline) {
    const deadlineMs = Number(process.env.PIPELINE_DEADLINE_MS ?? 45000);
    try {
      pipeline = await Promise.race([
        runPipeline(body),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`pipeline timed out after ${deadlineMs}ms`)),
            deadlineMs,
          ),
        ),
      ]);
    } catch (err) {
      pipelineError = err as Error;
      console.warn(
        "[companion/turn] live pipeline failed; attempting fallback.",
        err instanceof PipelineError
          ? { stage: err.stage, message: err.message }
          : { message: (err as Error).message },
      );
    }

    // Live failed AND we hadn't tried fallback yet — try it now.
    if (!pipeline) {
      const fallback = getFallback(body.scenario_hint);
      if (fallback) {
        pipeline = fallback;
      } else {
        return Response.json(
          {
            error: "pipeline_failed_no_fallback",
            detail: pipelineError?.message ?? "unknown",
            scenario_hint: body.scenario_hint ?? null,
          },
          { status: 503 },
        );
      }
    }
  }

  const new_messages = buildNewMessages(pipeline);

  const response: CompanionTurnResponse = {
    pipeline,
    new_messages,
  };
  return Response.json(response);
}

/**
 * Build the ThreadMessage(s) the Companion sends in response to this turn.
 * Source of truth for the body is composition.guest_facing_body (the
 * restraint-tuned line), polished by the Conversation Agent's body.
 *
 * If the conversation turn_type is "silence", we still emit zero messages.
 * If it's a "confirmation_request", we add an explicit consent affordance.
 */
function buildNewMessages(pipeline: PipelineOutput): ThreadMessage[] {
  const { conversation, composition, decision_id } = pipeline;
  if (conversation.turn_type === "silence" || !conversation.body) {
    return [];
  }

  const now = new Date().toISOString();
  const id = `msg_${decision_id}_companion`;

  const message: ThreadMessage = {
    id,
    role: "companion",
    body: conversation.body,
    timestamp: now,
    consent_required:
      conversation.consent_required || composition.consent_required,
    expected_response_shape: conversation.expected_response_shape,
    decision_id,
  };

  return [message];
}
