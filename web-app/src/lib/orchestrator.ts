// Orchestrator — sequential agent pipeline.
// Conversation → Intake → Profile → Property → Cultural → Composition → Actions.
// Returns a full PipelineOutput.
//
// Profile + Property could be parallel, but we keep them sequential so the
// Theater can reveal each panel with its proper sequence label.

import type {
  CompanionTurnRequest,
  PipelineOutput,
  ProfileHubOutput,
  PropertyKnowledge,
  GuestProfile,
} from "@/lib/types";

import * as conversation from "@/lib/agents/conversation";
import * as intake from "@/lib/agents/intake";
import * as profileHub from "@/lib/agents/profile-hub";
import * as propertyHub from "@/lib/agents/property-hub";
import * as culturalReasoning from "@/lib/agents/cultural-reasoning";
import * as composition from "@/lib/agents/composition";
import * as actionRouting from "@/lib/agents/action-routing";
import { AgentCallError } from "@/lib/agents/_client";
import { getPersona } from "@/lib/fixtures/personas";
import { sandHill } from "@/lib/fixtures/properties/sand-hill";

export class PipelineError extends Error {
  readonly stage: string;
  readonly cause?: unknown;
  constructor(stage: string, message: string, cause?: unknown) {
    super(`[pipeline:${stage}] ${message}`);
    this.name = "PipelineError";
    this.stage = stage;
    this.cause = cause;
  }
}

export interface RunPipelineOptions {
  /** Inject a property (otherwise defaults to Sand Hill). */
  property?: PropertyKnowledge;
}

/**
 * Run the full agent pipeline for a single Companion turn.
 * Returns a PipelineOutput marked source = "live".
 */
export async function runPipeline(
  req: CompanionTurnRequest,
  options: RunPipelineOptions = {},
): Promise<PipelineOutput> {
  const property = options.property ?? sandHill;
  const staticProfile: GuestProfile | null = getPersona(req.guest_id);
  const decision_id = makeDecisionId(req.guest_id);

  // 1. Intake
  let intakeOut;
  try {
    intakeOut = await intake.call({
      guest_message: req.message,
      thread_history: req.thread_state.messages,
      prior_profile_state: req.thread_state.last_pipeline?.profile ?? null,
    });
  } catch (err) {
    throw wrap("intake", err);
  }

  // 2. Profile Hub
  let profileOut: ProfileHubOutput;
  try {
    profileOut = await profileHub.call({
      guest_id: req.guest_id,
      prior_profile: req.thread_state.last_pipeline?.profile ?? null,
      static_profile: staticProfile,
      intake: intakeOut,
    });
  } catch (err) {
    throw wrap("profile", err);
  }

  // 3. Property Experience Hub
  let propertyOut;
  try {
    propertyOut = await propertyHub.call({
      property,
      context: req.context,
      profile: profileOut,
    });
  } catch (err) {
    throw wrap("property", err);
  }

  // 4. Cultural Reasoning
  let culturalOut;
  try {
    culturalOut = await culturalReasoning.call({
      profile: profileOut,
      property: propertyOut,
      intake: intakeOut,
      context: req.context,
    });
  } catch (err) {
    throw wrap("cultural", err);
  }

  // 5. Composition
  const openness = guessOpennessSignal(req, intakeOut.parsed_intents);
  let compositionOut;
  try {
    compositionOut = await composition.call({
      cultural: culturalOut,
      property: propertyOut,
      profile: profileOut,
      context: req.context,
      guest_message: req.message,
      guest_signaled_openness: openness,
    });
  } catch (err) {
    throw wrap("composition", err);
  }

  // 6. Action Routing
  let actionsOut;
  try {
    actionsOut = await actionRouting.call({
      composition: compositionOut,
      cultural: culturalOut,
      profile: profileOut,
      property,
      context: req.context,
      decision_id,
    });
  } catch (err) {
    throw wrap("actions", err);
  }

  // 7. Conversation — composed last so it can speak with the final body.
  // The Companion reply uses composition.guest_facing_body as the source of
  // truth; we still pass through the Conversation Agent for register polish
  // and turn_type framing.
  let conversationOut;
  try {
    conversationOut = await conversation.call({
      guest_message: req.message,
      thread_history: req.thread_state.messages,
      context: req.context,
      profile: staticProfile ?? undefined,
      composition_hint: compositionOut.guest_facing_body,
      consent_required_for_this_turn: compositionOut.consent_required,
    });
  } catch (err) {
    throw wrap("conversation", err);
  }

  const pipeline: PipelineOutput = {
    conversation: conversationOut,
    intake: intakeOut,
    profile: profileOut,
    property: propertyOut,
    cultural: culturalOut,
    composition: compositionOut,
    actions: actionsOut,
    sequence: [
      "intake",
      "profile",
      "property",
      "cultural",
      "composition",
      "actions",
    ],
    decision_id,
    source: "live",
  };

  return pipeline;
}

function wrap(stage: string, err: unknown): PipelineError {
  if (err instanceof AgentCallError) {
    return new PipelineError(stage, `${err.kind}: ${err.message}`, err);
  }
  return new PipelineError(stage, (err as Error).message, err);
}

function makeDecisionId(guestId: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `dec_${guestId}_${ts}_${rand}`;
}

/**
 * Did the guest explicitly invite us to plan? We use a coarse heuristic so
 * Composition can pass the "Is This Welcome?" gate even when the prior thread
 * already gave openness consent. Conservative — assume opt-out.
 */
function guessOpennessSignal(
  req: CompanionTurnRequest,
  intents: Array<{ intent: string }>,
): boolean {
  const msg = req.message.toLowerCase();
  const explicit =
    /plan it|please plan|arrange|set it up|go ahead|yes|approve/.test(msg);
  const intent_openness = intents.some((i) =>
    /plan|arrange|consent|confirm|approve|openness/.test(i.intent),
  );
  // The mere act of writing into the Companion thread also counts as openness
  // for the FIRST reply (decision_moment !== "anytime" guides this).
  const first_arrival_window =
    req.context.decision_moment === "pre_arrival" ||
    req.context.decision_moment === "saturday_morning";
  return explicit || intent_openness || first_arrival_window;
}
