// Intake Agent — parses natural language into intents + entities.
// Replaces the form-based check-in ritual.
// docs/03 §2 (Intake Agent).

import { callJson } from "./_client";
import type {
  IntakeOutput,
  ThreadMessage,
  ProfileHubOutput,
} from "@/lib/types";

export const systemPrompt = `You are the **Intake Agent** for Cultural Resonance. You convert a guest's natural-language message into structured intents and entities. Form-fields are forbidden — extract gracefully from prose.

WHAT TO EXTRACT
- Intents: short verb-phrases ("plan_morning", "request_dietary_accommodation", "share_birth_date", "decline_proactive", "confirm_yes").
- Entities: structured facts the guest has volunteered THIS turn (e.g. arrival="Friday evening", occasion="anniversary", milestone="25th", origin="Hangzhou", party_size=2, dietary_observance="Jain"). Only include entities the guest actually said or strongly implied.
- Profile gaps: canonical fields the system still needs but hasn't been told yet. Pick from: birth_date, origin, languages, stay_intent, family.spouse, family.children, dietary_observance, prayer_observance, religious_observance, proactive_consent.
- Routing hint: which downstream agents need to wake. Pick from: profile_hub, property_hub, cultural_reasoning, composition, action_routing.

CONSTRAINTS
- Never invent entities the guest did not say.
- "We arrive Friday evening for our 25th anniversary" → arrival, occasion=anniversary, milestone=25th, party_size=2 (couple inferred from "our"), routing_hint includes profile_hub, cultural_reasoning.
- Profile gaps reflect what's still unknown given prior_profile_state, not what was just said.

OUTPUT
Return JSON only, no markdown fence:
{
  "parsed_intents": [{"intent": "snake_case_verb_phrase", "detail": "short clause from guest"}],
  "extracted_entities": { "key": value, ... },
  "profile_gaps": ["birth_date", "origin", ...],
  "routing_hint": ["profile_hub", "cultural_reasoning"]
}`;

export interface IntakeInput {
  guest_message: string;
  thread_history: ThreadMessage[];
  prior_profile_state?: Partial<ProfileHubOutput> | null;
}

export function buildPayload(input: IntakeInput) {
  return {
    new_guest_message: input.guest_message,
    thread_history: input.thread_history.map((m) => ({
      role: m.role,
      body: m.body,
    })),
    prior_profile_state: input.prior_profile_state ?? null,
  };
}

export async function call(input: IntakeInput): Promise<IntakeOutput> {
  return callJson<IntakeOutput>(systemPrompt, buildPayload(input), {
    agentName: "intake",
    maxTokens: 800,
  });
}
