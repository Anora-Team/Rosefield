// Mr. & Mrs. Patel — fourth-scenario persona (cross-cultural flash).
// Mumbai, Jain dietary observance, prayer-observant, multi-day family stay.
// Sourced from docs/02-experience-design.md §7 (Scenario 4).
//
// NOTE: This is a *different* Patel from the one in user-profiles/patel-sandhill.json
// (Arjun Patel, Edison NJ). The Mumbai Patels in this fixture are demo-only.

import type { GuestProfile } from "@/lib/types";

export const patelProfile: GuestProfile = {
  id: "patel",
  name: "Mr. & Mrs. Patel",
  origin: "Mumbai, Maharashtra, India",
  birth_date: "1962-09-04", // Mr. Patel; Mrs. Patel's date held in family branch
  languages: ["Hindi", "Gujarati", "English"],
  stay_intent:
    "A few quiet days west-coast. We keep our observances — that comes first.",
  booking_window: "Sunday afternoon – Thursday morning",

  cultural_lens: "South Asian observant (Jain)",
  register: ["dharmic", "vegetarian-strict", "prayer-time", "family", "calm"],
  current_phase: "Earth",
  emotional_anchors: [
    "shared observance with spouse",
    "prayer time as the day's spine",
    "food that respects ahimsa",
    "calm hospitality without performance",
  ],
  avoid: [
    "root vegetables (onion, garlic, potato, carrot, ginger, turmeric root)",
    "alcohol pairings or wine mentions",
    "eggs in any preparation",
    "honey",
    "after-sunset heavy meals",
    "scheduling that ignores prayer windows",
    "presumed dietary 'flexibility'",
  ],

  family: [
    {
      relation: "spouse",
      name: "Mrs. Patel",
      birth_date: "1965-12-19",
      origin: "Mumbai, Maharashtra, India",
      languages: ["Hindi", "Gujarati", "English"],
      notes:
        "Jain observance same as Mr. Patel. Prefers female staff for spa contact; quiet conversational register.",
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
    avoid: "given", // dietary + prayer observance volunteered explicitly
    "family.spouse": "given",
    proactive_messages: "inferred",
    cross_property_share: "unset",
  },
};
