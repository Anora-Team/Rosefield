# Experience Design — Principal Designer Perspective

**Document owner:** Design
**Status:** v1.0
**Last updated:** 2026-05-16

---

## 1. Design Philosophy

### Core Belief

The highest form of hospitality design is **restraint that feels like warmth**. The system's most important output is often choosing NOT to speak.

### Rosewood's Design DNA (from research)

Rosewood builds "Sense of Place" through six layers:

```
L6: Social Anthropology  ← Leave space for unscripted behavior
L5: Cultural Rituals     ← Match local rhythms and seasons
L4: Curated Art          ← Like a private collection, not a gallery
L3: Culinary Terroir     ← Translate place into taste
L2: Material Vernacular  ← Local textures, not imported luxury
L1: Architectural Form   ← Place shapes building, not brand
```

Cultural Resonance operates primarily at **L5 (Cultural Rituals) + L6 (Social Anthropology)** — the layers closest to the guest's lived experience.

### Three Design Axioms

1. **Place first, person second, technology invisible** — The experience should feel like "this place understood me," not "this AI understood me"
2. **The Memory Artifact is a fragment of place, not a diary** — Guests take home a piece of the location's memory, not their own data
3. **Noop is a valid output** — Silence, restraint, and non-intervention are design decisions, not bugs

---

## 2. Interaction Model

### Guest Journey — One Continuous Thread

```
PRE-BOOKING          PRE-ARRIVAL          IN-STAY              POST-STAY
─────────────────────────────────────────────────────────────────────────
Inquiry              Itinerary            Decision moments     Memory
"Sand Hill vs        co-design with       + real-time pivots   Artifact
Mendocino?"          gentle 3-input       + reactive requests  (in-thread,
                     extraction           + emotional pivots   ~2 weeks)
                     + family profile

         ─── one Companion thread per guest, lifecycle-long ───
         ─── profile deepens only with explicit consent ───
```

The Companion is the same conversational channel — text or voice — from first inquiry to two weeks after departure. The three-input ritual happens *inside* the conversation, extracted gracefully across the first few exchanges rather than presented as a check-in form. The Memory Artifact arrives in the same thread, not as a separate email.

### The Three-Input Ritual (Extracted, Not Collected)

The cultural reasoning engine still activates from three pieces of voluntary data — but the Companion extracts them through conversation, ideally before the guest arrives:

| Input | Where it surfaces | Example dialogue |
|---|---|---|
| Birth date | Whenever it surfaces naturally (booking, anniversary mention) | "If you'd like to share your birth date, Sand Hill marks days that matter." |
| Origin / hometown | Pre-arrival, once intent is established | "Where are you traveling from? We try to ease the seam between home and here." |
| One sentence of intent | First substantive exchange | "What does this trip mean to you? Even one sentence helps." |

**Design constraint:** these are not checkpoints the guest must clear. The Companion can recommend with two inputs, or one, or none — depth degrades gracefully. The system is allowed to ask only when asking would be welcome.

**Family-aware extension:** when the guest mentions companions (spouse, parents, children), the Companion offers — never insists — to extend the same gentle extraction to those names. Each family member's profile is a sibling record, linked by consent, never shared without the originating guest's permission.

### Decision Moments

The system speaks only at **natural decision points** — moments where a guest would naturally wonder "what should I do next?"

- Morning (what to do with the first hours)
- Transition (weather shifts, energy shifts)
- Evening (dinner, winding down)
- Departure (what to take with them)

Between decision moments: **silence**. No push notifications. No "checking in." The Companion writes only when a material change occurs (weather shift, schedule disruption, an emotional pivot the guest signals) and only when the guest has signaled openness to proactive whispers. Default state of the channel: receptive, not transmitting.

### The "Is This Welcome?" Gate

Before any proactive output, the system passes through:

```
[Trigger event] → Is this a natural decision moment?
                     ↓ yes
                  Has the guest signaled openness?
                     ↓ yes
                  Is this more valuable than silence?
                     ↓ yes
                  → Deliver recommendation
                     ↓ no (at any step)
                  → Noop (do nothing)
```

---

