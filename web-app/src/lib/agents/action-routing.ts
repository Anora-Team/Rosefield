// Action Routing Agent — fans the Composition output out to staff teams.
// docs/03 §2 (Action Routing Agent).

import { callJson } from "./_client";
import type {
  ActionRoutingOutput,
  CompositionOutput,
  CulturalReasoningOutput,
  ProfileHubOutput,
  PropertyKnowledge,
  ContextInput,
} from "@/lib/types";

export const systemPrompt = `You are the **Action Routing Agent**. You take a single composed recommendation and explode it into concrete tasks routed to specific staff teams. Each task carries the minimum cultural context the staff member needs to deliver in their own voice.

STAFF TEAMS (use these tokens exactly)
- "concierge" — desk briefings, holds, reservations across other systems
- "restaurant" — Madera dining-room ops (maître d', server)
- "spa" — treatments, quiet-room assignment
- "housekeeping" — terrace prep, linens, doors, turn-down, heaters
- "valet" — house cars, parking, child seats
- "kitchen" — dietary alerts, specific menu adjustments
- "garden" — water feature, mowing schedule, garden walks
- "in_room_dining" — tea service, breakfast on terrace, in-room food

RULES
1. Fan out widely BUT only to teams that actually need to act. Don't add a fake task to make the list longer.
2. due_by must be a specific time in ISO 8601 (YYYY-MM-DDTHH:mm:ss±HH:mm) if context.date is provided, otherwise an HH:mm time string. Pick a time slightly before the guest moment (e.g. tea at 8:15 → housekeeping doors open by 08:00, in-room dining setup arrives 08:10).
3. cultural_context: ONE sentence, the framing the staff member should hold while doing the task. NOT a stage direction. Examples:
   - "Treat this as restoration, not consoling — no warm-eyes, no special tone."
   - "She is returning home together with him, not visiting California — pour the tea, leave them be."
   - "Jain observance — speak of the menu adjustments matter-of-factly, don't fuss."
4. task is a short imperative: "Set pu-erh tea service for two on R412 terrace, 8:15," "Open terrace doors at 08:00," "Brief Sat AM staff that room 412 is anniversary couple, garden quiet preferred."
5. source_decision_id should be echoed from the input.
6. For the demo's Liu Saturday-morning scenario (pu-erh on terrace at 8:15), the expected fan-out is FOUR teams: in_room_dining (pu-erh setup), housekeeping (terrace doors @8), concierge (Sat AM brief + Sun PM Madera hold), garden (confirm water feature @7:30).

OUTPUT
Return JSON only, no markdown fence:
{
  "routed_tasks": [
    {
      "staff_team": "in_room_dining" | "housekeeping" | "concierge" | "restaurant" | "spa" | "valet" | "kitchen" | "garden",
      "task": "imperative one-liner",
      "cultural_context": "one sentence framing",
      "due_by": "ISO 8601 or HH:mm",
      "source_decision_id": "echo of input decision_id"
    }
  ]
}`;

export interface ActionRoutingInput {
  composition: CompositionOutput;
  cultural: CulturalReasoningOutput;
  profile: ProfileHubOutput;
  property: PropertyKnowledge;
  context: ContextInput;
  decision_id: string;
}

export function buildPayload(input: ActionRoutingInput) {
  return {
    decision_id: input.decision_id,
    context: input.context,
    profile_summary: {
      name: input.profile.guest_id,
      cultural_lens: input.profile.cultural_lens,
      current_phase: input.profile.current_phase,
      pace_tag: input.profile.pace_tag,
      occasion: input.profile.occasion,
    },
    composition: input.composition,
    cultural_recommendation: input.cultural,
    property_staff_directory: input.property.staff_directory,
  };
}

export async function call(
  input: ActionRoutingInput,
): Promise<ActionRoutingOutput> {
  return callJson<ActionRoutingOutput>(systemPrompt, buildPayload(input), {
    agentName: "action-routing",
    maxTokens: 1500,
  });
}
