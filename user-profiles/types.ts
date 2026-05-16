// Simulated guest profiles for Rosefield (Cultural Resonance Concierge).
//
// Architecture reference: docs/03-technical-architecture.md §3
// Thesis reference:       docs/01-product-strategy.md §2
//
// The product takes 3 explicit data points from the guest at check-in
// (birth_date, origin, stay_intent) and derives everything else from
// prior Rosewood stay history + cultural reasoning. These profiles model
// that split explicitly so the Cultural Reasoning Agent can be exercised
// against a realistic spread of Rosewood guest segments.

export interface DirectInput {
  birth_date: string;          // ISO date (YYYY-MM-DD)
  origin: string;              // "City, Country"
  stay_intent: string;         // One sentence in guest's own voice
  languages: string[];
  booking_window: string;      // e.g. "Saturday–Monday, 2 nights"
}

export type FamilyRelation =
  | "spouse" | "partner"
  | "parent" | "child" | "stepchild"
  | "sibling" | "in-law"
  | "grandparent" | "grandchild"
  | "extended";

export interface FamilyMember {
  relation: FamilyRelation;
  name: string;
  birth_date?: string;
  origin?: string;
  languages?: string[];
  notes?: string;              // dietary / mobility / cultural / role-in-this-stay
  traveling_on_this_stay: boolean;
}

export interface StayHistoryItem {
  property: string;            // e.g. "Rosewood Hong Kong"
  dates: string;               // "2024-04-12 to 2024-04-15"
  occasion: string;
  party_composition: string;
  notable_moments: string[];   // staff-logged observations, specific not generic
  service_choices: string[];   // accepted / repeated
  declined_or_unused: string[];// offered but not taken — equally signal-bearing
  memory_artifact_excerpt?: string;
}

export interface StaffRelationship {
  property: string;
  staff: string;               // role + first name OK
  note: string;
}

export interface DerivedFromHistory {
  stays: StayHistoryItem[];
  observed_register: string[];          // e.g. ["seasonal", "tea", "garden"]
  observed_avoidances: string[];
  recurring_staff_relationships: StaffRelationship[];
  cross_property_pattern: string;       // 1-2 sentence narrative
}

export interface CulturalProfileHint {
  cultural_lens: string;
  register: string[];
  current_phase: string;
  emotional_anchors: string[];
  avoid: string[];
}

export interface SimulatedGuestProfile {
  id: string;
  display_name: string;
  archetype_tag: string;
  direct_input: DirectInput;
  family: FamilyMember[];
  derived_from_history: DerivedFromHistory;
  cultural_profile_hint: CulturalProfileHint;
}
