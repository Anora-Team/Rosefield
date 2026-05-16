# Rosefield — Cultural Resonance Concierge

Hackathon entry for **Hospitality 2030: A Rosewood Sand Hill Hackathon** (Cerebral Valley).
Demo day: **2026-05-16**. Solo founder: Zephyr.

> A hotel that *understands* — sensing the moment, the person, and the cultural fabric they live in, then responding with just-enough resonance.

## Thesis

The industry has openly declared rule-based personalization dead but hasn't named the successor. Cultural Resonance is the successor — **cultural reasoning, not more data**. The product is built on one engine that takes 3 explicit inputs (DOB, origin, one sentence of intent) and surfaces it through three pillars on a shared substrate:

| Pillar | Audience | What it does |
|---|---|---|
| **Guest Companion** | The traveler, across the lifecycle | A restraint-tuned conversational thread (text + voice) from booking inquiry to ~2 weeks post-stay. Extracts intent through dialogue, not forms. |
| **Operations Theater** | Concierge, restaurant, spa, housekeeping, valet, kitchen | Multi-agent reasoning made visible. Every cultural inference traces to concrete actions routed to specific staff teams. |
| **Operator Portal** | New-property leadership | Simulation environment where synthetic guest cohorts walk a property's calendar, surfacing experience gaps before opening day. |

Asymmetry is the feature: the Companion is gentle (~10% of the reasoning, half the density); the Theater is dense (~100%, twice the density); the Portal is operational. All three consume the same Cultural Reasoning substrate.

## Repository layout

| Path | Purpose |
|---|---|
| [docs/](docs/) | Design documentation — product, experience, architecture, pitch, setup, execution |
| [web-app/](web-app/) | Next.js 16 + React 19 + Tailwind v4 scaffold. The demo app. |
| [design-pattern/](design-pattern/) | Visual language — Tailwind v4 `@theme` tokens, DTCG JSON, two-tier guest/staff density system |
| [user-profiles/](user-profiles/) | Simulated guest profiles for engine testing (Shen, Seo, Al Zahrani, Patel, +others) |

## Docs index

| # | Document | Perspective |
|---|----------|-------------|
| 00 | [Overview](docs/00-overview.md) | Index + one-liner + dual-interface summary |
| 01 | [Product Strategy](docs/01-product-strategy.md) | Market thesis, personas, defensibility, GTM phases |
| 02 | [Experience Design](docs/02-experience-design.md) | Voice principles, conversational lifecycle, operations theater, visual system |
| 03 | [Technical Architecture](docs/03-technical-architecture.md) | 8-agent pipeline, three-pillar runtime, simulation engine, build plan |
| 04 | [Pitch Sharpening](docs/04-pitch-sharpening.md) | Validated claims, defensibility, Q&A prep |
| 05 | [Development Setup](docs/05-development-setup.md) | Prereqs, env vars, stack constraints, conventions for AI agents |
| 06 | [Implementation Tracker](docs/06-implementation-tracker.md) | Phase-by-phase tasks, parallel tracks, status, cut order |

## Demo scope (Route A)

Split-screen — Companion conversation on the left, Operations Theater (8 agent panels + Action Routing fan-out) on the right. Four scenarios across ~5 min:

1. Mrs. Liu Lihua — pre-arrival anniversary
2. Liu — mid-stay weather pivot
3. Sarah Anderson — emotional pivot
4. Arjun Patel — cross-cultural flash

Route B (Operator Portal) is mentioned in the close, not demoed live. Realistic build is ~8 hours; the 5-hour fallback ships Liu's two scenarios only. See [docs/06-implementation-tracker.md](docs/06-implementation-tracker.md) for the live build state and cut order.

## Stack & data strategy

- **Next.js 16** (App Router, Turbopack), **React 19.2**, **TypeScript**, **Tailwind CSS v4**
- **Anthropic Claude** for the agent pipeline
- **No database for the demo.** Guest profiles + property knowledge are TypeScript modules; decision events + memory artifact live in React state; pre-warmed fallback LLM responses ship as JSON. Persistence is a post-hackathon decision.

See [web-app/README.md](web-app/README.md) for local development and deploy instructions.

## What this is NOT

- Not a generic AI chatbot — the Companion is restraint-tuned and consent-anchored
- Not a CRM with better notes — preference checkbox grids replaced by prose + provenance, reasoning routed as actions
- Not hyper-personalization through surveillance — minimal inputs, deepened only with explicit permission
- Not a new PMS or ticketing system — sits above Mews/OPERA, feeds ALICE/Knowcross

## License

See [LICENSE](LICENSE).
