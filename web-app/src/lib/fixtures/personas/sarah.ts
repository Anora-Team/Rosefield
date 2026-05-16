// Sarah Anderson — second demo persona (Scenario 3).
// Western archetypal, Phoenix phase, solo post-transition retreat.
// Sourced from docs/02-experience-design.md §7 (Scenario 3) and §3 (Discover/Cantor brief).

import type { GuestProfile } from "@/lib/types";

export const sarahProfile: GuestProfile = {
  id: "sarah",
  name: "Sarah Anderson",
  origin: "Brooklyn, New York",
  birth_date: "1981-07-23",
  languages: ["English"],
  stay_intent:
    "Three days alone after a long chapter ended. I want to meet myself again.",
  booking_window: "Thursday afternoon – Sunday morning (Day 2 of 3)",

  cultural_lens: "Western archetypal",
  register: ["literary", "art-historical", "solitude", "walking", "form"],
  current_phase: "Phoenix",
  emotional_anchors: [
    "self-redefinition after transition",
    "Rodin's Burghers / sculptural weight",
    "art as mirror",
    "solitary morning walks",
  ],
  avoid: [
    "couples framing",
    "consoling tone",
    "wellness clichés",
    "group experiences",
    "probing questions about what changed",
    "treat yourself / celebrate language",
  ],

  family: [],

  consent_state: {
    name: "given",
    origin: "given",
    birth_date: "given",
    languages: "given",
    stay_intent: "given",
    booking_window: "given",
    cultural_lens: "inferred",
    current_phase: "inferred",
    register: "inferred",
    emotional_anchors: "inferred",
    avoid: "inferred",
    proactive_messages: "inferred",
    cross_property_share: "unset",
  },
};
