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
| 0.1 | Install Anthropic SDK | ☑ | `web-app/package.json`, `pnpm-lock.yaml` | @anthropic-ai/sdk 0.96.0 installed |
| 0.2 | Install ElevenLabs SDK (deferred — only if voice in scope) | ✂ | — | Cut per cut-order §1; voice cut first |
| 0.3 | Wire design tokens into globals.css | ☑ | `web-app/src/app/globals.css` | Sourced from `design-pattern/tokens.css`; density attr supported |
| 0.4 | Load Cormorant Garamond via `next/font/google` | ☑ | `web-app/src/app/layout.tsx` | Cormorant variable injected as `--font-cormorant`; weights 300–600 |
| 0.5 | Read Next 16 App Router + route-handler docs locally | ☑ | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` | Notes for route.ts: `Response.json()`, `await request.json()`, `params` is a Promise in v15+, `runtime = 'nodejs'` for SDK calls |
| 0.6 | Verify `pnpm dev` still works after token + font wiring | ☑ | — | Turbopack ready in 418ms; `curl http://localhost:3000` returns 200 with cormorant_garamond variable class on `<html>` |

**Gate to Phase 1:** all six rows ☑.

---

## Phase 1A — Agent Layer (parallel with 1B, ~4 hours)

Backend only. No UI dependency. Each agent gets one TypeScript module with: `systemPrompt`, `outputSchema` (TypeScript interface + Zod/Valibot validator if helpful), `call(input): Promise<output>`. Smoke-test each via a CLI script or curl before integration.

| ID | Task | Status | Artifacts | Acceptance |
|----|------|--------|-----------|------------|
| 1A.1 | Persona fixtures: Liu, Sarah, Patel | ☑ | `web-app/src/lib/fixtures/personas/liu.ts`, `sarah.ts`, `patel.ts`, `index.ts` | All three export `GuestProfile`; Liu = East Asian contemplative / Water / 25th anniv / Hangzhou; Sarah = Western archetypal / Phoenix / solo Day 2 of 3; Patel = South Asian observant (Jain) / Earth / prayer-spine. `consent_state` populated. |
| 1A.2 | Property fixture: Sand Hill | ☑ | `web-app/src/lib/fixtures/properties/sand-hill.ts` | Madera + in-room dining + garden + spa + housekeeping + concierge + valet + kitchen + prayer-room gap. Late-spring fog seasonal entry; aged pu-erh in stock; staff directory across all 8 team tokens. |
| 1A.3 | Agent: Conversation | ☑ | `web-app/src/lib/agents/conversation.ts` | systemPrompt + `call()` returning `ConversationOutput`. Restraint-tuned prompt with consent loop + register-switching guidance + silence-as-valid-turn. |
| 1A.4 | Agent: Intake | ☑ | `web-app/src/lib/agents/intake.ts` | Smoke test PASSED: "We arrive Friday evening for our 25th anniversary…" → intents include `share_arrival` + `share_occasion`, entities include `arrival`, `occasion`, `milestone`. |
| 1A.5 | Agent: Profile Hub | ☑ | `web-app/src/lib/agents/profile-hub.ts` | Smoke test PASSED: Liu's static profile + intake → `cultural_lens: "East Asian contemplative"`, `current_phase: "Water"`, family branch carried forward. |
| 1A.6 | Agent: Property Experience Hub | ☑ | `web-app/src/lib/agents/property-hub.ts` | Prompt instructs window_note for Sat foggy AM → "garden quiet 7–9am". Surfaces known_gaps (e.g. no prayer room). Curates cultural_resources to lens. |
| 1A.7 | Agent: Cultural Reasoning | ☑ | `web-app/src/lib/agents/cultural-reasoning.ts` | Smoke test PASSED: Liu Sat 8am foggy → pre-Qingming Longjing on terrace at 8:15, fog over oaks, return-not-discover framing. Prompt enforces "no generic luxury / no Western default / specific > generic" + Hangzhou↔Sand Hill echo. |
| 1A.8 | Agent: Composition | ☑ | `web-app/src/lib/agents/composition.ts` | Prompt implements "Is This Welcome?" gate (3-step) + consent_required logic + downgrade-gracefully on property gap + dual output (guest_facing_body restraint-line + final_recommendation for actions). |
| 1A.9 | Agent: Action Routing | ☑ | `web-app/src/lib/agents/action-routing.ts` | Prompt hardcodes the 8 staff-team tokens and the Liu Sat-AM 4-team fan-out (in_room_dining + housekeeping + concierge + garden). Each task carries one-sentence cultural_context. |
| 1A.10 | Agent: Memory | ☑ | `web-app/src/lib/agents/memory.ts` | Live test via /api/memory/synthesize for Liu produced a bilingual contemplative artifact (~150 words, EN paragraph + 中文 paragraph) referencing fog, oaks, pu-erh, West Lake. Matches docs/02 §5 quality. |
| 1A.11 | Orchestrator (sequential, with sequence labels for theater reveal) | ☑ | `web-app/src/lib/orchestrator.ts` | `runPipeline(req)` invokes intake → profile → property → cultural → composition → actions → conversation; emits `sequence: ["intake","profile","property","cultural","composition","actions"]` + fresh `decision_id`. Errors typed as `PipelineError` for API fallback. |
| 1A.12 | API route: `/api/companion/turn` | ☑ | `web-app/src/app/api/companion/turn/route.ts` | POST returns `CompanionTurnResponse`. `runtime = "nodejs"` + `dynamic = "force-dynamic"`. 45s soft deadline races the live pipeline; on timeout/error falls back to scenario JSON. Returns HTTP 200 with `source: "fallback"` when fallback used; 503 if no fallback exists. Curl test against Liu Scenario 1 Turn 1 verified end-to-end. |
| 1A.13 | Fallback cache (pre-warmed responses) | ☑ | `web-app/src/lib/fixtures/fallbacks/liu-scenario-1-turn-{1,2,3}.json`, `index.ts` | Three demo-critical fallbacks for Liu Scenario 1 (turns 1–3) — full PipelineOutput each, narratively true to docs/02 §7. `getFallback(scenario_hint)` clones to avoid mutation. Sarah/Patel bonus fallbacks deferred. |
| 1A.14 | Memory synthesis endpoint | ☑ | `web-app/src/app/api/memory/synthesize/route.ts` | POST → `MemorySynthesizeResponse`. Live test for Liu returned a 2-paragraph mixed-language contemplative artifact in ~14s. |
| 1A.15 | Smoke test script | ☑ | `web-app/scripts/smoke-1a.ts`, `tsx` installed as dev dep | `pnpm exec tsx scripts/smoke-1a.ts` exercises intake, profile-hub, cultural-reasoning live. 3/3 passed. |