## 3. Information Architecture

### Three Audiences, One Engine

The system maintains **three distinct UX surfaces**, each tuned to a different operational reality:

| Audience | Why they use it | Output emphasis |
|---|---|---|
| **Guest** | One conversational companion across the entire stay lifecycle | Restraint, beauty, minimal asks, in-thread Memory Artifact |
| **Staff** | Faster, more confident, more culturally fluent service | Density, decisions, references, action routing |
| **Operator** | Stress-test a property before launch; find gaps before guests do | Cohort simulations, projected requests, failure modes, gap reports |

The same Cultural Resonance engine powers all three — but framing, density, and tone differ dramatically. **Guest sees ~10%; staff sees ~100% of the reasoning; operator sees the system's own failure modes.**

### Guest-Facing Surfaces

| Surface | Context | Interaction Model |
|---|---|---|
| Companion thread (web / mobile / voice) | Whole lifecycle, pre-booking → ~2 weeks post-stay | Conversational, restraint-tuned, consent-anchored; voice or text; family-aware |
| In-room tablet | Morning, evening, quiet in-room moments | Pull-based glance at the thread; one quiet line, never a screen of choices |
| WeChat mini-app | APAC guests preferring WeChat as their channel | Companion thread rendered as a WeChat conversation; Mandarin-native |
| Staff verbal | Concierge, restaurant, spa, valet | Staff reads the theater, delivers the action in person — the human surface above the AI infrastructure |
| Memory Artifact | ~2 weeks post-stay | Delivered in-thread (not a separate email); curated by guest, kept with their permission |

### Staff-Facing Surfaces

| Surface | Context | Interaction Model |
|---|---|---|
| Pre-shift cockpit | Start of morning/evening shift | Briefing — read-only overview |
| Live arrange panel | At point of decision (concierge desk, restaurant pass) | Suggest + accept/edit/pass |
| Reference library | Quiet moments, training, edge cases | Search + browse |
| Override log | End of shift | Reflection — what did staff change and why |

### Staff-Facing Surface — The Concierge Cockpit

Staff see what the guest never sees: cultural reasoning, real-time availability, and reference material — all keyed to the **current shift and the next decision**.

The staff interface has three operational modes:

#### Mode 1 — Discover (Pre-Shift Briefing)

Used by concierge / restaurant maître d' / spa lead at the start of each shift. Shows the cultural map of guests currently on property.

