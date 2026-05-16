# Technical Architecture — Principal Engineer Perspective

**Document owner:** Engineering
**Status:** v1.0
**Last updated:** 2026-05-16

---

## 1. System Overview

### Architecture Philosophy

The system is a **three-pillar, prompt-decomposed multi-agent platform**. One Cultural Resonance substrate feeds three distinct surfaces:

- **Guest Companion** — a single conversational thread per guest (text or voice), restraint-tuned, lifecycle-long, in-thread Memory Artifact
- **Operations Theater** — multi-agent reasoning made visible, with Action Routing fanning recommendations out to specific staff teams (concierge, restaurant, spa, housekeeping, valet, kitchen, garden)
- **Operator Portal** — a simulation environment that runs synthetic guest cohorts through the property's calendar and surfaces gaps before guests do

Asymmetry across surfaces is the architectural feature: **guest sees ~10%, staff sees ~100% of the reasoning, operator sees the system's own failure modes.** All three consume the same underlying agent outputs through different renderer rules.

The agents are logically separated in prompt architecture; runtime implementation uses parallel LLM calls. Some agents are stateless (Cultural Reasoning, Composition); others are stateful and persist across the lifecycle (Profile Hub, Property Experience Hub).

### High-Level Data Flow — Route A (Live Operating View)

```
[Guest message / voice input]
            │
            ▼
   ┌─────────────────┐
   │  Conversation   │  ◀── owns the guest-facing thread,
   │     Agent       │       turn-taking, consent loops
   └────────┬────────┘
            ▼
   ┌─────────────────┐
   │     Intake      │  ◀── parses natural language into
   │     Agent       │       structured intents + entity extraction
   └────────┬────────┘
            │
            ├──── enrich ───────────────┐
            │                            │
   ┌────────▼────────┐          ┌────────▼────────┐
   │  Profile Hub    │          │ Property Exp.   │
   │     Agent       │◀────────▶│     Hub Agent   │
   │ (family, history,│          │ (weather, season,│
   │  consent state) │          │  availability,   │
   │                 │          │  gaps, calendar) │
   └────────┬────────┘          └────────┬─────────┘
            │                            │
            └────────────┬───────────────┘
                         ▼
                ┌────────────────┐
                │  Cultural      │  ◀── lens, phase, register, avoidances
                │  Reasoning     │
                │    Agent       │
                └────────┬───────┘
                         ▼
                ┌────────────────┐
                │  Composition   │  ◀── balances cultural ideal with
                │     Agent      │       operational reality + gates
                └────────┬───────┘
                         │
            ┌────────────┼────────────┐
            ▼                         ▼
   ┌─────────────────┐       ┌────────────────────┐
   │   GUEST         │       │  ACTION ROUTING    │
   │   RENDERER      │       │      AGENT         │
   │                 │       │                    │
   │ • One quiet line│       │ Fans out to staff: │
   │ • In-thread     │       │  • Concierge desk  │
   │ • Consent prompt│       │  • Restaurant      │
   │ • No reasoning  │       │  • Spa             │
   └────────┬────────┘       │  • Housekeeping    │
            │                 │  • Valet / kitchen │
            ▼                 │  • Garden / etc.   │
   ┌─────────────────┐       └─────────┬──────────┘
   │ Companion thread│                 │
   │ (web/mobile/    │                 ▼
   │  voice/WeChat)  │       ┌────────────────────┐
   └─────────────────┘       │ THEATER RENDERER   │
                              │  • Every agent     │
                              │    panel visible   │
                              │  • Sources + why   │
                              │  • Routed actions  │
                              └─────────┬──────────┘
                                        ▼
                              ┌────────────────────┐
                              │ Cockpit (Discover/ │
                              │  Arrange/Reference)│
                              │ + live agent view  │
                              └────────────────────┘

                              ┌────────────────────┐
                              │   Memory Agent     │  ◀── runs at post-stay
                              │ (accumulates events│       boundary; writes
                              │  → Memory Artifact)│       in-thread Artifact
                              └────────────────────┘
```