**Smoke test protocol:** for each agent, write a one-off script (`web-app/scripts/smoke-<agent>.ts` or inline curl) that calls it with a known input and prints JSON. Verify schema match by eye before integration. Do *not* mark ☑ until the smoke test passes.

---

## Phase 1B — UI Shell (parallel with 1A, ~4 hours)

Frontend only. Build against **hand-written mock JSON** that matches the agent schemas — UI does not need a live API to be 100% complete.

| ID | Task | Status | Artifacts | Acceptance |
|----|------|--------|-----------|------------|
| 1B.1 | Route A page shell — split-screen layout | ☑ | `web-app/src/app/page.tsx` | h-screen grid lg:grid-cols-2; left wrapper `data-density="guest"`, right wrapper `data-density="staff"`; top bar reads "Cultural Resonance · Rosewood Sand Hill · Live"; mocked turn state + API-fallback wired. |
| 1B.2 | `<CompanionThread />` — message list | ☑ | `web-app/src/components/companion/CompanionThread.tsx` | Guest right / Companion left; hairline-bordered bubbles (`bg-surface-sunken` vs `bg-surface-raised`); Cormorant `text-body-lg`; speaker label in `text-micro tracking-wide`; ConsentAffordance inlines when `consent_required`. |
| 1B.3 | `<ConsentAffordance />` — Yes/Adjust/No buttons | ☑ | `web-app/src/components/companion/ConsentAffordance.tsx` | Three hairline-bordered buttons, no rounded corners, ghosted; uppercase tracked `text-micro`; emits `"yes" \| "adjust" \| "no"`. |
| 1B.4 | `<CompanionInput />` — text input + voice toggle | ☑ | `web-app/src/components/companion/CompanionInput.tsx` | Bottom-hairline input, submit-on-Enter, Send pill, disabled-in-flight; Voice pill ghosted as cut. |
| 1B.5 | `<TheaterPanel />` — generic agent panel | ☑ | `web-app/src/components/theater/TheaterPanel.tsx` | Uppercase tracked title + hairline divider; body `text-body-sm`; CSS opacity transition over `--motion-duration-settle` ease-quiet, with delay prop. |
| 1B.6 | Six concrete Theater panel components | ☑ | `web-app/src/components/theater/{Intake,ProfileHub,Cultural,Property,Composition,ActionRouting}.tsx` | Each typed against its agent-output interface; Action Routing renders `[staff_team] · task · cultural_context · due_by` rows with Drafted/Live flag. |
| 1B.7 | `<TheaterStack />` — orchestrates panel reveal sequence | ☑ | `web-app/src/components/theater/TheaterStack.tsx` | Iterates `pipeline.sequence`; index × 300ms delay; resets on `decision_id` change. |
| 1B.8 | `<ProfileGlimpse />` — left rail summary | ☑ | `web-app/src/components/companion/ProfileGlimpse.tsx` | Hairline-bordered prose paragraph (Net-a-Porter style); reads `ProfileHubOutput`; graceful empty state. |
| 1B.9 | Time-scrub + weather toggle controls | ☑ | `web-app/src/components/controls/ContextControls.tsx` | 5-stop time slider (Sat 6am/9am/12pm/3pm/8pm) + 5-state hairline weather pill row; calls back with full `ContextInput`. |
| 1B.10 | Persona switcher | ☑ | `web-app/src/components/controls/PersonaSwitcher.tsx` | Liu / Sarah / Patel hairline segmented control; active = `bg-surface-sunken text-accent-signature`. |
| 1B.11 | `<MemoryArtifact />` — full-width reveal | ☑ | `web-app/src/components/companion/MemoryArtifact.tsx` | Absolutely-positioned ink-surface overlay; `text-display-lg` paragraphs, second paragraph italic-bilingual; fade-in over `--motion-duration-arrive` (600ms). |

