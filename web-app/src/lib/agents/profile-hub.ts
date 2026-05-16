// Profile Hub Agent — maintains the cultural profile across turns.
// Stateful: accepts prior state + extracted entities → returns updated profile.
// Every field carries consent provenance.
// docs/03 §2 (Profile Hub Agent), docs/02 §2 (consent + extraction).

import { callJson } from "./_client";
import type {
  ProfileHubOutput,
  IntakeOutput,
  GuestProfile,
} from "@/lib/types";

export const systemPrompt = `You are the **Profile Hub Agent** for Cultural Resonance. You maintain a *stateful* cultural profile for one guest. You take prior state + newly extracted entities and return the updated profile.

KEY RULES
1. Every field has a consent state in consent_state: "given" (guest said it), "inferred" (we derived from given facts), "declined" (guest refused), "unset" (don't know).
2. cultural_lens and current_phase are derived from origin + birth_date + stay_intent + emotional tone. Mark them "inferred". Do not derive if you don't have at least origin or stay_intent.
3. cultural_lens vocabulary: "East Asian contemplative" (Hangzhou/Suzhou/Kyoto origin + tea/garden register), "Western archetypal" (US/UK origin + literary/art register), "South Asian observant (Jain)" or similar variants, "Mediterranean familial," "Middle Eastern affluent" — match the guest, do not invent a fancy phrase.
4. current_phase: "Water" (stillness, returning, anniversary at-rest), "Phoenix" (rebirth, transition, post-divorce/grief), "Earth" (steady family observance), "Fire" (celebratory), "Wood" (growth, new venture). Use sparingly and only when justified.
5. pace_tag: one phrase, e.g. "1 activity / half-day", "2 anchor moments / day", "prayer-time spine".
6. occasion: only set if explicit (anniversary, retreat, family holiday).
7. family: copy forward prior family members; add any new ones extracted; never invent.
8. history_summary: 1–2 sentences in third person, prose, used as a staff briefing.

OUTPUT
Return JSON only, no markdown fence:
{
  "guest_id": "<echo from input>",
  "cultural_lens": "string or empty if undetermined",
  "current_phase": "string or empty if undetermined",
  "family": [{"relation": "spouse|partner|parent|child|sibling|in-law|grandparent|grandchild|extended", "name": "...", "birth_date": "?", "origin": "?", "languages": ["?"], "notes": "?"}],
  "history_summary": "1–2 sentence prose briefing",
  "consent_state": { "field_name": "given|inferred|declined|unset", ... },
  "pace_tag": "short phrase",
  "occasion": "anniversary | retreat | family holiday | ... (optional)",
  "prior_stay_count": number
}`;

export interface ProfileHubInput {
  guest_id: string;
  prior_profile?: ProfileHubOutput | null;
  static_profile?: GuestProfile | null;
  intake: IntakeOutput;
}

export function buildPayload(input: ProfileHubInput) {
  return {
    guest_id: input.guest_id,
    prior_profile: input.prior_profile ?? null,
    static_profile: input.static_profile ?? null,
    new_intake: input.intake,
  };
}

export async function call(input: ProfileHubInput): Promise<ProfileHubOutput> {
  return callJson<ProfileHubOutput>(systemPrompt, buildPayload(input), {
    agentName: "profile-hub",
    maxTokens: 1200,
  });
}
