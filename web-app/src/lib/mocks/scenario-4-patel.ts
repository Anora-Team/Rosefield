// Patel family — Mumbai, Jain dietary observance, prayer-time scheduling.
// 30-second flash for the cross-cultural demo beat.

import type { PipelineOutput, ThreadMessage, ContextInput } from "@/lib/types";

export const patelContext: ContextInput = {
  time: "14:00",
  date: "2026-05-16",
  weather: "sun",
  temperature_f: 72,
  decision_moment: "midday",
};

export const patelOpeningMessages: ThreadMessage[] = [
  {
    id: "patel-msg-1",
    role: "guest",
    body:
      "We arrive tomorrow with our parents and the children. We observe Jain dietary practice. Please make sure dinner works.",
    timestamp: "2026-05-15T09:00:00+05:30",
  },
];

export const patelPipeline: PipelineOutput = {
  decision_id: "patel-decision-1",
  source: "fallback",
  sequence: ["intake", "profile", "cultural", "property", "composition", "actions"],
  conversation: {
    turn_type: "reply",
    body:
      "Understood. The kitchen will be briefed before you arrive, and a quiet room is held for prayer times.",
    consent_required: false,
    expected_response_shape: "none",
  },
  intake: {
    parsed_intents: [
      { intent: "dietary_observance", detail: "Jain — no root vegetables, no onion/garlic" },
      { intent: "multi_generational_party", detail: "parents + children + adults" },
      { intent: "prayer_time_scheduling", detail: "implicit — observant household" },
    ],
    extracted_entities: {
      origin: "Mumbai",
      observance: "Jain",
      party_composition: "multi-generational, 6 guests",
    },
    profile_gaps: ["prayer_times_per_day", "children_ages"],
    routing_hint: ["profile_hub", "cultural_reasoning", "property_hub"],
  },
  profile: {
    guest_id: "patel",
    cultural_lens: "South Asian observant",
    current_phase: "Hearth — family-anchored",
    family: [
      { relation: "spouse", name: "Mrs. Patel", origin: "Mumbai", languages: ["en", "hi"] },
      { relation: "parent", name: "Patel-elder (M)", origin: "Mumbai" },
      { relation: "parent", name: "Patel-elder (F)", origin: "Mumbai" },
      { relation: "child", name: "Patel-child-1", origin: "Mumbai" },
      { relation: "child", name: "Patel-child-2", origin: "Mumbai" },
    ],
    history_summary: "First Rosewood stay. Observant household, 6 guests across 3 generations.",
    consent_state: { observance: "given", stay_intent: "given" },
    pace_tag: "2 activities / day · family-paced",
    occasion: "family holiday",
    prior_stay_count: 0,
  },
  property: {
    availability: [
      { service: "Kitchen — Jain-compliant menu", status: "limited", notes: "needs chef brief" },
      { service: "Prayer-quiet room", status: "open", notes: "library, east-facing" },
      { service: "Pool — heated", status: "open" },
    ],
    seasonal_context: "Late spring, warm afternoons. Pool heated for children.",
    cultural_resources: [
      { label: "Jain-compliant produce", detail: "vetted supplier list active since 2024" },
    ],
    known_gaps: [
      { description: "No formal prayer mat inventory — using library cushions", severity: "minor" },
    ],
    window_note: "Library quiet 13:00–14:30 and 18:00–19:00 → align prayer windows.",
  },
  cultural: {
    recommendation: "Jain-vetted dinner menu + library held for prayer times + heated pool for children.",
    cultural_reasoning:
      "Same engine, different cultural mother tongue. The ontology generalizes — no astrology, no stereotype, just observance and pace.",
    alternative_if_context_shifts: "If the family asks for shared meal at communal table: kitchen prepares a single Jain-compliant family menu.",
    emotional_arc_note: "Hearth phase — the work is making the family feel held, not impressed.",
    avoidance_applied: ["no alcohol pairings", "no surprise meat-based amenity", "no children's-menu shortcut"],
  },
  composition: {
    final_recommendation:
      "Kitchen brief + prayer room + heated pool. One quiet line to guest.",
    guest_facing_body:
      "Understood. The kitchen will be briefed before you arrive, and a quiet room is held for prayer times.",
    consent_required: false,
    is_welcome_gate_passed: true,
    gate_notes: "Direct request, immediate operational compliance.",
  },
  actions: {
    routed_tasks: [
      {
        staff_team: "kitchen",
        task: "Brief chef on Jain dietary protocol; vet menu — no root vegetables, no onion/garlic, no honey",
        cultural_context:
          "Observance is not preference. Treat as allergen-strict. Multi-generational party — consider elder texture preferences.",
        due_by: "Fri 14:00",
        source_decision_id: "patel-decision-1",
      },
      {
        staff_team: "concierge",
        task: "Hold library 13:00–14:30 and 18:00–19:00 daily for prayer; place cushions, no audible service nearby",
        cultural_context:
          "East-facing room. No staff entry during held windows.",
        due_by: "Fri 12:00",
        source_decision_id: "patel-decision-1",
      },
      {
        staff_team: "housekeeping",
        task: "Pre-stock children's room with extra towels; confirm pool heated to 84°F by 11:00 daily",
        cultural_context:
          "Family-paced stay. Pool is a daily anchor for the children, not a one-off.",
        due_by: "Fri 11:00",
        source_decision_id: "patel-decision-1",
      },
    ],
  },
};

export const patelReplyMessage: ThreadMessage = {
  id: "patel-msg-2",
  role: "companion",
  body: patelPipeline.composition.guest_facing_body,
  timestamp: "2026-05-15T09:00:30+05:30",
  decision_id: patelPipeline.decision_id,
};