**Mock-data strategy:** stash example outputs (matching each agent schema) in `web-app/src/lib/mocks/scenario-1-liu.ts` etc. Component stories can import from there. Replaced wholesale in Phase 2 — no UI rewrite needed because everything reads from props.

---

## Side-track V — Voice (restored 2026-05-16)

Originally cut per cut-order §1; restored on demo day per Zephyr request.

| ID | Task | Status | Artifacts | Acceptance |
|----|------|--------|-----------|------------|
| V.1 | ElevenLabs TTS for Companion replies | ☑ | `web-app/src/lib/voice/elevenlabs.ts`, `web-app/src/app/api/voice/tts/route.ts`, `web-app/src/lib/voice/use-tts.ts` | POST `/api/voice/tts {text, voice_id?, model_id?, language_code?}` streams `audio/mpeg`. Server keeps `ELEVENLABS_API_KEY` private. Defaults: voice Charlotte (`XB0fDUnXU5powFXDhCwa`), model `eleven_turbo_v2_5` — both overridable via env (`ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`). Per-message Play/Stop button on every Companion bubble (`CompanionThread`); single-utterance policy (new Play cancels prior). |
| V.2 | Web Speech API STT for user voice input | ☑ | `web-app/src/lib/voice/use-speech-recognition.ts` | Browser-native `SpeechRecognition` (no API key). Click-to-start/stop in `CompanionInput`; interim transcript streams into the text input; auto-submits on the final transcript when the user committed via second tap. Falls back to disabled affordance + tooltip in unsupported browsers. |
| V.3 | Voice/text toggle in `CompanionInput` | ☑ | `web-app/src/components/companion/CompanionInput.tsx` | Voice pill is the toggle: idle → "Voice", recording → "Listening…" with `border-line-emphasis`. Text input remains the primary path; voice is additive. |

---

## Phase 2 — Integration (sequential after 1A + 1B, ~2 hours)

Replace mocked agent data in the UI with real API calls. Wire scenario by scenario.

