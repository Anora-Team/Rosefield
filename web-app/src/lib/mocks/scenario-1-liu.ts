// Hand-written mock for Liu Scenario 1 — pre-arrival anniversary planning.
// The UI consumes these objects directly so it can run with no live agent layer.
// When the orchestrator lands, the same shapes are returned from /api/companion/turn.
//
// Reference: docs/02-experience-design.md §7 (the wireframe), §4 (voice/specificity).

import type {
  PipelineOutput,
  ThreadMessage,
  ContextInput,
  MemoryOutput,
} from "@/lib/types";

// -----------------------------------------------------------------------------
// Context — pre-arrival, Friday-from-Hangzhou framing
// -----------------------------------------------------------------------------
export const liuPreArrivalContext: ContextInput = {
  time: "08:00",
  date: "2026-05-16",
  weather: "foggy",
  temperature_f: 58,
  decision_moment: "pre_arrival",
};

// -----------------------------------------------------------------------------
// Opening thread — Liu's first message arrives; Companion has not replied yet.
// -----------------------------------------------------------------------------
export const liuOpeningMessages: ThreadMessage[] = [
  {
    id: "liu-msg-1",
    role: "guest",
    body:
      "We arrive Friday evening for our 25th anniversary trip — first time in California. My husband and I are coming from Hangzhou. Anything we should know before we land?",
    timestamp: "2026-05-13T22:14:00+08:00",
  },
];

// -----------------------------------------------------------------------------
// Turn 1 — Companion reads the message and offers (gently) to plan a quiet morning.
// No consent gate yet; just an opening question.
// -----------------------------------------------------------------------------
export const liuTurn1Pipeline: PipelineOutput = {
  decision_id: "liu-decision-1",
  source: "fallback",
  sequence: ["intake", "profile", "cultural", "property", "composition", "actions"],
  conversation: {
    turn_type: "question",
    body:
      "How wonderful. Would you like me to plan a quiet morning for your first day, or wait until you arrive?",
    consent_required: false,
    expected_response_shape: "free_text",
  },
  intake: {
    parsed_intents: [
      { intent: "arrival_logistics", detail: "Friday evening arrival, first US visit" },
      { intent: "occasion_signaled", detail: "25th anniversary" },
      { intent: "plan_morning", detail: "implicit — first full day on property" },
    ],
    extracted_entities: {
      origin: "Hangzhou",
      arrival_day: "Friday evening",
      milestone: "25th anniversary",
      party_size: 2,
      first_visit: true,
    },
    profile_gaps: ["birth_date", "husband_name", "pace_preference"],
    routing_hint: ["profile_hub", "cultural_reasoning"],
  },
  profile: {
    guest_id: "liu",
    cultural_lens: "East Asian contemplative",
    current_phase: "Water — restoration",
    family: [
      { relation: "spouse", name: "Mr. Liu", origin: "Hangzhou", languages: ["zh", "en"] },
    ],
    history_summary: "0 prior stays. First California visit. Anniversary framing.",
    consent_state: {
      origin: "given",
      stay_intent: "given",
      birth_date: "unset",
    },
    pace_tag: "1 activity / half-day",
    occasion: "25th anniversary",
    prior_stay_count: 0,
  },
  property: {
    availability: [
      { service: "Madera private terrace", status: "open", lead_time_minutes: 0 },
      { service: "In-room tea service", status: "open", lead_time_minutes: 12 },
      { service: "Garden water feature", status: "open", notes: "cleaned 7:30" },
    ],
    seasonal_context: "Late spring · coastal fog likely through 9am · oak shade",
    cultural_resources: [
      { label: "Aged pu-erh", detail: "in stock at the tea pantry" },
      { label: "Madera private terrace", detail: "open Saturday mornings, no walk-up" },
    ],
    known_gaps: [],
    window_note: "Garden quiet 7–9am · fog clears mid-morning",
  },
  cultural: {
    recommendation: "Pu-erh on the terrace, 8:15. No agenda after.",
    cultural_reasoning:
      "Hangzhou roots + anniversary framing = 'return,' not 'discover.' Foggy morning mirrors West Lake. Water phase weights stillness over stimulation.",
    alternative_if_context_shifts:
      "If fog lifts early: garden walk at 9, water feature catches first light.",
    emotional_arc_note: "Day 1 should land as arrival, not itinerary.",
    avoidance_applied: ["no group tours", "no checklists", "no 'treat yourself' framing"],
  },
  composition: {
    final_recommendation: "Offer Sat-AM pu-erh on terrace; hold Madera for Sun PM dinner.",
    guest_facing_body:
      "How wonderful. Would you like me to plan a quiet morning for your first day, or wait until you arrive?",
    consent_required: false,
    is_welcome_gate_passed: true,
    gate_notes: "Anniversary mention = openness signal. One quiet question is welcome.",
  },
  actions: {
    routed_tasks: [],
  },
};