```
┌──────────────────────────────────────────────────────────┐
│  TODAY · SATURDAY                                         │
│  ─────────────────────────────────────────────────────   │
│                                                           │
│  Mrs. Liu Lihua  ·  Room 412  ·  Day 1 of 3              │
│    Lens: East Asian contemplative · Water phase           │
│    Today's arc: anniversary morning, returning home       │
│    Energy: still, prefers garden over events              │
│                                                           │
│  Sarah Anderson  ·  Villa 7  ·  Day 2 of 3                │
│    Lens: Western archetypal · Phoenix phase               │
│    Today's arc: solo retreat, self-redefinition           │
│    Energy: solitary, art-curious, slow walking            │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

#### Mode 2 — Arrange (Live Decision Support)

When staff is about to act — confirm a reservation, suggest an activity, prepare a turn-down — the cockpit surfaces:
- The cultural reasoning ("why this guest, why now")
- Current property availability (tables, treatments, weather, garden)
- Specific reference notes (pu-erh stock, Madera private rooms, current art exhibits at nearby Cantor)
- A drafted recommendation that the staff member delivers in their own voice

```
┌──────────────────────────────────────────────────────────┐
│  ARRANGE · Mrs. Liu · Saturday Breakfast                  │
│  ─────────────────────────────────────────────────────   │
│  WHY                                                      │
│    Anniversary morning. Foggy. Water phase = stillness.   │
│    Garden quiet until 9. Pu-erh in stock.                 │
│                                                           │
│  AVAILABILITY                                             │
│    Madera private terrace: open                           │
│    In-room tea service: 12 min lead time                  │
│    Garden water feature: cleaned 7:30, walkable now       │
│                                                           │
│  SUGGESTED ARRANGEMENT                                    │
│    1. In-room pu-erh tea service on terrace, 8:15         │
│    2. Quiet garden walk option, 9:00 (no escort needed)   │
│    3. Hold Madera for tomorrow's anniversary dinner       │
│                                                           │
│  [Accept]  [Edit]  [Pass]                                 │
└──────────────────────────────────────────────────────────┘
```

#### Mode 3 — Reference (Cultural Library)

A searchable cultural reference, contextual to the guest in front of the staff member. Not a generic Wikipedia — curated, cross-referenced to property resources.

```
┌──────────────────────────────────────────────────────────┐
│  REFERENCE · East Asian Contemplative Guest               │
│  ─────────────────────────────────────────────────────   │
│  Hangzhou origin                                          │
│    → tea associations: Longjing (green), pu-erh (aged)    │
│    → seasonal: misty mornings, classical garden aesthetic │
│    → cultural anchor: West Lake, Su Dongpo poetry         │
│                                                           │
│  25-year anniversary framing                              │
│    → NOT "celebrate" / "experience" / "discover"          │
│    → Use: "return," "together," "deepen"                  │
│                                                           │
│  Water phase pacing                                       │
│    → 1 activity per half-day max                          │
│    → buffer time built in                                 │
│    → avoid: famous sights, photo-op spots, group settings │
└──────────────────────────────────────────────────────────┘
```

**Design rules for the staff cockpit:**
- Information density tuned to **the next 30 minutes of the staff member's day**, not the next 3 days
- All cultural reasoning uses neutral terms ("temperament profile," "phase," "register"). Never "BaZi," never "astrology," never "fortune."
- One screen, one decision — no nested menus during service
- The "Pass" button is sacred — staff can always override, and overrides become training signal

### Operator-Facing Surface — The Simulation Portal

A separate route, used by property leadership and operations leads. The operator picks a cohort of synthetic guests, scrubs the calendar forward, and watches the property respond. Output is gap reports and stress points, not service recommendations.

```
┌──────────────────────────────────────────────────────────────┐
│  SIMULATION PORTAL · Rosewood Mendocino (pre-launch)         │
│  ──────────────────────────────────────────────────────────  │
│  COHORT                                                      │
│    ▣ APAC affluent couple · 25th anniversary                 │
│    ▣ Western solo · post-transition retreat                  │
│    ▣ Middle Eastern family · multi-generational, 6 guests    │
│    ▢ HNW solo male · golf-focused                            │
│    ▢ Bridal party · 8 guests                                 │
│    [+ Add cohort]                                            │
│                                                              │
│  CALENDAR SCRUBBER                                           │
│    [──────────●────────] Sat Day 2 · 14:00                   │
│    Weather: rain · Season: late autumn                       │
│                          [▶ Run]                             │
│                                                              │
│  PROJECTED REQUESTS (next 4 hours)                           │
│    14:15  APAC couple  → "Rain — move the cliff walk?"       │
│    14:22  Western solo → "Bookstore in town?"                │
│    14:40  ME family    → "Quiet room for prayer time"        │
│    15:05  ME child     → "Pool too cold"                     │
│    15:20  Solo male    → "Can I get golf today?"             │
│                                                              │
│  GAPS FLAGGED FOR PRE-LAUNCH PREP                            │
│    ⚠  Prayer space — no room currently designated            │
│    ⚠  Indoor-rain activity menu — currently empty            │
│    ⚠  Pu-erh / specialty teas — no sourcing relationship     │
│    ⚠  Heated pool option — not advertised, not enabled       │
└──────────────────────────────────────────────────────────────┘
```

**Design rules for the operator portal:**
- Findings are presented as **gaps to close**, not as problems with the AI — the system's job is to make the gaps visible before guests do
- Synthetic guests respect cultural plausibility (drawn from the same ontology that powers live recommendations) — never stereotyped, always individuated
- Pre-launch reports flow to a small set of operations leads, never to service staff (these are not service tickets)
- Gap closures feed back into the Property Experience Hub so the live system inherits the fix automatically
- The portal is the moat made tactile for a B2B buyer: it shows how the ontology produces value *before any guest sets foot on the property*

### Cross-Industry Anchors (What Validates This Design)

The dual-interface architecture borrows from beyond hospitality:

| Reference | What we learn |
|---|---|
| [Net-a-Porter EIP](https://in-parallel.co.uk/research_article/net-a-porter/) | Stylist-side profile is **prose-first, fields-second** — let staff write narrative, structure later |
| [Morgan Stanley AI Debrief](https://openai.com/index/morgan-stanley/) | AI's job is to **reduce note-taking burden**, not add another field to fill |
| [Quintessentially Salesforce screenpop](https://www.vonage.com/resources/customers/quinessentially/) | Tier staff UI by **depth of relationship**, not feature set |
| [Knightsbridge Circle (1:4 ratio)](https://www.knightsbridgecircle.com/) | Highest-touch concierge has the **thinnest tooling** — don't replace intimacy with dashboards |

### What This Replaces (And Doesn't Replace)

**Cultural Resonance does NOT replace:**
- The PMS (Mews, Cloudbeds, Oracle OPERA) — we sit on top
- The concierge ticketing system (ALICE, Knowcross) — we feed it
- The staff member's judgment — we offer; they decide

**Cultural Resonance DOES replace:**
- Preference checkbox grids (we use prose + provenance)
- Generic "VIP flag" badges (we explain *why* this guest matters today)
- The post-stay form (Memory Artifact replaces it as a ritual)

### Briefing Card — Prose Format

Critical design choice: the cultural frame is **prose, not bullets**. Borrowed from Net-a-Porter EIP stylist notes.

```
Mrs. Liu Lihua  ·  Room 412  ·  Day 1 of 3
─────────────────────────────────────────────
Hangzhou-rooted, Mandarin-preferred but reads English
fluently. Anniversary trip with husband — first
California stay. Tea matters more than wine; garden
quiet matters more than scenery. Treats this trip as
"returning home together" rather than discovery.

