// Sarah Anderson — Western archetypal / Phoenix phase.
// Stub used by the persona switcher to demonstrate cultural-register difference.

import type { PipelineOutput, ThreadMessage, ContextInput } from "@/lib/types";

export const sarahContext: ContextInput = {
  time: "18:30",
  date: "2026-05-16",
  weather: "overcast",
  temperature_f: 60,
  decision_moment: "evening",
};

export const sarahOpeningMessages: ThreadMessage[] = [
  {
    id: "sarah-msg-1",
    role: "guest",
    body:
      "I booked the couples wine-pairing tonight. I want to cancel. Just dinner alone.",
    timestamp: "2026-05-16T18:30:00-07:00",
  },
];

export const sarahPivotPipeline: PipelineOutput = {
  decision_id: "sarah-decision-1",
  source: "fallback",
  sequence: ["intake", "profile", "cultural", "property", "composition", "actions"],
  conversation: {
    turn_type: "reply",
    body:
      "Done. The book corner near the fire is yours if you'd like it after.",
    consent_required: false,
    expected_response_shape: "none",
  },
  intake: {
    parsed_intents: [
      { intent: "cancel_reservation", detail: "couples wine-pairing — solo seating instead" },
      { intent: "emotional_signal", detail: "solitude requested, no probing" },
    ],
    extracted_entities: {
      reservation: "couples wine-pairing",
      requested_alternative: "dinner alone",
    },
    profile_gaps: [],
    routing_hint: ["profile_hub", "cultural_reasoning", "action_routing"],
  },
  profile: {
    guest_id: "sarah",
    cultural_lens: "Western archetypal",
    current_phase: "Phoenix — self-redefinition",
    family: [],
    history_summary: "Solo retreat, Day 2 of 3. Couples pairing booked at intake; cancelled.",
    consent_state: {
      origin: "given",
      stay_intent: "given",
      solitude_requested: "given",
    },
    pace_tag: "1 activity / half-day",
    occasion: "post-transition retreat",
    prior_stay_count: 1,
  },
  property: {
    availability: [
      { service: "Madera solo table", status: "open", lead_time_minutes: 5 },
      { service: "Book corner — fireplace", status: "open" },
    ],
    seasonal_context: "Cool evening, fire lit by 19:00.",
    cultural_resources: [
      { label: "Cantor Arts Center", detail: "open through 21:00 if she wants a later walk" },
    ],
    known_gaps: [],
    window_note: "Madera solo seating + book corner = complete restorative arc.",
  },
  cultural: {
    recommendation: "Cancel pairing. Solo seat at Madera. Book corner held silently.",
    cultural_reasoning:
      "Phoenix phase — solitude is the work. No probing, no concern-language, no 'are you alright.' Restorative, not consoling.",
    alternative_if_context_shifts: "If she requests company later: maître d' acknowledges, does not invite.",
    emotional_arc_note: "Tonight is hers. Withdraw the architecture; leave one warm corner.",
    avoidance_applied: ["no 'are you okay' phrasing", "no upsell", "no apology"],
  },
  composition: {
    final_recommendation: "Cancel + solo seat + held corner. One quiet sentence to guest.",
    guest_facing_body:
      "Done. The book corner near the fire is yours if you'd like it after.",
    consent_required: false,
    is_welcome_gate_passed: true,
    gate_notes: "Direct request, immediate compliance. No additional asks.",
  },
  actions: {
    routed_tasks: [
      {
        staff_team: "restaurant",
        task: "Cancel couples wine-pairing for Villa 7; reseat as solo table, banquette side",
        cultural_context:
          "Maître d' note: treat as restorative, not consoling. No commentary, no probing. Wine list offered, not recommended.",
        due_by: "Sat 19:00",
        source_decision_id: "sarah-decision-1",
      },
      {
        staff_team: "concierge",
        task: "Hold the fireplace book corner from 20:30; do not announce or escort",
        cultural_context: "If she walks in, the chair is hers. If she doesn't, no follow-up.",
        due_by: "Sat 20:30",
        source_decision_id: "sarah-decision-1",
      },
    ],
  },
};

export const sarahPivotMessage: ThreadMessage = {
  id: "sarah-msg-2",
  role: "companion",
  body: sarahPivotPipeline.composition.guest_facing_body,
  timestamp: "2026-05-16T18:30:30-07:00",
  decision_id: sarahPivotPipeline.decision_id,
};