// -----------------------------------------------------------------------------
// Turn 2 — Liu replies "Plan it. Quiet." → Companion proposes specifics + consent.
// -----------------------------------------------------------------------------
export const liuTurn2Pipeline: PipelineOutput = {
  decision_id: "liu-decision-2",
  source: "fallback",
  sequence: ["intake", "profile", "cultural", "property", "composition", "actions"],
  conversation: {
    turn_type: "confirmation_request",
    body:
      "Pu-erh on your terrace at 8:15 — only if you wake to it. The garden is empty until nine.",
    consent_required: true,
    expected_response_shape: "yes_no",
  },
  intake: {
    parsed_intents: [
      { intent: "plan_morning", detail: "explicit consent to plan" },
      { intent: "tone_signal", detail: "quiet — minimal-touch register" },
    ],
    extracted_entities: {
      plan_authorization: true,
      register_request: "quiet",
    },
    profile_gaps: ["birth_date"],
    routing_hint: ["cultural_reasoning", "property_hub", "composition"],
  },
  profile: {
    guest_id: "liu",
    cultural_lens: "East Asian contemplative",
    current_phase: "Water — restoration",
    family: [
      { relation: "spouse", name: "Mr. Liu", origin: "Hangzhou", languages: ["zh", "en"] },
    ],
    history_summary: "Plan authorized. Register confirmed: quiet.",
    consent_state: {
      origin: "given",
      stay_intent: "given",
      birth_date: "unset",
      proactive_planning: "given",
    },
    pace_tag: "1 activity / half-day",
    occasion: "25th anniversary",
    prior_stay_count: 0,
  },
  property: {
    availability: [
      { service: "In-room tea service", status: "open", lead_time_minutes: 12 },
      { service: "Madera private terrace", status: "open", notes: "held for Sunday dinner" },
      { service: "Garden water feature", status: "open", notes: "walkable from 7:30" },
    ],
    seasonal_context: "Sat-AM forecast: coastal fog, clearing ~10:30.",
    cultural_resources: [
      { label: "Aged pu-erh", detail: "in stock — sourced from Yunnan, 2018 harvest" },
      { label: "Terrace tea setting", detail: "low table, raw linen, brushed brass kettle" },
    ],
    known_gaps: [],
    window_note: "8:15 lands inside the garden-quiet window (7–9am).",
  },
  cultural: {
    recommendation: "Aged pu-erh, terrace, 8:15. Open the doors at 8 sharp.",
    cultural_reasoning:
      "Pu-erh (not green) honors the season and the register. Terrace at 8:15 catches fog before lift — Hangzhou morning rhyme. Wording avoids 'experience' / 'discover'.",
    alternative_if_context_shifts:
      "If they sleep late: tea held warm, garden walk option at 9 with no escort.",
    emotional_arc_note: "Specific enough to feel anticipated, loose enough to refuse.",
    avoidance_applied: ["no greeting card", "no welcome amenity stack", "no photographer"],
  },
  composition: {
    final_recommendation:
      "Pu-erh service, terrace, 8:15, with a quiet retreat path. Consent before fan-out.",
    guest_facing_body:
      "Pu-erh on your terrace at 8:15 — only if you wake to it. The garden is empty until nine.",
    consent_required: true,
    is_welcome_gate_passed: true,
    gate_notes: "Restraint-tuned: one line, one specific, one out.",
  },
  actions: {
    // Actions are drafted but not LIVE — they fan out after consent (Turn 3).
    routed_tasks: [],
  },
};