[Why this read] · [Sources: stated intent, origin, phase profile]
─────────────────────────────────────────────
TODAY'S ANCHOR — anniversary morning, foggy, garden empty
DO-NOT — checklists, group tours, "treat yourself" framing
```

Three to five sentences of prose communicate more than thirty preference checkboxes.

---

## 4. Content Design

### Voice Principles

| Dimension | Cultural Resonance Voice | NOT This |
|---|---|---|
| Register | Hospitality prose | SaaS copy |
| Specificity | "Aged pu-erh at 8am on your terrace" | "Some tea options" |
| Agency | "We suggest, when you're ready" | "You should try" |
| Framing | "This morning mirrors..." | "Based on your profile..." |
| Retreat | Graceful, immediate, no explanation | "Are you sure? We can also..." |

### Cultural Register Switching

The same underlying reasoning produces different linguistic textures:

**For Mrs. Liu (East Asian contemplative):**
> "The morning fog mirrors Hangzhou's misty mornings. We've prepared a pu-erh pairing for your terrace — the garden is empty at this hour, and the water feature catches light beautifully around 9am. When you're ready."

**For Sarah Anderson (Western archetypal):**
> "The Cantor Arts Center opens at 11. Rodin's *Burghers of Calais* is in the courtyard — empty Saturday mornings. Have coffee first at Coupa Cafe and bring a notebook. This morning is about meeting yourself through form."

**For Generic AI (the anti-pattern):**
> "Try the Stanford Dish hike for incredible views, or breakfast at Madera."

### The Seven Layers of Understanding

Each recommendation embeds multiple layers (visible to staff, felt by guest):

| Layer | Example (Mrs. Liu, Saturday 8am) |
|---|---|
| Cultural anchor | Specific pu-erh tea (not "some tea") |
| Hometown resonance | Fog → Hangzhou misty mornings |
| Stay intent | "Returning home together, not exploration" |
| Phase reasoning | Stillness over stimulation (Water phase) |
| Property fit | Garden empty at this hour + water feature |
| Avoidance signal | No checklist, "when you're ready" |
| Sensory specificity | Aged pu-erh (not generic tea) |

---

## 5. Memory Artifact Design

### Philosophy

The Memory Artifact is not a diary. It's **a fragment of the place's memory of you** — written in the voice of Rosewood Sand Hill, not in the guest's voice.

Inspired by Rosewood's research insight: **"Memory Artifact should be 'geological' — layers of place — not chronological."**

### Structure

```
┌─────────────────────────────────────────┐
│         ROSEWOOD SAND HILL              │
│         remembers                       │
│                                         │
│  [2 paragraphs, ~150 words]            │
│  Written in the voice of the place     │
│  In the guest's cultural register      │
│  References one specific sensory detail │
│  Composed as a single arc of meaning   │
│                                         │
│  For Mandarin-native guests:           │
│  Second paragraph may be in Chinese    │
│                                         │
│         ─── ✦ ───                       │
│                                         │
│  Delivered 2 weeks after departure     │
│  Via WeChat (APAC) or email (Western)  │
└─────────────────────────────────────────┘
```

### Example (Mrs. Liu)

> Sand Hill remembers a Saturday that began in mist. The fog sat low over the oaks that morning — the kind of stillness that doesn't ask to be broken. You took your tea on the terrace while the garden was still yours alone, and the pu-erh carried something of West Lake across the Pacific.
>
> 那个周六的雾气，和杭州清晨的一样轻。你们在雾里重新找到了"回家"的节奏——不是探索，不是抵达，只是回到彼此身边。这是Sand Hill记得的。

### Design Rules for Memory Artifact

- Never list activities chronologically ("you did X, then Y")
- Compose as a single arc of meaning
- One specific sensory detail anchors the piece
- Written by the place, not about the guest
- Tone: contemplative (East Asian) / literary (Western) — match cultural register
- Length: exactly 2 paragraphs, ~150 words
- No call to action, no booking link, no loyalty program mention

---

## 6. Visual Design System

### Palette (Rosewood-Aligned)

```
Background:    #F5F1E8 (warm cream) — primary
               #1A1A1A (off-black) — dark mode / contrast
