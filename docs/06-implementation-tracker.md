# 06 — Implementation Tracker

**Status:** v0.1 (2026-05-16)
**Owner:** Zephyr (solo) — collaborators add their initials when claiming a task
**Scope:** Route A demo for the Rosewood Sand Hill Hackathon. Route B (Operator Portal) is *not* built; mentioned only in the close.

This is the systematic build plan. Update task status inline as work happens. The four design docs ([00](00-overview.md)–[03](03-technical-architecture.md)) are the *intent*; this doc is the *execution*.

---

## At-a-glance — parallel tracks

```
┌──────────────────┐
│ Phase 0          │  ~45 min, strictly sequential
│ Foundation       │  installs SDKs, wires design tokens, fixes Next 16 quirks
└────────┬─────────┘
         │
         ├──────────────────────────┬──────────────────────────────────────┐
         ▼                          ▼                                      ▼
┌──────────────────┐    ┌──────────────────┐                ┌───────────────────────┐
│ Phase 1A         │    │ Phase 1B         │                │ Side-track V (voice)  │
│ Agent Layer      │    │ UI Shell         │                │ Optional, can start   │
│ ~4 hours         │    │ ~4 hours         │                │ after 1B.4. ~1.5 hrs. │
│                  │    │                  │                │                       │
│ Built + smoke-   │    │ Built against    │                │ ElevenLabs TTS +      │
│ tested via curl  │    │ MOCKED agent     │                │ Web Speech API STT.   │
│ — no UI needed.  │    │ JSON. No API     │                │ Cut first if behind.  │
│                  │    │ needed.          │                │                       │
└────────┬─────────┘    └────────┬─────────┘                └───────────┬───────────┘
         │                       │                                      │
         └──────────┬────────────┘                                      │
                    ▼                                                   │
         ┌──────────────────┐                                           │
         │ Phase 2          │  ~2 hours, sequential                     │
         │ Integration      │  Wire real API into real UI; scenario-    │
         │                  │  by-scenario. Replace mocked JSON.        │
         └────────┬─────────┘                                           │
                  │                                                     │
                  ▼                                                     │
         ┌──────────────────┐                                           │
         │ Phase 3          │  ~1.5 hours, sequential                   │
         │ Polish & Safety  │◀──────────────────────────────────────────┘
         │                  │  Pre-warm cache, fallback wiring,
         │                  │  visual polish, rehearsal, optional voice.
         └──────────────────┘
```