// -----------------------------------------------------------------------------
// Turn 3 — Liu clicks Yes → Theater logs consent; Actions go LIVE with 4 tasks.
// -----------------------------------------------------------------------------
export const liuTurn3Pipeline: PipelineOutput = {
  decision_id: "liu-decision-3",
  source: "fallback",
  sequence: ["intake", "profile", "cultural", "property", "composition", "actions"],
  conversation: {
    turn_type: "reply",
    body:
      "Done. Sleep well. If anything shifts overnight, I'll write you here, not before.",
    consent_required: false,
    expected_response_shape: "none",
  },
  intake: {
    parsed_intents: [
      { intent: "consent_given", detail: "Yes to pu-erh terrace 8:15" },
    ],
    extracted_entities: {
      consent: "yes",
      decision_id: "liu-decision-2",
    },
    profile_gaps: ["birth_date"],
    routing_hint: ["action_routing"],
  },
  profile: {
    guest_id: "liu",
    cultural_lens: "East Asian contemplative",
    current_phase: "Water — restoration",
    family: [
      { relation: "spouse", name: "Mr. Liu", origin: "Hangzhou", languages: ["zh", "en"] },
    ],
    history_summary: "Plan confirmed. Actions live across 4 staff teams.",
    consent_state: {
      origin: "given",
      stay_intent: "given",
      birth_date: "unset",
      proactive_planning: "given",
      sat_am_plan: "given",
    },
    pace_tag: "1 activity / half-day",
    occasion: "25th anniversary",
    prior_stay_count: 0,
  },
  property: {
    availability: [
      { service: "In-room dining — pu-erh setup", status: "open", lead_time_minutes: 12 },
      { service: "Housekeeping — terrace open", status: "open" },
      { service: "Concierge desk — Saturday brief", status: "open" },
      { service: "Garden team — water feature", status: "open" },
    ],
    seasonal_context: "Sat-AM: coastal fog confirmed through 9am.",
    cultural_resources: [
      { label: "Aged pu-erh", detail: "pulled for Room 412 · 2018 Yunnan" },
    ],
    known_gaps: [],
    window_note: "All four routings land inside the garden-quiet window.",
  },
  cultural: {
    recommendation: "Hold the register across all four teams — quiet, anticipatory, no chatter.",
    cultural_reasoning:
      "Each touch should feel like the room remembered, not like service arrived. No greetings cards, no announcements.",
    alternative_if_context_shifts: "If fog lifts early, garden team flags a 9am walk option.",
    emotional_arc_note: "First touch of the stay. Set the register for everything after.",
    avoidance_applied: ["no announcement", "no welcome card", "no photographer"],
  },
  composition: {
    final_recommendation: "Fan out to 4 staff teams. All actions LIVE.",
    guest_facing_body:
      "Done. Sleep well. If anything shifts overnight, I'll write you here, not before.",
    consent_required: false,
    is_welcome_gate_passed: true,
    gate_notes: "Consent given → actions LIVE. Companion retreats to silence.",
  },
  actions: {
    routed_tasks: [
      {
        staff_team: "in_room_dining",
        task: "Pu-erh setup for Room 412 terrace, ready 8:15 Saturday",
        cultural_context:
          "Aged pu-erh (2018 Yunnan), not green. Low table, raw linen, brushed brass kettle. No greeting card.",
        due_by: "Sat 08:00",
        source_decision_id: "liu-decision-2",
      },
      {
        staff_team: "housekeeping",
        task: "Open terrace doors and air the room at 08:00 sharp, Room 412",
        cultural_context:
          "Silent entry. Window cracked 2 inches. Linen napkin folded, not draped.",
        due_by: "Sat 08:00",
        source_decision_id: "liu-decision-2",
      },
      {
        staff_team: "concierge",
        task: "Brief Saturday-AM concierge: Liu 412 has tea-on-terrace; hold Madera private terrace for Sunday dinner",
        cultural_context:
          "Pace tag 1-per-half-day. Do not surface activity suggestions unless asked. Anniversary framing — 'return,' not 'discover.'",
        due_by: "Sat 07:00",
        source_decision_id: "liu-decision-2",
      },
      {
        staff_team: "garden",
        task: "Confirm water feature operating by 07:30; flag any maintenance to concierge",
        cultural_context:
          "Garden quiet window 7–9am is the cultural anchor. Water feature catches first light around 9.",
        due_by: "Sat 07:30",
        source_decision_id: "liu-decision-2",
      },
    ],
  },
};