Accent:        #2C4A3E (Discovery Green) — Rosewood brand
Secondary:     #B5985A (warm gold) — subtle highlights
Text:          #2D2D2D (near-black) — body
Border:        #D8D2C1 (hairline) — 1px only
```

### Typography

```
Heading:    Cormorant Garamond (serif) — elegant, readable
Body:       Cormorant Garamond (serif) — same family, lighter weight
Monospace:  Not used — this is not a tech product
```

### Spacing Philosophy

- Generous whitespace everywhere
- Content breathes — never crowded
- Hairline borders (1px) only where necessary
- No rounded corners, no gradients, no shadows
- No emojis, no icons (except minimal UI affordances)

### Motion

- Subtle fade-in on content appearance (200ms ease)
- No bounce, no slide, no attention-grabbing animation
- Loading state: elegant skeleton, not spinner
- Streaming text appearance (typewriter effect) for recommendations

### Anti-Patterns (Never Do)

- Rounded pill buttons
- Gradient backgrounds
- Card shadows / elevation
- Colorful tags or badges
- Progress bars or gamification
- "AI generated" badges or sparkle icons

---

## 7. Demo UX Flow (5 Minutes) — Route A

### Framing

The 5-minute hackathon demo runs **Route A** of the product: the live operating view, split-screen.

- **Left half:** Guest Companion — the conversational thread, restraint-tuned, voice or text
- **Right half:** Operations Theater — multi-agent reasoning made visible, with Action Routing fanning recommendations out to specific staff teams

Across four scenarios, the audience sees the same agent pipeline produce different cultural outputs, react to real-time context shifts, and land as concrete actions for human staff. **Route B** (the Operator Portal / Simulation) is named in the close but not demoed live — it's the platform expansion that the live demo earns the right to mention.

The previous Generic-vs-Resonance bake-off is preserved as a 30-second context slide before the live demo starts.

### Screen States

```
0:00–0:30  STATE 1 — Industry Anchor
           Single slide: "Every shipped AI concierge personalizes
           on past behavior. None reasons about who the guest is
           becoming." Voiceover sets the wedge.