All renderers consume **identical agent outputs**. The Companion applies the restraint renderer; the Theater applies the dense renderer with Action Routing materialized as routed tasks. This is the architectural expression of "guest sees the what, staff sees the why, operator sees the failure mode."

### High-Level Data Flow — Route B (Operator Portal / Simulation)

```
[Operator selects cohort + calendar window]
                │
                ▼
   ┌────────────────────┐
   │ Synthetic Guest    │  ◀── generates N plausible profiles
   │     Generator      │       per cohort spec (no stereotyping)
   └─────────┬──────────┘
             ▼
   ┌────────────────────┐
   │ Stress Test Runner │  ◀── fans each synthetic guest through
   │                    │       the full Route A pipeline at each
   │                    │       calendar tick
   └─────────┬──────────┘
             ▼
   ┌────────────────────┐
   │ Failure-Mode       │  ◀── flags unmet needs: missing inventory,
   │  Aggregator        │       no available staff, cultural gaps,
   │                    │       capacity collisions
   └─────────┬──────────┘
             ▼
   ┌────────────────────┐
   │ Gap Report         │  ◀── ranked, actionable, with pre-launch
   │                    │       fix recommendations
   └────────────────────┘
```

The Route B pipeline **reuses Route A's agent stack** — same Cultural Reasoning, same Property Experience Hub. The novelty is the Synthetic Guest Generator, the calendar-fast-forwarding Stress Test Runner, and the Failure-Mode Aggregator. This means improvements to live agents automatically improve simulation quality, and gaps closed via simulation immediately benefit live guests.

---

## 2. Agent Responsibilities

The system runs eight logically distinct agents. Some are stateless query handlers (Cultural Reasoning, Composition); some are stateful and persist across the lifecycle (Profile Hub, Property Experience Hub); some are dedicated to specific lifecycle moments (Memory Agent at post-stay; Conversation Agent throughout). In the hackathon build, agents are implemented as separate prompts called by a thin orchestrator; in production, they become services.

### Conversation Agent

**Input:** Live guest message (text or transcribed voice), thread history, guest's current openness state (proactive permitted? consent given?)
**Output:** A turn — either a reply, a question, a clarifying confirmation, or silence

This agent owns the guest-facing thread. It decides *when* to speak (only at decision moments or when the guest writes first), *what tone* to use (the cultural register passed from upstream), and *what to ask the guest to confirm* before downstream agents commit actions. It is the only agent the guest directly perceives.

```typescript
interface ConversationOutput {
  turn_type: "reply" | "question" | "confirmation_request" | "silence";
  body: string;                  // The actual message (or empty for silence)
  consent_required: boolean;     // True if this turn must be approved before action
  expected_response_shape: string;  // For UI affordance: "yes/no", "free text", etc.
}
```

### Intake Agent

**Input:** Raw guest utterance + current Profile Hub state
**Output:** Structured intents and extracted entities

Replaces the form-based three-input ritual. Parses "We arrive Friday evening for our 25th anniversary" into `{ arrival: "Friday evening", occasion: "anniversary", milestone: "25th", party_size: 2+ }` and notes which canonical profile fields are still unknown so the Conversation Agent can ask gracefully.

```typescript
interface IntakeOutput {
  parsed_intents: Intent[];
  extracted_entities: Record<string, unknown>;
  profile_gaps: string[];        // Fields still needed: ["birth_date", "origin"]
  routing_hint: AgentRoute[];    // Which downstream agents to wake
}
```

### Profile Hub Agent

**Input:** Extracted entities from Intake + prior thread state
**Output:** Updated guest profile (including family branches), with explicit consent state per field

