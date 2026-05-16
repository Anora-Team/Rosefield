// Liu Lihua — primary demo persona (Liu Scenario 1).
// East Asian contemplative, Water phase, 25th anniversary, Hangzhou.
// Sourced from docs/02-experience-design.md §7 and docs/03 §3.

import type { GuestProfile } from "@/lib/types";

export const liuProfile: GuestProfile = {
  id: "liu",
  name: "Liu Lihua",
  origin: "Hangzhou, Zhejiang, China",
  birth_date: "1968-11-12",
  languages: ["Mandarin", "English"],
  stay_intent:
    "Our 25th anniversary trip — first time in California. We want it quiet, together.",
  booking_window: "Friday evening – Monday morning",

  // Derived by Cultural Reasoning — provided here as the canonical reading
  // so downstream agents can validate their own derivations against it.
  cultural_lens: "East Asian contemplative",
  register: ["seasonal", "tea", "garden", "stillness", "anniversary"],
  current_phase: "Water",
  emotional_anchors: [
    "returning home together",
    "long marriage at rest",
    "Hangzhou misty mornings",
    "West Lake stillness",
  ],
  avoid: [
    "checklists",
    "group tours",
    "famous-sight chasing",
    "celebrate / discover / experience framing",
    "Western breakfast framings as the default",
    "photo-op staging",
  ],

  family: [
    {
      relation: "spouse",
      name: "老 Mr. Liu",
      birth_date: "1965-03-08",
      origin: "Hangzhou, Zhejiang, China",
      languages: ["Mandarin"],
      notes:
        "Husband, partner in this anniversary trip. Mandarin-preferred; Mrs. Liu typically translates for him in English-language settings.",
    },
  ],

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
    "family.spouse": "given",
    proactive_messages: "given",
    cross_property_share: "unset",
  },
};