// -----------------------------------------------------------------------------
// Demo helper — given a turn index, return the pipeline + the new messages.
// Used by page.tsx as the fallback path when /api/companion/turn is unavailable.
// -----------------------------------------------------------------------------
export interface MockTurn {
  pipeline: PipelineOutput;
  new_messages: ThreadMessage[];
}

export const liuTurnSequence: MockTurn[] = [
  {
    pipeline: liuTurn1Pipeline,
    new_messages: [
      {
        id: "liu-msg-2",
        role: "companion",
        body: liuTurn1Pipeline.composition.guest_facing_body,
        timestamp: "2026-05-13T22:14:30+08:00",
        decision_id: liuTurn1Pipeline.decision_id,
      },
    ],
  },
  {
    pipeline: liuTurn2Pipeline,
    new_messages: [
      {
        id: "liu-msg-4",
        role: "companion",
        body: liuTurn2Pipeline.composition.guest_facing_body,
        timestamp: "2026-05-13T22:15:10+08:00",
        consent_required: true,
        expected_response_shape: "yes_no",
        decision_id: liuTurn2Pipeline.decision_id,
      },
    ],
  },
  {
    pipeline: liuTurn3Pipeline,
    new_messages: [
      {
        id: "liu-msg-6",
        role: "companion",
        body: liuTurn3Pipeline.composition.guest_facing_body,
        timestamp: "2026-05-13T22:15:40+08:00",
        decision_id: liuTurn3Pipeline.decision_id,
      },
    ],
  },
];

// Echoes of the guest's side, so the page can append the right "user" turn
// when the API is unavailable. (Turn 1's user message is already in
// `liuOpeningMessages` — these are turns 2 and 3.)
export const liuGuestEchoes: ThreadMessage[] = [
  {
    id: "liu-msg-3",
    role: "guest",
    body: "Plan it. Quiet.",
    timestamp: "2026-05-13T22:14:55+08:00",
  },
  {
    id: "liu-msg-5",
    role: "guest",
    body: "Yes.",
    timestamp: "2026-05-13T22:15:25+08:00",
  },
];

// -----------------------------------------------------------------------------
// Memory artifact — Liu's contemplative bilingual close (rendered at scenario end)
// -----------------------------------------------------------------------------
export const liuMemoryArtifact: MemoryOutput = {
  memory_artifact: `Sand Hill remembers a Saturday that began in mist. The fog sat low over the oaks that morning — the kind of stillness that doesn't ask to be broken. You took your tea on the terrace while the garden was still yours alone, and the pu-erh carried something of West Lake across the Pacific.

那个周六的雾气，和杭州清晨的一样轻。你们在雾里重新找到了"回家"的节奏——不是探索，不是抵达，只是回到彼此身边。这是Sand Hill记得的。`,
  language: "mixed",
  register: "contemplative",
};