Stateful. Maintains one profile per guest plus linked sibling profiles for family members the guest has named. Every field carries provenance (extracted from which exchange) and a consent state (`given` / `inferred` / `declined`). Nothing is shared across properties without explicit `cross_property_share = true`.

```typescript
interface ProfileHubOutput {
  guest_id: string;
  cultural_lens: string;          // Derived: "East Asian contemplative"
  current_phase: string;          // Derived: "Water"
  family: FamilyMember[];         // Linked sibling profiles
  history: PriorStay[];           // Cross-property if consented
  consent_state: Record<string, ConsentLevel>;
}
```

### Property Experience Hub Agent

**Input:** Property ID + current time + weather + season + calendar
**Output:** Structured situation report — what's available, what's seasonally appropriate, what gaps exist for this guest's lens

Stateful. Knows the property's sense-of-place essence, current operational state (availability, staff on shift, inventory), seasonal context (fog patterns, garden state, local events), and — critically — *known gaps* (e.g., "no prayer space designated," "pu-erh sourcing limited"). When asked to support a recommendation it can't fully fulfill, it flags the gap rather than silently failing.

```typescript
interface PropertyExperienceOutput {
  availability: ServiceState[];
  seasonal_context: string;        // "late spring, foggy mornings typical"
  cultural_resources: Resource[];  // "aged pu-erh in stock"
  known_gaps: Gap[];               // Routes to operator portal for follow-up
}
```

### Cultural Reasoning Agent

**Input:** Profile Hub state + Property Experience output + Intake parse
**Output:** Culturally-reasoned recommendation with explicit reasoning chain

The core differentiator. Brings:
- Cultural fabric (language, ritual, family context, life-chapter awareness)
- Elemental/temperamental reasoning (BaZi-derived for East Asian, archetypal for Western, generalized for additional lenses)
- Phase-aware pacing (Water = stillness, Phoenix = emergence)
- Avoidance signals (what NOT to recommend)

```typescript
interface CulturalReasoningOutput {
  recommendation: string;
  cultural_reasoning: string;       // Theater-visible only
  alternative_if_context_shifts: string;
  emotional_arc_note: string;
  avoidance_applied: string[];
}
```

### Composition Agent

**Input:** Cultural Reasoning output + Property Experience constraints + Profile Hub consent state
**Output:** Final recommendation, balanced and gated

