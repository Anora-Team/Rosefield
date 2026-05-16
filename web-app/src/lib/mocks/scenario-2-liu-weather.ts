// Liu Scenario 2 — Saturday 11am, fog lifts earlier than forecast.
// Stub used when the context controls advance time/weather.
// Single pipeline snapshot, no multi-turn conversation.

import type { PipelineOutput, ThreadMessage, ContextInput } from "@/lib/types";

export const liuMiddayContext: ContextInput = {
  time: "11:00",
  date: "2026-05-16",
  weather: "clear",
  temperature_f: 64,
  decision_moment: "midday",
};

export const liuWeatherPivotPipeline: PipelineOutput = {
  decision_id: "liu-decision-weather-1",
  source: "fallback",
  sequence: ["intake", "profile", "property", "cultural", "composition", "actions"],
  conversation: {
    turn_type: "reply",
    body:
      "The fog has lifted earlier than expected. The garden is quietest right now, if you'd like a walk.",
    consent_required: false,
    expected_response_shape: "free_text",
  },
  intake: {
    parsed_intents: [
      { intent: "context_shift", detail: "weather: foggy → clear, ahead of forecast" },
    ],
    extracted_entities: { weather: "clear", time: "11:00" },
    profile_gaps: [],
    routing_hint: ["property_hub", "cultural_reasoning"],
  },
  profile: {
    guest_id: "liu",
    cultural_lens: "East Asian contemplative",
    current_phase: "Water — restoration",
    family: [
      { relation: "spouse", name: "Mr. Liu", origin: "Hangzhou", languages: ["zh", "en"] },
    ],
    history_summary: "Tea-on-terrace honored at 8:15. Quiet morning achieved.",
    consent_state: {
      origin: "given",
      stay_intent: "given",
      proactive_planning: "given",
    },
    pace_tag: "1 activity / half-day",
    occasion: "25th anniversary",
    prior_stay_count: 0,
  },
  property: {
    availability: [
      { service: "Garden — water feature", status: "open", notes: "first light caught at 9, still soft" },
      { service: "Madera lunch", status: "limited", notes: "held for tomorrow" },
    ],
    seasonal_context: "Late-spring sun, no wind, ~64°F. Garden quietest 11–12.",
    cultural_resources: [
      { label: "Cantor Arts walk", detail: "alternative if they want movement off-property" },
    ],
    known_gaps: [],
    window_note: "Garden window re-opened by weather shift.",
  },
  cultural: {
    recommendation: "Garden walk now, no escort. Tea service held warm if they return.",
    cultural_reasoning:
      "Restoration > novelty. The proactive whisper is permitted — they signaled openness in the morning consent.",
    alternative_if_context_shifts: "If they decline: silence until evening.",
    emotional_arc_note: "Honor the original register. Don't add a second activity.",
    avoidance_applied: ["no second suggestion stack", "no 'should' framing"],
  },
  composition: {
    final_recommendation: "Whisper a garden window. Stand down if no reply.",
    guest_facing_body:
      "The fog has lifted earlier than expected. The garden is quietest right now, if you'd like a walk.",
    consent_required: false,
    is_welcome_gate_passed: true,
    gate_notes: "Material context shift + prior consent = proactive whisper allowed.",
  },
  actions: {
    routed_tasks: [
      {
        staff_team: "garden",
        task: "Light wipe-down of water feature; ensure path dry; no audible maintenance until 12:30",
        cultural_context: "Quiet window, no announcement, no escort offered.",
        due_by: "Sat 11:10",
        source_decision_id: "liu-decision-weather-1",
      },
      {
        staff_team: "in_room_dining",
        task: "Keep tea warm; do not re-pour or refresh unless requested",
        cultural_context: "If they return: same service, no commentary.",
        due_by: "Sat 12:30",
        source_decision_id: "liu-decision-weather-1",
      },
    ],
  },
};

export const liuWeatherPivotMessage: ThreadMessage = {
  id: "liu-weather-1",
  role: "companion",
  body: liuWeatherPivotPipeline.composition.guest_facing_body,
  timestamp: "2026-05-16T11:00:00-07:00",
  decision_id: liuWeatherPivotPipeline.decision_id,
};
