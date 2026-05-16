// Shared schemas for the Cultural Resonance pipeline.
// Sourced from docs/03-technical-architecture.md §2 (agent outputs) + §3 (data model).
// Both the agent layer and the UI render against these types.

// -----------------------------------------------------------------------------
// Guest profile / persona
// -----------------------------------------------------------------------------
export type FamilyRelation =
  | "spouse"
  | "partner"
  | "parent"
  | "child"
  | "sibling"
  | "in-law"
  | "grandparent"
  | "grandchild"
  | "extended";

export interface FamilyMember {
  relation: FamilyRelation;
  name: string;
  birth_date?: string;
  origin?: string;
  languages?: string[];
  notes?: string;
}

export type ConsentLevel = "given" | "inferred" | "declined" | "unset";

export interface GuestProfile {
  id: string;
  name: string;
  origin: string;
  birth_date: string;
  languages: string[];
  stay_intent: string;
  booking_window: string;

  // Derived (Cultural Reasoning)
  cultural_lens: string;
  register: string[];
  current_phase: string;
  emotional_anchors: string[];
  avoid: string[];

  // Family branches (sibling profiles linked by consent)
  family: FamilyMember[];

  // Per-field consent state (e.g. { birth_date: "given", origin: "inferred" })
  consent_state: Record<string, ConsentLevel>;
}

// -----------------------------------------------------------------------------
// Property knowledge
// -----------------------------------------------------------------------------
export interface ServiceState {
  service: string; // "Madera private terrace"
  status: "open" | "limited" | "closed";
  lead_time_minutes?: number;
  notes?: string;
}

export interface SeasonalEvent {
  date_range: string;
  label: string;
  notes: string;
}

export interface StaffMember {
  team:
    | "concierge"
    | "restaurant"
    | "spa"
    | "housekeeping"
    | "valet"
    | "kitchen"
    | "garden"
    | "in_room_dining";
  name: string;
  role: string;
}

export interface CulturalResource {
  label: string; // "aged pu-erh in stock"
  detail: string;
}

export interface PropertyKnowledge {
  property_id: string;
  name: string;
  location: string;
  sense_of_place: string;
  available_services: ServiceState[];
  seasonal_calendar: SeasonalEvent[];
  cultural_resources: CulturalResource[];
  local_knowledge: string[];
  staff_directory: StaffMember[];
}

// -----------------------------------------------------------------------------
// Context (the "now" — time, weather, decision moment)
// -----------------------------------------------------------------------------
export type DecisionMoment =
  | "pre_arrival"
  | "saturday_morning"
  | "midday"
  | "evening"
  | "departure"
  | "anytime";

export interface ContextInput {
  time: string; // "08:00"
  date?: string; // ISO date
  weather: "foggy" | "clear" | "rain" | "sun" | "overcast";
  temperature_f?: number;
  decision_moment: DecisionMoment;
}

// -----------------------------------------------------------------------------
// Agent outputs (one interface per agent — see docs/03 §2)
// -----------------------------------------------------------------------------

export interface ConversationOutput {
  turn_type: "reply" | "question" | "confirmation_request" | "silence";
  body: string;
  consent_required: boolean;
  expected_response_shape: "yes_no" | "free_text" | "adjust" | "none";
}

export interface Intent {
  intent: string; // "plan_morning"
  detail: string;
}

export interface IntakeOutput {
  parsed_intents: Intent[];
  extracted_entities: Record<string, string | number | boolean>;
  profile_gaps: string[];
  routing_hint: string[]; // ["profile_hub", "cultural_reasoning"]
}

export interface ProfileHubOutput {
  guest_id: string;
  cultural_lens: string;
  current_phase: string;
  family: FamilyMember[];
  history_summary: string;
  consent_state: Record<string, ConsentLevel>;
  pace_tag: string; // "1 activity / half-day"
  occasion?: string;
  prior_stay_count: number;
}

export interface Gap {
  description: string;
  severity: "blocking" | "degrading" | "minor";
}

export interface PropertyExperienceOutput {
  availability: ServiceState[];
  seasonal_context: string;
  cultural_resources: CulturalResource[];
  known_gaps: Gap[];
  window_note: string; // "garden quiet 7–9am"
}

export interface CulturalReasoningOutput {
  recommendation: string;
  cultural_reasoning: string;
  alternative_if_context_shifts: string;
  emotional_arc_note: string;
  avoidance_applied: string[];
}

export interface CompositionOutput {
  final_recommendation: string;
  guest_facing_body: string; // restraint-tuned, one quiet line for Companion
  consent_required: boolean;
  is_welcome_gate_passed: boolean;
  gate_notes: string;
}

export type StaffTeam = StaffMember["team"];

export interface RoutedTask {
  staff_team: StaffTeam;
  task: string;
  cultural_context: string;
  due_by: string;
  source_decision_id: string;
}

export interface ActionRoutingOutput {
  routed_tasks: RoutedTask[];
}

export interface MemoryOutput {
  memory_artifact: string;
  language: "en" | "zh" | "mixed" | "ko" | "ar" | "hi";
  register: "contemplative" | "literary" | "seasonal" | "ceremonial";
}

// -----------------------------------------------------------------------------
// Pipeline orchestration
// -----------------------------------------------------------------------------

// The visible labels for the Theater reveal sequence.
export type SequenceLabel =
  | "intake"
  | "profile"
  | "property"
  | "cultural"
  | "composition"
  | "actions";

export interface PipelineOutput {
  conversation: ConversationOutput;
  intake: IntakeOutput;
  profile: ProfileHubOutput;
  property: PropertyExperienceOutput;
  cultural: CulturalReasoningOutput;
  composition: CompositionOutput;
  actions: ActionRoutingOutput;
  sequence: SequenceLabel[]; // canonical reveal order
  decision_id: string;
  source: "live" | "fallback";
}

// -----------------------------------------------------------------------------
// Companion thread
// -----------------------------------------------------------------------------
export type MessageRole = "guest" | "companion";

export interface ThreadMessage {
  id: string;
  role: MessageRole;
  body: string;
  timestamp: string;
  consent_required?: boolean;
  expected_response_shape?: ConversationOutput["expected_response_shape"];
  // If this message is the result of a pipeline run, attach the decision id
  decision_id?: string;
}

export interface ThreadState {
  guest_id: string;
  messages: ThreadMessage[];
  // Last-known pipeline output drives the Theater panels.
  last_pipeline?: PipelineOutput;
}

// -----------------------------------------------------------------------------
// API contracts
// -----------------------------------------------------------------------------

export interface CompanionTurnRequest {
  guest_id: string;
  message: string;
  thread_state: ThreadState;
  context: ContextInput;
  // Used for fallback keying when LLM is unavailable
  scenario_hint?: string;
}

export interface CompanionTurnResponse {
  pipeline: PipelineOutput;
  new_messages: ThreadMessage[];
}

export interface MemorySynthesizeRequest {
  guest_id: string;
  events: Array<{
    decision_id: string;
    summary: string;
    timestamp: string;
  }>;
}

export interface MemorySynthesizeResponse {
  memory: MemoryOutput;
}