Responsible for:
- Resolving conflicts (cultural ideal vs. what's actually available)
- Applying the "Is This Welcome?" gate
- Choosing whether to act now, ask first, or stay silent
- Formatting the same decision for the Conversation Agent (Companion) and the Action Routing Agent (Theater)

### Action Routing Agent

**Input:** Composition output (approved/auto-actionable recommendations)
**Output:** Concrete tasks routed to specific staff teams, each with the context needed for graceful delivery

Turns a single recommendation ("pu-erh on terrace at 8:15") into a fan-out: In-Room Dining gets a setup task, Housekeeping gets the door-open instruction, Concierge gets a brief, Garden team gets a confirmation request. Each task carries just enough cultural context for the staff member to deliver in their own voice ("treat as restorative, not consoling"). In production, this is where Mews/OPERA/ALICE/Knowcross integrations land.

```typescript
interface ActionRoutingOutput {
  routed_tasks: RoutedTask[];
}

interface RoutedTask {
  staff_team: "concierge" | "restaurant" | "spa" | "housekeeping" |
              "valet" | "kitchen" | "garden" | "in_room_dining";
  task: string;
  cultural_context: string;        // "treat as restorative, not consoling"
  due_by: string;                  // ISO timestamp
  source_decision_id: string;      // Traceability back to composition
}
```

### Memory Agent

**Input:** All decision events accumulated during stay + guest cultural register
**Output:** In-thread Memory Artifact (2 paragraphs, the place's voice)

Runs at the post-stay boundary (~2 weeks after departure). Writes a single arc-of-meaning paragraph (plus a second in the guest's mother tongue when applicable). Delivered in the Companion thread, not as a separate email. The guest can curate it (keep, edit, decline).

```typescript
interface MemoryOutput {
  memory_artifact: string;       // ~150 words, single arc
  language: "en" | "zh" | "mixed" | "..."; // Matches guest register
  register: "contemplative" | "literary" | "seasonal" | "...";
}
```

---

## 3. Data Model

### Guest Profile (Static, Provided at Check-in)

```typescript
interface GuestProfile {
  id: string;
  name: string;
  origin: string;              // Hometown
  birth_date: string;          // ISO date
  languages: string[];
  stay_intent: string;         // One sentence from guest
  booking_window: string;      // "Saturday–Monday"

  // Derived by Cultural Reasoning Agent (not stored externally)
  cultural_lens: string;       // "East Asian contemplative" | "Western archetypal"
  register: string[];          // ["seasonal", "tea", "garden", "stillness"]
  current_phase: string;       // "Water" | "Phoenix" | etc.
  emotional_anchors: string[];
  avoid: string[];
}
```

### Decision Event (Per-Interaction, Session State)

```typescript
interface DecisionEvent {
  id: string;
  timestamp: string;
  guest_id: string;
  context: ContextOutput;
  generic_response: string;
  resonance_response: CulturalReasoningOutput;
  guest_action: "accepted" | "declined" | "ignored" | null;
}
```

### Property Knowledge Base (Static per Property)

```typescript
interface PropertyKnowledge {
  property_id: string;
  name: string;
  location: string;
  sense_of_place: string;      // 2-sentence essence
  available_services: Service[];
  local_knowledge: LocalItem[];
  seasonal_calendar: SeasonalEvent[];
  staff_directory: StaffMember[];
}
```

---

## 4. API Design

### Primary Endpoint

```
POST /api/recommend
```

**Request:**
```json
{
  "guest_id": "liu-lihua",
  "mode": "generic" | "resonance",
  "decision_moment": "saturday_morning",
  "context": {
    "time": "08:00",
    "weather": "foggy",
    "temperature_f": 55
  }
}
```

**Response (streamed):**
```json
{
  "recommendation": "...",
  "cultural_reasoning": "...",        // only in resonance mode
  "alternative_if_context_shifts": "...",
  "emotional_arc_note": "..."         // only in resonance mode
}
```

### Memory Synthesis Endpoint

```
POST /api/memory/synthesize
```

**Request:**
```json
{
  "guest_id": "liu-lihua",
  "events": [DecisionEvent, DecisionEvent, ...]
}
```

**Response:**
```json
{
  "memory_artifact": "Sand Hill remembers a Saturday that began in mist...",
  "language": "mixed"
}
```

---

## 5. Prompt Architecture

### Why Prompts Are the Critical Infrastructure

The difference between "this looks like any AI concierge" and "this is clearly a different class of understanding" lives entirely in prompt quality. The side-by-side demo only works if Generic output is forgettable and Resonance output is striking.

### Generic AI Prompt (Intentionally Bland)

```
You are a helpful concierge AI for a luxury hotel. The guest is asking
for a recommendation. Be friendly, informative, and concise.

Output JSON:
{
  "recommendation": "<one specific suggestion, 2-3 sentences>",
  "alternatives": ["<alt 1>", "<alt 2>"]
}

Do not mention cultural background or psychological framing. Just recommend.
```

### Cultural Resonance Prompt (Per-Guest, Richly Specified)

Key structural elements:
1. **Full guest profile** injected (cultural lens, phase, anchors, avoidances)
2. **Specific output schema** (recommendation + reasoning + alternative + arc note)
3. **Critical constraints** (no Western defaults, no generic luxury language, specific > generic)
4. **Cultural register instructions** (seasonal metaphors for Liu, art-historical for Sarah)

See [Plan D §7.2-7.3] for full prompt text.

### Prompt Versioning Strategy

```
/lib/prompts/
├── generic.ts           # Stable, rarely changes
├── resonance-base.ts    # Shared structure
├── resonance-liu.ts     # Mrs. Liu cultural profile
├── resonance-sarah.ts   # Sarah cultural profile
├── memory-synthesizer.ts # Memory Artifact generation
└── reasoning-panel.ts   # Staff-visible reasoning format
```

---

## 6. Implementation Stack

### Hackathon Build (5 hours)

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind | Fast, familiar, SSR for demo stability |
| Styling | Tailwind + Google Fonts (Cormorant Garamond) | Rosewood-aligned with minimal setup |
| Animation | Framer Motion (subtle fade only) | One dependency, large impact |
| Backend | Next.js API Routes | Co-located, no separate server |
| LLM | Anthropic Claude Sonnet 4.6 | Sponsor stack, high quality |
| SDK | @anthropic-ai/sdk | Official, streaming support |
| State | React useState + localStorage backup | No DB needed for demo |
| Deploy | localhost (with Vercel as backup) | Demo stability > deployment polish |

### Production Architecture (Post-Hackathon)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Guest Apps  │────▶│ API Gateway  │────▶│ Agent Orchestr. │
│ (iPad/WX)   │     │ (Auth/Rate)  │     │ (Runtime sep.)  │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                    ┌──────────────────────────────┼──────┐
                    │              │               │      │
              ┌─────▼─────┐ ┌─────▼─────┐ ┌──────▼────┐ │
              │  Context  │ │  Cultural │ │  Memory   │ │
              │  Service  │ │  Engine   │ │  Service  │ │
              └─────┬─────┘ └─────┬─────┘ └─────┬────┘ │
                    │             │              │      │
              ┌─────▼─────────────▼──────────────▼────┐│
              │         Claude API (Sonnet 4.6)        ││
              └───────────────────────────────────────┘│
                                                       │
              ┌───────────────────────────────────────┐│
              │  Property Knowledge DB (per-property) ││
              └───────────────────────────────────────┘│
              ┌───────────────────────────────────────┐│
              │  Guest Profile Store (encrypted)      ││
              └───────────────────────────────────────┘│
              └────────────────────────────────────────┘
```

---

## 7. Build Timeline — Route A, 4 Scenarios (≈8-Hour Build)

A realistic estimate for the 4-scenario Route A demo. The classic 5-hour hackathon constraint compresses this to 2 scenarios (Liu pre-arrival + weather pivot only) — see §9 Scope Reduction Protocol.

### Hour 1: Foundation (0:00–1:00)

```
0:00–0:15  Project setup (Next.js 16 app already scaffolded,
           dependencies, .env with ANTHROPIC_API_KEY)
0:15–0:40  Agent prompts as TypeScript modules (8 agents,
           one file each under /lib/prompts)
0:40–1:00  Manual prompt testing in Claude console for each
           agent — verify each produces the expected schema
```

**Gate:** All 8 agent prompts produce parseable structured output before proceeding.

### Hour 2: Companion + Theater Scaffolding (1:00–2:00)

```
1:00–1:20  Layout shell — split-screen at 50/50, left:
           Companion conversation pane + profile glimpse,
           right: 6 stacked agent panels (Intake, Profile,
           Cultural, Property, Composition, Actions)
1:20–1:45  Companion conversation renderer (message bubbles,
           consent affordances, voice/text toggle ghosted)
1:45–2:00  Theater panel components (one reusable Panel with
           header, body, animate-in transition)
```

### Hour 3: Scenario 1 Wired End-to-End (2:00–3:00)

```
2:00–2:30  API route /api/companion/turn — accepts a guest
           message + thread state, returns Conversation Agent
           output + populated agent panel data
2:30–3:00  Liu Scenario 1 fully wired — 3 conversation turns
           extract DOB/origin/intent, theater panels populate
           in sequence, Action Routing renders 4 routed tasks
```

**Demo-critical gate:** Scenario 1 must run end-to-end before moving on. If not, cut scope per §9.

### Hour 4: Scenario 2 — Real-Time Pivot (3:00–4:00)

```
3:00–3:30  Time-scrub + weather toggle controls (left rail
           or top bar); re-triggers /api/companion/turn with
           updated context
3:30–4:00  Liu Scenario 2 wired — proactive Companion message,
           Theater re-reasons live, Action Routing produces
           new fan-out (cancel indoor, ping garden, hold tea)
```

### Hour 5: Scenario 3 — Persona Switch + Register Shift (4:00–5:00)

```
4:00–4:30  Persona switcher (Liu ↔ Sarah) resets thread, loads
           Sarah profile, theater re-populates with Western
           archetypal register
4:30–5:00  Sarah Scenario 3 wired — emotional pivot (couples
           wine pairing → solo seating), softened language,
           maître d' note in Action Routing
```

### Hour 6: Scenario 4 — Cross-Cultural Flash (5:00–6:00)

```
5:00–5:30  Add Patel persona (Mumbai, Jain, prayer-observant)
           + new cultural prompt module
5:30–6:00  Patel Scenario 4 wired — 30-second flash showing
           same pipeline producing kitchen alert, prayer-room
           reservation, asana-timed schedule
```

### Hour 7: Memory Artifact + Polish (6:00–7:00)

```
6:00–6:30  Memory Agent endpoint /api/memory/synthesize
           + in-thread Artifact reveal (full-width serif,
           subtle entrance animation)
6:30–7:00  Visual polish (fonts, palette, spacing, transitions,
           Theater panel reveal timing tuned for demo cadence)
```

### Hour 8: Safety Net + Rehearsal (7:00–8:00)

```
7:00–7:30  Pre-warm every agent call for every scenario;
           hardcode fallback responses keyed by (persona, turn)
7:30–7:50  Full rehearsal with narration script — practice
           the time-scrub timing, the persona switch beat,
           the Patel flash
7:50–8:00  Submit, stop coding
```

### Key Architectural Choices for the Build

1. **One pipeline run, two renderers** — every guest message triggers one composed pipeline run; both the Companion (left) and the Theater (right) render from the same response. Asymmetry lives in the renderer rules, not parallel calls.
2. **Sequential agent panel reveal in the Theater** — even though agents may run in parallel, the panels animate in sequence (Intake → Profile → Cultural → Property → Composition → Actions) to make the reasoning *legible* during the demo. Latency becomes dramatic structure.
3. **Pre-warmed scenario cache** — every conversation turn in every scenario has a fallback response. Network failure or LLM hiccup never breaks the demo.

---

## 8. Resilience & Demo Safety

### Fallback Strategy

```typescript
// Every successful API response gets cached
const fallbackResponses: Record<string, any> = {
  "liu-morning-resonance": { /* pre-warmed output */ },
  "liu-morning-generic": { /* pre-warmed output */ },
  "sarah-morning-resonance": { /* pre-warmed output */ },
  // ...
};

async function getRecommendation(params) {
  try {
    const response = await callClaude(params);
    // Cache successful response
    fallbackResponses[cacheKey(params)] = response;
    return response;
  } catch (error) {
    // Seamless fallback — audience never knows
    return fallbackResponses[cacheKey(params)];
  }
}
```

### Latency Mitigation

- **Streaming enabled:** Text appears word-by-word (latency becomes dramatic effect)
- **Presenter technique:** Press button BEFORE narrating the setup — by the time you finish explaining, output has arrived
- **Pre-warm on app load:** First full cycle runs on mount, populating cache

### Network Resilience

- Primary: Venue WiFi
- Backup: Phone hotspot (pre-configured)
- Nuclear: Full demo as pre-recorded MP4 + 5-page PDF screenshot deck on desktop

---

## 9. Scope Reduction Protocol

For the 4-scenario Route A demo, cut in this exact order if behind. The cut order prioritizes preserving the *system of action* argument over any specific scenario.

| Priority | Cut | Impact |
|---|---|---|
| 1 (first to go) | Scenario 4 (Patel cross-cultural flash) | Low — voiceover can assert generalization; ontology claim survives |
| 2 | Generic-vs-Resonance setup slide | Low — paradigm point can be asserted verbally |
| 3 | Scenario 2 weather slider (collapse to static Sat-AM only) | Medium — lose "real-time re-reasoning" beat |
| 4 | Scenario 3 (Sarah persona switch) | High — lose "same engine, different cultural fabric" proof |
| 5 (last resort) | Memory Artifact reveal | High — lose emotional close and relationship payoff |

**Never cut (minimum viable thesis):**
- Liu Scenario 1: Companion conversation + Theater all 6 panels populating + Action Routing fan-out to 4 staff teams
- Split-screen layout visible throughout — both Companion and Theater on screen simultaneously

These elements are the irreducible proof of the new thesis: **a conversational guest companion driving multi-agent cultural reasoning whose output materializes as routed actions for specific human staff.** Every other scenario adds breadth (real-time, cross-cultural, emotional) but Scenario 1 alone delivers the core architectural claim.

### Fallback Demo (≤5 Hours)

If the 8-hour build collapses to the original 5-hour constraint, ship only:
- Scenarios 1 + 2 (Liu pre-arrival + weather pivot)
- Memory Artifact
- Skip Sarah, Patel, and the Generic-vs-Resonance setup slide

This is still a complete thesis: one persona, two stay phases, full agent pipeline visible, in-thread Memory Artifact. Slides can carry the generalization claim verbally.

---

## 10. Security & Privacy Architecture

### Data Minimization (By Design)

- Guest provides 3 explicit data points only
- No behavioral tracking, no IoT inference, no social media scraping
- Cultural Reasoning Agent operates exclusively on consented inputs
- No persistent storage of LLM reasoning chains (session-only)

### Data Flow Transparency

```
Guest input (3 items)
    ↓
Cultural Profile (derived, session-scoped)
    ↓
LLM calls (no PII in system prompts beyond what guest provided)
    ↓
Recommendations (delivered, not stored long-term)
    ↓
Memory Artifact (stored with guest consent, deletable on request)
```

### Production Considerations (Post-Hackathon)

- Guest Profile Store: encrypted at rest, per-property isolation
- Cross-property sharing: only with explicit guest consent ("Would you like Rosewood Hong Kong to know you?")
- Right to deletion: one-click removes all Cultural Profile data
- No model fine-tuning on individual guest data

---

## 11. Scaling Considerations

### Adding New Cultural Lenses

To add a new cultural register (e.g., Middle East affluent):

1. Write a new Cultural Reasoning prompt with appropriate anchors, register, phase language
2. Define avoidance signals specific to that culture
3. Test: same decision moment should produce visibly different output from existing lenses
4. Train staff on the reasoning panel vocabulary for that lens

**Estimated effort:** 2-3 days per new cultural lens (research + prompt engineering + testing)

### Adding New Properties

To add a new Rosewood property:

1. Build Property Knowledge Base (services, local knowledge, seasonal calendar)
2. Map property's Sense of Place DNA (using the 6-layer framework from research)
3. Adjust Context Agent to read property-specific signals
4. Test: recommendations should feel rooted in THAT place, not generic luxury

**Key test:** "Could this recommendation have come from any Rosewood?" If yes, the property layer is too thin.

---

## 12. Technical Decisions Log

| Decision | Choice | Rationale | Revisit When |
|---|---|---|---|
| 4 agents as prompts, not runtime services | Prompt-decomposed | 5h constraint; pilot v2 separates | Pilot scoping |
| No database | React state + localStorage | Demo doesn't need persistence | Pilot build |
| Claude Sonnet 4.6 for all agents | Single model | Sponsor stack, consistent quality | Cost optimization needed |
| Streaming responses | Yes | Turns latency into UX feature | Never (keep this) |
| Hardcoded guest profiles | Yes | Demo scope | Pilot adds dynamic intake |
| No auth | Yes | Demo, single user | Any multi-user scenario |
| Next.js App Router | Yes | Familiar, fast setup | If team grows to prefer different stack |

---

## 13. Operator Portal Architecture (Route B)

The Operator Portal is a separate route within the same web app (`/simulate`), targeting property leadership and operations leads rather than service staff. Not demoed live in the hackathon; named in the close as the platform expansion.

### Conceptual Model

The Portal runs the same agent stack as Route A — same Cultural Reasoning, same Property Experience Hub, same Composition logic — against **synthetic guests** moving through a **fast-forwarded calendar**. The novelty is three components that wrap the existing agent pipeline:

1. **Synthetic Guest Generator** — produces N plausible profiles per cohort spec (e.g., "APAC affluent anniversary couple, multi-generational, Mandarin-preferred") drawn from the same Cultural Reasoning ontology, never from stereotypes
2. **Stress Test Runner** — fans each synthetic guest through the full Route A pipeline at each calendar tick (or each demand-relevant moment), recording what would be recommended and what would be requested
3. **Failure-Mode Aggregator** — flags unmet needs (missing inventory, no available staff, cultural gaps, capacity collisions) and ranks them by frequency × cohort importance

### Why This Is Defensible

This is the moat made tactile for a B2B buyer. Three reasons it's hard to copy:

- **Ontology-anchored synthetic guests.** Anyone can generate fake profiles. Generating profiles that produce *culturally plausible* requests requires the reasoning ontology — the same asset that's the live moat.
- **Shared agent stack with live.** Improvements to the live system automatically improve simulation quality; gaps surfaced by simulation automatically inform the live Property Experience Hub. Competitors building a one-off "launch QA tool" cannot match this compounding.
- **Procurement-friendly entry vector.** A new-property GM can buy the Portal *before* committing to live deployment. Pilot risk drops; the Portal sells the live system by demonstrating its reasoning before any guest interaction exists.

### Data Model Additions

```typescript
interface SyntheticGuestCohort {
  cohort_id: string;
  label: string;                  // "APAC affluent anniversary couple"
  lens: string;                   // Drawn from Cultural Reasoning ontology
  party_shape: PartyShape;        // Solo, couple, multi-gen, etc.
  generation_count: number;       // How many synthetic guests to sample
  observation_window: CalendarWindow;
}

interface SimulationRun {
  run_id: string;
  property_id: string;
  cohorts: SyntheticGuestCohort[];
  calendar_window: CalendarWindow;
  projected_requests: ProjectedRequest[];
  flagged_gaps: Gap[];
  ran_at: string;
}

interface Gap {
  description: string;            // "No prayer space designated"
  triggered_by: CohortReference[];
  frequency_per_week: number;
  severity: "blocking" | "degrading" | "minor";
  pre_launch_fix: string;         // "Designate Room A12 as quiet room with prayer mat option"
}
```

### Build Sequence (Post-Hackathon)

1. **Phase A:** Implement Synthetic Guest Generator using the existing Cultural Reasoning prompts (1-2 weeks)
2. **Phase B:** Build the Stress Test Runner — orchestrates Route A pipeline runs on a fast-forwarded calendar (2-3 weeks)
3. **Phase C:** Failure-Mode Aggregator + gap-ranking + report rendering (2 weeks)
4. **Phase D:** Pilot the Portal with one pre-launch Rosewood property (Mendocino is a hypothetical candidate)

**Sequencing rationale:** The Portal cannot ship before the live system is stable, but it can ship alongside the *first* paid pilot — and may actually be the easier procurement door because it carries less operational risk than a live deployment.