**Total realistic solo time:** ~9.5 hours end-to-end if disciplined; ~7 hours with the 5-hour fallback scope (Liu's two scenarios only — see [03-technical-architecture.md §9](03-technical-architecture.md)).

**The parallelism is real even for one person.** Phase 1A is mostly prompt design + schema work (thinking-heavy). Phase 1B is component scaffolding (doing-heavy). Alternating between them across a day reduces fatigue *and* lets each track checkpoint independently.

---

## Status legend

- ☐ pending
- ◐ in progress (only one at a time per person)
- ☑ done
- ⊘ blocked / on hold (note reason in the row)
- ✂ cut (per [03 §9](03-technical-architecture.md) scope-reduction)

---

## Phase 0 — Foundation (sequential, ~45 min)

Blocks everything else. Do not start Phase 1 until all of Phase 0 is ☑.

| ID | Task | Status | Artifacts | Acceptance |
|----|------|--------|-----------|------------|
| 0.1 | Install Anthropic SDK | ☐ | `web-app/package.json`, `pnpm-lock.yaml` | `pnpm list @anthropic-ai/sdk` returns a version ≥ 0.30 |
| 0.2 | Install ElevenLabs SDK (deferred — only if voice in scope) | ☐ | `web-app/package.json` | `pnpm list @elevenlabs/elevenlabs-js` returns a version. Skip if cutting voice. |
| 0.3 | Wire design tokens into globals.css | ☐ | `web-app/src/app/globals.css` (replaced with [`design-pattern/tokens.css`](../design-pattern/tokens.css)) | Open http://localhost:3000, inspect `<body>` — `--color-surface-canvas` etc. resolve in DevTools |
| 0.4 | Load Cormorant Garamond via `next/font/google` | ☐ | `web-app/src/app/layout.tsx` | Page renders in Cormorant Garamond, not Arial. No FOUT. |
| 0.5 | Read Next 16 App Router + route-handler docs locally | ☐ | None (reading only) | Cite specific paths in `node_modules/next/dist/docs/` checked. Note any breaking-change gotchas in a comment at the top of `route.ts` when it's created. **Required by [`web-app/AGENTS.md`](../web-app/AGENTS.md).** |
| 0.6 | Verify `pnpm dev` still works after token + font wiring | ☐ | None | Dev server starts; page loads; no compile errors; tokens visible |

**Gate to Phase 1:** all six rows ☑.

---

## Phase 1A — Agent Layer (parallel with 1B, ~4 hours)

Backend only. No UI dependency. Each agent gets one TypeScript module with: `systemPrompt`, `outputSchema` (TypeScript interface + Zod/Valibot validator if helpful), `call(input): Promise<output>`. Smoke-test each via a CLI script or curl before integration.

| ID | Task | Status | Artifacts | Acceptance |
|----|------|--------|-----------|------------|
| 1A.1 | Persona fixtures: Liu, Sarah, Patel | ☐ | `web-app/src/lib/fixtures/personas/liu.ts`, `sarah.ts`, `patel.ts` | Each exports `GuestProfile` matching schema in [03 §3](03-technical-architecture.md). Includes name, origin, birth_date, languages, stay_intent, family branches. |
| 1A.2 | Property fixture: Sand Hill | ☐ | `web-app/src/lib/fixtures/properties/sand-hill.ts` | Exports `PropertyKnowledge` per [03 §3](03-technical-architecture.md). Includes seasonal calendar, services (Madera, garden, in-room dining), local knowledge, staff teams. |
| 1A.3 | Agent: Conversation | ☐ | `web-app/src/lib/agents/conversation.ts` | Given a guest message + thread history, returns `{ turn_type, body, consent_required, expected_response_shape }`. Smoke test: 3 sample messages produce parseable JSON. |
| 1A.4 | Agent: Intake | ☐ | `web-app/src/lib/agents/intake.ts` | Returns `{ parsed_intents, extracted_entities, profile_gaps, routing_hint }`. Smoke test: "We arrive Friday for our 25th anniversary" extracts arrival, occasion, milestone. |
| 1A.5 | Agent: Profile Hub | ☐ | `web-app/src/lib/agents/profile-hub.ts` | Stateful: accepts current state + extracted entities, returns updated `ProfileHubOutput`. Smoke test: birth date + origin produce `cultural_lens: "East Asian contemplative"` for Liu. |
| 1A.6 | Agent: Property Experience Hub | ☐ | `web-app/src/lib/agents/property-hub.ts` | Given property + time + weather, returns availability + seasonal context + known gaps. Smoke test: Sat 8am foggy returns "garden quiet 7–9am". |
| 1A.7 | Agent: Cultural Reasoning | ☐ | `web-app/src/lib/agents/cultural-reasoning.ts` | Returns `CulturalReasoningOutput` with recommendation + reasoning + alternative + arc note + avoidances. Smoke test: Liu Sat 8am produces a pu-erh-on-terrace style recommendation with "return, not discover" framing. |
| 1A.8 | Agent: Composition | ☐ | `web-app/src/lib/agents/composition.ts` | Balances cultural ideal with availability constraints; applies "Is This Welcome?" gate. Smoke test: when Madera closed, downgrades suggestion gracefully. |
| 1A.9 | Agent: Action Routing | ☐ | `web-app/src/lib/agents/action-routing.ts` | Returns `RoutedTask[]` with `staff_team`, `task`, `cultural_context`, `due_by`. Smoke test: pu-erh recommendation fans out to In-Room Dining + Housekeeping + Concierge + Garden teams. |
| 1A.10 | Agent: Memory | ☐ | `web-app/src/lib/agents/memory.ts` | Returns `MemoryOutput` — 2-paragraph in-thread artifact in correct language/register. Smoke test: Liu's accumulated events produce a contemplative bilingual artifact ~150 words. |
| 1A.11 | Orchestrator (sequential, with sequence labels for theater reveal) | ☐ | `web-app/src/lib/orchestrator.ts` | Accepts a guest message + thread state, invokes agents in order (Conversation → Intake → Profile → Property → Cultural → Composition → Actions), returns full pipeline output with `sequence_label` per agent for UI animation ordering. |
| 1A.12 | API route: `/api/companion/turn` | ☐ | `web-app/src/app/api/companion/turn/route.ts` | POST endpoint accepts `{ guest_id, message, thread_state, context }`, returns full pipeline output. **Reference Next 16 route-handler docs before writing** (per 0.5). Curl-testable independently of UI. |
| 1A.13 | Fallback cache (pre-warmed responses) | ☐ | `web-app/src/lib/fixtures/fallbacks/` (one JSON per scenario × turn) | Orchestrator catches LLM errors, returns matching fallback JSON keyed by (persona, turn_index). Smoke test: kill the API key, page still renders correct response. |
| 1A.14 | Memory synthesis endpoint | ☐ | `web-app/src/app/api/memory/synthesize/route.ts` | POST accepts accumulated events, returns 2-paragraph artifact via Memory Agent. |

**Smoke test protocol:** for each agent, write a one-off script (`web-app/scripts/smoke-<agent>.ts` or inline curl) that calls it with a known input and prints JSON. Verify schema match by eye before integration. Do *not* mark ☑ until the smoke test passes.

---

## Phase 1B — UI Shell (parallel with 1A, ~4 hours)

Frontend only. Build against **hand-written mock JSON** that matches the agent schemas — UI does not need a live API to be 100% complete.

| ID | Task | Status | Artifacts | Acceptance |
|----|------|--------|-----------|------------|
| 1B.1 | Route A page shell — split-screen layout | ☐ | `web-app/src/app/page.tsx` | 50/50 split, full viewport height. Left half has `data-density="guest"`, right half has `data-density="staff"`. Empty placeholders visible in both halves. Uses semantic Tailwind utilities from design tokens (`bg-surface-canvas`, `text-content-primary`, `border-line-hairline`). |
| 1B.2 | `<CompanionThread />` — message list | ☐ | `web-app/src/components/companion/CompanionThread.tsx` | Renders message bubbles in conversation order. Guest messages right-aligned, Companion messages left-aligned. Cormorant body type. Reads from a prop `messages: Message[]` (use mocked data). |
| 1B.3 | `<ConsentAffordance />` — Yes/Adjust/No buttons | ☐ | `web-app/src/components/companion/ConsentAffordance.tsx` | Rendered inline within a Companion message when `consent_required: true`. Hairline-bordered buttons, no rounded corners. Click → fires callback with chosen action. |
| 1B.4 | `<CompanionInput />` — text input + voice toggle | ☐ | `web-app/src/components/companion/CompanionInput.tsx` | Text input full-width, submit on Enter. Voice toggle button ghosted (active iff Side-track V completes). |
| 1B.5 | `<TheaterPanel />` — generic agent panel | ☐ | `web-app/src/components/theater/TheaterPanel.tsx` | Reusable panel with `title` (uppercase tracked label, `text-micro tracking-wide`), `children` body. Fade-in transition (`motion-duration-base`, `motion-ease-quiet`). |
| 1B.6 | Six concrete Theater panel components | ☐ | `web-app/src/components/theater/{Intake,ProfileHub,Cultural,Property,Composition,ActionRouting}.tsx` | Each accepts agent output as prop and renders it. Action Routing fans out staff-team tasks with their cultural-context notes. |
| 1B.7 | `<TheaterStack />` — orchestrates panel reveal sequence | ☐ | `web-app/src/components/theater/TheaterStack.tsx` | Accepts an array of populated panels + their `sequence_label`. Reveals panels in sequence with `motion-duration-settle` between each. |
| 1B.8 | `<ProfileGlimpse />` — left rail summary | ☐ | `web-app/src/components/companion/ProfileGlimpse.tsx` | Shows current guest's name, occasion, family branches, pace tag. Reads from mocked profile state. |
| 1B.9 | Time-scrub + weather toggle controls | ☐ | `web-app/src/components/controls/ContextControls.tsx` | Slider (time) + toggle (weather: fog/clear). On change, fires a callback with new context. Mock the API response for now. |
| 1B.10 | Persona switcher | ☐ | `web-app/src/components/controls/PersonaSwitcher.tsx` | Liu / Sarah / Patel buttons. On switch, resets thread to that persona's state (mocked). |
| 1B.11 | `<MemoryArtifact />` — full-width reveal | ☐ | `web-app/src/components/companion/MemoryArtifact.tsx` | When triggered, renders full-width over the conversation pane. Display type (`type-display-xl`), generous spacing. Uses `motion-duration-arrive` (600ms). |

**Mock-data strategy:** stash example outputs (matching each agent schema) in `web-app/src/lib/mocks/scenario-1-liu.ts` etc. Component stories can import from there. Replaced wholesale in Phase 2 — no UI rewrite needed because everything reads from props.

---

## Side-track V — Voice (optional, ~1.5 hours, can start after 1B.4)

Cut first if behind. None of the demo's thesis depends on voice.

| ID | Task | Status | Artifacts | Acceptance |
|----|------|--------|-----------|------------|
| V.1 | ElevenLabs TTS for Companion replies | ☐ | `web-app/src/lib/voice/tts.ts`, used in `CompanionThread` | Each Companion message has a play button; clicking streams ElevenLabs audio. |
| V.2 | Web Speech API STT for user voice input | ☐ | `web-app/src/lib/voice/stt.ts`, used in `CompanionInput` | Mic button: hold-to-talk; transcript appears in input field; submit on release. |
| V.3 | Voice/text toggle in `CompanionInput` | ☐ | `web-app/src/components/companion/CompanionInput.tsx` | Toggle between text input and mic button. Default: text. |

---

## Phase 2 — Integration (sequential after 1A + 1B, ~2 hours)

Replace mocked agent data in the UI with real API calls. Wire scenario by scenario.

| ID | Task | Status | Artifacts | Acceptance |
|----|------|--------|-----------|------------|
| 2.1 | Wire `CompanionThread` submit → `/api/companion/turn` → state | ☐ | `web-app/src/app/page.tsx`, plus a state hook (e.g. `useCompanion.ts`) | Submitting a message hits the live API; response populates Theater panels and appends Companion reply. Pre-cached fallback kicks in on error. |
| 2.2 | Scenario 1 — Liu pre-arrival anniversary planning (end-to-end) | ☐ | All Liu Scenario 1 paths wired | 3 conversation turns extract DOB/origin/intent; Theater fills correctly; Action Routing renders 4 routed tasks; consent affordance accepts → tasks marked LIVE. **Demo-critical: must work before moving on.** |
| 2.3 | Scenario 2 — Liu mid-stay weather pivot | ☐ | Wired against `ContextControls` | Toggling weather/time triggers a fresh pipeline run; Companion writes a proactive message; Theater re-reasons; Action Routing produces a new fan-out. |
| 2.4 | Scenario 3 — Sarah persona switch + emotional pivot | ☐ | Wired via `PersonaSwitcher` | Switching persona resets thread; loading Sarah profile re-skins Cultural panel to Western archetypal / Phoenix; emotional pivot ("cancel couples pairing") produces softened recommendation + maître d' note. |
| 2.5 | Scenario 4 — Patel cross-cultural flash | ☐ | New persona module + Cultural prompt extension | 30-second flash: same pipeline, different actions (kitchen alert, prayer room, asana-aware schedule). Can be canned if behind. |
| 2.6 | Memory Artifact in-thread reveal | ☐ | Wired via `MemoryArtifact` + `/api/memory/synthesize` | At end of scenario, "reveal Memory Artifact" trigger fetches synthesized artifact and animates in over conversation. |

---

## Phase 3 — Polish & Safety (sequential after Phase 2, ~1.5 hours)

| ID | Task | Status | Artifacts | Acceptance |
|----|------|--------|-----------|------------|
| 3.1 | Pre-warm fallback cache for every scenario × turn | ☐ | `web-app/src/lib/fixtures/fallbacks/*.json` populated from live runs | Disconnect WiFi, run through all 4 scenarios — every beat still renders correctly. |
| 3.2 | Tune Theater panel reveal animation timing for demo cadence | ☐ | `TheaterStack.tsx` reveal timing constants | Walk through Scenario 1 with a stopwatch — reveal sequence reads as deliberate, not laggy. Aim ~250–400ms between panels. |
| 3.3 | Visual polish pass — spacing, typography, transitions | ☐ | Various component files | Open all 4 scenarios; nothing crowded, nothing rounded, no chrome (per [`design-pattern/README.md`](../design-pattern/README.md) §3). |
| 3.4 | Rehearsal with narration script | ☐ | `web-app/REHEARSAL.md` (optional one-pager with cues) | Full 5-min runthrough at least 3 times. Time each scenario; verify under-5-min budget. |
| 3.5 | Build & deploy verification | ☐ | Vercel deployment (or `pnpm build && pnpm start` locally) | Production build runs without errors. If deploying: Vercel preview URL works end-to-end. |

---

## Dependency map (explicit)

```
0.1, 0.2 → independent installs
0.3 → 0.4 (font loads after token globals are in place)
0.4 → 0.6 (verify after both)
0.5 → blocks 1A.12 (route handler) — read docs first

1A.1, 1A.2 → fixture-only, can be done first within Track A
1A.3–1A.10 → each agent independent of others; build any order
1A.11 → requires 1A.3 through 1A.10
1A.12 → requires 1A.11 and 0.5
1A.13 → requires 1A.12
1A.14 → requires 1A.10

1B.1 → blocks all other 1B tasks (layout shell first)
1B.2, 1B.3, 1B.4 → can be done in any order after 1B.1
1B.5 → blocks 1B.6, 1B.7
1B.8, 1B.9, 1B.10 → after 1B.1
1B.11 → after 1B.1

V.1, V.2, V.3 → require 1B.4

Phase 2:
2.1 → requires 1A.12 + 1B.1, 1B.2, 1B.7
2.2 → requires 2.1 + all 1A
2.3 → requires 2.2 + 1B.9
2.4 → requires 2.2 + 1B.10 + Sarah fixture
2.5 → requires 2.4 (or can be skipped)
2.6 → requires 1A.14 + 1B.11

Phase 3:
3.1 → requires all of Phase 2
3.2 → requires 2.2
3.3 → requires all of Phase 2
3.4 → requires 3.1, 3.3
3.5 → requires 3.4
```

---

## Cut order if behind

Reference [03-technical-architecture.md §9](03-technical-architecture.md). Cuts in order:

1. **Side-track V (voice)** — ✂ first. Demo works text-only.
2. **Patel scenario (2.5)** — ✂ second. Voiceover asserts generalization.
3. **Generic-vs-Resonance setup slide** — ✂ third. Already not in the build plan; only mention if you'd planned a static slide.
4. **Weather/time controls (1B.9, 2.3)** — ✂ fourth. Collapse Scenario 2 to a static Sat-AM only.
5. **Sarah scenario (2.4)** — ✂ fifth. Loses the "same engine, different cultural fabric" proof; voiceover can carry it.
6. **Memory Artifact (1B.11, 1A.14, 2.6)** — ✂ last resort. Loses the emotional close.

**Never cut:**
- 1B.1 (split-screen shell)
- 1A.3–1A.11 + 1A.12 (full agent pipeline + API route)
- 1B.2, 1B.5, 1B.6 (Companion thread + Theater panels)
- Scenario 2.1 + 2.2 (one persona, one conversation, full Theater fan-out)

These elements together = the irreducible thesis.

---

## How to update this doc

1. Mark a task ◐ when you start it; mark ☑ the moment it passes its Acceptance criteria. Do not batch updates.
2. If a task is blocked, add a brief note in the same row (e.g. `⊘ — waiting on 0.5`).
3. If you cut a task, change status to ✂ and add a one-line reason.
4. New tasks discovered during build go at the bottom of the relevant phase with a `.X` suffix (e.g. `1A.15`).
5. Status changes do not need a commit message all on their own; bundle them into the related code commit.
6. When all of Phase 2 is ☑, update [00-overview.md](00-overview.md) one-liner if the shipped scope differs from the doc.

---

## Quick links

- **Product intent:** [00-overview.md](00-overview.md)
- **Product strategy:** [01-product-strategy.md](01-product-strategy.md)
- **Experience design + 5-min demo flow:** [02-experience-design.md](02-experience-design.md)
- **Architecture + 8 agents + build plan:** [03-technical-architecture.md](03-technical-architecture.md)
- **Pitch sharpening + Q&A:** [04-pitch-sharpening.md](04-pitch-sharpening.md)
- **Dev setup + env vars:** [05-development-setup.md](05-development-setup.md)
- **Design tokens + principles:** [`design-pattern/README.md`](../design-pattern/README.md)
- **Next 16 docs (read before route-handler work):** `web-app/node_modules/next/dist/docs/`