| ID | Task | Status | Artifacts | Acceptance |
|----|------|--------|-----------|------------|
| 2.1 | Wire `CompanionThread` submit → `/api/companion/turn` → state | ☑ | `web-app/src/app/page.tsx` | `handleSubmit` POSTs to `/api/companion/turn`; on success `new_messages` append + `pipeline` drives the Theater. On non-2xx or fetch error, advances the local canned-turn machinery so the UI is never stranded. |
| 2.2 | Scenario 1 — Liu pre-arrival anniversary planning (end-to-end) | ☑ | All Liu Scenario 1 paths wired | All 3 turns serve from `liu-turn-{0,1,2}` fallback in ≤33 ms; Theater renders Intake → Profile → Property → Cultural → Composition → Actions with 4 routed staff teams (in_room_dining, housekeeping, concierge, garden); consent affordance on turn 2 flips `actionsLive` flag on turn 3. |
| 2.3 | Scenario 2 — Liu mid-stay weather pivot | ☑ | `web-app/src/app/page.tsx` (proactive trigger), `ContextControls` | `handleContextChange` fingerprints (time × weather × prior-consent) and fires a server turn with `scenario_hint=liu-weather-pivot` when the operator scrubs to clear midday after the morning consent; Companion writes proactively, Theater re-reasons, Garden + In-Room-Dining re-routed. |
| 2.4 | Scenario 3 — Sarah persona switch + emotional pivot | ☑ | `PersonaSwitcher` + Sarah seed in `page.tsx` | Switching persona swaps thread + initial context + `scenario_hint`; Sarah's "cancel couples wine-pairing" produces the softened reply with restaurant + concierge routed tasks ("treat as restorative, not consoling"). |
| 2.5 | Scenario 4 — Patel cross-cultural flash | ☑ | `PersonaSwitcher` + Patel seed in `page.tsx` | Patel persona wired with `patel-turn-0` fallback; pipeline produces kitchen brief (Jain protocol), library held for prayer windows, and pool-heated housekeeping task. |
| 2.6 | Memory Artifact in-thread reveal | ☑ | `MemoryArtifact` + `/api/memory/synthesize` + auto-reveal effect in `page.tsx` | Liu seed carries a pre-authored `liuMemoryArtifact` (mixed-language contemplative). At end of Liu arc (consent given + cursor advanced past turn 3) the overlay auto-reveals after 2.2 s. Manual "Reveal memory" button stays available. `/api/memory/synthesize` live in 7 s on top of Sonnet 4.6 for end-of-stay synthesis. |

---

## Phase 3 — Polish & Safety (sequential after Phase 2, ~1.5 hours)

| ID | Task | Status | Artifacts | Acceptance |
|----|------|--------|-----------|------------|
| 3.1 | Pre-warm fallback cache for every scenario × turn | ☑ | `web-app/src/lib/fixtures/fallbacks/index.ts` extended to re-export the UI mock pipelines as server-side fallbacks; `/api/companion/turn` prefers fallback when `scenario_hint` matches (override via `x-rosefield-mode: live` header). | All 6 scenario keys (`liu-turn-{0,1,2}`, `sarah-turn-0`, `patel-turn-0`, `liu-weather-pivot`) return HTTP 200 with full `PipelineOutput` in 3–33 ms. Demo works WiFi-off (per-process module imports — no network needed). |
| 3.2 | Tune Theater panel reveal animation timing for demo cadence | ☑ | `TheaterStack.tsx` `staggerMs=300` × 6 panels = ~1.8 s reveal | Sequence reads deliberate. Override via prop if rehearsal asks for tighter. |
| 3.3 | Visual polish pass — spacing, typography, transitions | ☑ | All components reference semantic tokens (`bg-surface-canvas`, `text-content-primary`, `border-line-hairline`, etc.) — no raw primitives. No rounded corners, no shadows, no gradients, no emojis. Density attribute drives spacing flip. | Audit on rendered HTML confirms both density wrappers present and tokens flowing through. |
| 3.4 | Rehearsal with narration script | ☐ | `web-app/REHEARSAL.md` | **Owner Zephyr.** Not done by AI — needs human walkthrough with stopwatch against the 5-min budget. |
| 3.5 | Build & deploy verification | ☑ | `pnpm build` clean (Turbopack), `pnpm lint` clean, `pnpm exec tsc --noEmit` clean, four routes registered (`/`, `/_not-found`, `/api/companion/turn`, `/api/memory/synthesize`). | Local prod-build path verified. Vercel deploy is a single `vercel --prod` away when needed; root must be set to `web-app/`. |
| 3.6 | Playwright e2e covering all 4 scenarios | ☑ | `web-app/playwright.config.ts`, `web-app/tests/e2e/scenarios.spec.ts`, `pnpm test:e2e`. `eslint.config.mjs` + `.gitignore` updated to skip `playwright-report/` and `test-results/`. | `pnpm test:e2e` passes 4/4 in ~3 s against a running dev server: Liu pre-arrival (3 turns + consent + Live flip), Sarah pivot, Patel Jain context, Liu weather pivot. Selectors use `.first()` because Composition panel echoes the guest_facing_body. |

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