0:30–2:00  STATE 2 — Scenario 1: Pre-arrival anniversary planning (Mrs. Liu)
           Open Route A · empty Companion pane · empty Theater.
           Liu writes from Hangzhou: "We arrive Friday evening.
           It's our 25th anniversary..."

           Over 3 conversational turns, the Companion extracts birth
           date, origin, and intent gracefully — never a form.

           Theater wakes panel by panel:
             Intake     → "parsed: anniversary, couple, first US visit"
             Profile    → new record · family branch for husband
             Cultural   → "East Asian contemplative · Water phase"
             Property   → "Sand Hill Sat-AM: garden quiet, fog likely"
             Composition → balances cultural ideal w/ availability
             Actions    → fans out to 4 staff teams

           Companion offers Sat-morning plan and asks consent:
           "Pu-erh on your terrace at 8:15, if you'd like it. Approve?"
           [Yes] → Theater logs consent; actions go LIVE.

2:00–3:00  STATE 3 — Scenario 2: Mid-stay weather pivot (Mrs. Liu)
           Time-scrub to Saturday 11:00. Sun arrives earlier than
           forecast. Companion writes proactively (this is permitted —
           the guest signaled openness in Scenario 1):
           "The fog has lifted earlier than expected. The garden is
           quietest right now."
           Liu: "Walk."

           Theater re-reasons live:
             Property Hub  → garden status updated
             Cultural      → weights restoration > novelty
             Composition   → revises arrangement
             Actions       → Garden team pinged, indoor plan canceled,
                             tea service held for her return

3:00–4:00  STATE 4 — Scenario 3: Emotional pivot (Sarah Anderson)
           Switch persona. New thread. Sarah, Day 2 of 3.
           Sarah: "I booked the couples wine-pairing tonight. I want
           to cancel. Just dinner alone."

           Theater shifts register:
             Profile     → phase note updated ("solitude requested")
             Cultural    → switches to Western archetypal / Phoenix
             Composition → softens language, no probing questions
             Actions     → couples pairing canceled · solo seating at
                           Madera booked · maître d' note: "treat as
                           restorative, not consoling"

           Companion: "Done. The book corner near the fire is yours
           if you'd like it after."

4:00–4:30  STATE 5 — Scenario 4: Cross-cultural flash (Patel family)
           Brief flash, 30 sec. Profile Hub generates a new lens on
           the fly: Mr. & Mrs. Patel, Mumbai, Jain dietary observance,
           prayer-time scheduling.

           Theater shows the same agent pipeline producing entirely
           different actions:
             Actions     → kitchen alert (no root vegetables)
                         → prayer-room reservation
                         → schedule honoring asana timing

           Voiceover: "Same engine. Same renderer rules. Different
           cultural mother tongue. The ontology generalizes."

4:30–5:00  STATE 6 — Close
           "What you saw: a Companion that asked almost nothing and
           understood everything that mattered. An Operations Theater
           where every cultural inference traces to routed actions.
           An ontology that generalizes across cultures in real time.

           A third pillar — the Operator Portal — lets you stress-test
           a property against synthetic guest cohorts before opening
           day. This is the operating system for the hotel of 2030."
