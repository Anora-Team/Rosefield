// Cultural Resonance — Simulation types
//
// Two simulation modes:
//   1. Per-Stay  → one guest × N hypothetical conditions
//      (weather/time, emotional pivots, surprise events, stay timeline)
//   2. Property-Wide → many VIP guests × property resources
//      (coverage heatmap + ranked curation gaps)
//
// Cached fixtures live in `./fixtures.ts`. Live recompute hits
// `/api/simulate/run` which thin-wraps the pipeline.

export type WeatherKey = "foggy" | "overcast" | "clear" | "sun" | "rain";
export type TimeKey = "06:00" | "09:00" | "12:00" | "15:00" | "20:00";

export type DeltaTone = "baseline" | "shift" | "drift" | "flag";

export interface ConditionCell {
  time: TimeKey;
  weather: WeatherKey;
  headline: string;          // 4–9 words, what the Companion would say / do
  detail: string;            // 1–2 sentences of texture
  routed_to: string[];       // staff teams that change vs baseline
  tone: DeltaTone;           // visual emphasis
}

export interface PivotScenario {
  id: string;
  trigger_message: string;   // hypothetical guest line
  anticipated_response: string;
  routed_to: string[];
  notes: string;
}

export interface SurpriseEvent {
  id: string;
  event: string;
  impact: string;
  prepared_actions: string[];
  risk: "high" | "medium" | "low";
}

export interface TimelineTouchpoint {
  id: string;
  when: string;              // "T-3 days", "Arrival 14:30", "Day 2 06:00"
  anticipated_need: string;
  prepare: string;
  owner: string;             // staff team
}

export interface PerStaySim {
  guest_id: string;
  display_name: string;
  archetype: string;
  baseline_summary: string;  // one paragraph
  matrix: ConditionCell[];   // 5×5 = 25 cells
  pivots: PivotScenario[];
  surprises: SurpriseEvent[];
  timeline: TimelineTouchpoint[];
}

// -----------------------------------------------------------------------------
// Property-wide simulation
// -----------------------------------------------------------------------------

export type ResourceKey =
  | "madera"
  | "in_room_dining"
  | "garden"
  | "spa"
  | "pool"
  | "library_quiet"
  | "prayer_meditation"
  | "tea_program"
  | "concierge_local"
  | "transport_valet";

export interface ResourceMeta {
  key: ResourceKey;
  label: string;
  blurb: string;
}

export type FitLevel =
  | "strong"     // resource is genuinely curated for this guest
  | "neutral"    // works fine, nothing special
  | "soft_gap"   // serviceable but missing register
  | "hard_gap"   // not provided at all
  | "conflict";  // active mismatch (e.g. alcohol-led service for a sober guest)

export interface CoverageCell {
  guest_id: string;
  resource: ResourceKey;
  fit: FitLevel;
  note: string;              // short rationale
}

export interface CurationGap {
  id: string;
  title: string;
  affected_guests: string[]; // display names
  resource: ResourceKey | "cross_cutting";
  severity: "blocking" | "degrading" | "minor";
  recommendation: string;    // what to add / staff / stock
}

export interface PropertyGuestRow {
  id: string;
  display_name: string;
  archetype_short: string;
  flag: string;              // 1–3 words: "Hejazi · halal · multi-gen"
}

export interface PropertySim {
  property_name: string;
  cohort_size: number;
  date_window: string;
  guests: PropertyGuestRow[];
  resources: ResourceMeta[];
  cells: CoverageCell[];
  gaps: CurationGap[];
}