```

### Layout Wireframe — Route A

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Cultural Resonance · Rosewood Sand Hill · Live                              │
├────────────────────────────────────┬─────────────────────────────────────────┤
│  GUEST COMPANION (Mrs. Liu)        │  OPERATIONS THEATER                     │
│                                    │                                         │
│  ┌──────────────────────────────┐  │  ┌─ INTAKE ────────────────────────┐   │
│  │ 🟢 Liu Lihua · Day 1 of 3   │  │  │ Parsing: "We arrive Friday..."  │   │
│  │                              │  │  │ → birth context, anniversary    │   │
│  │ Mrs. Liu:                    │  │  │ → routing to Profile + Cultural │   │
│  │   We arrive Friday evening.  │  │  └─────────────────────────────────┘   │
│  │   It's our 25th anniversary  │  │                                         │
│  │   trip — first time in       │  │  ┌─ PROFILE HUB ───────────────────┐   │
│  │   California...              │  │  │ Liu family · 0 prior stays      │   │
│  │                              │  │  │ Lens: East Asian contemplative  │   │
│  │ Companion:                   │  │  │ Phase: Water (restoration)      │   │
│  │   How wonderful. Would you   │  │  │ Avoid: checklists, group tours  │   │
│  │   like me to plan a quiet    │  │  └─────────────────────────────────┘   │
│  │   morning for your first     │  │                                         │
│  │   day, or wait until you     │  │  ┌─ CULTURAL REASONING ────────────┐   │
│  │   arrive?                    │  │  │ Hangzhou + anniversary →        │   │
│  │                              │  │  │   "return," not "discover"      │   │
│  │ Mrs. Liu: Plan it. Quiet.    │  │  │ Foggy AM → garden window 7–9    │   │
│  │                              │  │  │ Tea: aged pu-erh, not green     │   │
│  │ Companion:                   │  │  └─────────────────────────────────┘   │
│  │   I've arranged pu-erh on    │  │                                         │
│  │   your terrace at 8:15 —     │  │  ┌─ PROPERTY EXPERIENCE HUB ───────┐   │
│  │   only if you wake to it.    │  │  │ Sand Hill · spring · fog likely │   │
│  │   Approve?                   │  │  │ Madera open · pu-erh in stock   │   │
│  │   [Yes] [Adjust] [No]        │  │  │ Garden quiet 7–9am              │   │
│  └──────────────────────────────┘  │  └─────────────────────────────────┘   │
│                                    │                                         │
│  [Voice ▾]  [Text ▾]               │  ┌─ COMPOSITION → ACTIONS ─────────┐   │
│                                    │  │ 1. → In-Room Dining             │   │
│  PROFILE GLIMPSE                   │  │      Pu-erh setup, 8:15, R412   │   │
│  Anniversary · together · still    │  │ 2. → Housekeeping               │   │
│  Husband: 老 Mr. Liu (linked)      │  │      Open terrace doors @8      │   │
│  Pace: 1 activity / half-day       │  │ 3. → Concierge desk             │   │
│                                    │  │      Brief Sat AM · hold Madera │   │
│                                    │  │      Sun PM                     │   │
│                                    │  │ 4. → Garden team                │   │
│                                    │  │      Confirm water feature 7:30 │   │
│                                    │  └─────────────────────────────────┘   │
└────────────────────────────────────┴─────────────────────────────────────────┘
```

The Companion (left) and the Theater (right) consume the same agent calls. The Companion applies the restraint renderer — one line per beat, family-aware, consent-anchored. The Theater applies the dense renderer — every reasoning step visible, with Action Routing landing the recommendation at named staff teams. The asymmetry lives in the renderer rules; both sides update from a single agent pipeline run.

---

## 8. Design Principles Summary

| # | Principle | One-Line Test |
|---|---|---|
| 1 | Presence over Prediction | Does this respond to NOW or to history? |
| 2 | Felt, not Tracked | Would the guest feel cared for or observed? |
| 3 | Hospitality as a Verb | Is this a concrete act of care or a brand statement? |
| 4 | The Quiet Layer | Did we pass the "is this welcome?" gate? |
| 5 | One Soul, Many Surfaces | Would this read the same on iPad, WeChat, or spoken? |
| 6 | Concierge with a Conscience | Did we offer a second option when the ask conflicts with wellbeing? |
| 7 | Memory with Permission | Is this something the guest chose to give us? |
| 8 | Time as Texture | Does the system know it's 8am vs midnight vs checkout? |
| 9 | The Last 10% | Will the guest remember this after they leave? |

---

## 9. Cross-Property Adaptability Test

> "If we moved this experience to Rosewood Hong Kong / Crillon / Mayakoba, would it still work?"

- If **yes** → we built a generic AI tool (not enough Sense of Place)
- If **no** → we built a true Cultural Resonance layer that amplifies each property's unique DNA

The answer should be: **the engine travels, the output is always local.** Same Cultural Resonance engine at Hôtel de Crillon produces recommendations rooted in Parisian rhythm, Gabriel architecture, and the Concorde's ghosts — not pu-erh tea.
