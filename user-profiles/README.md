# Simulated Guest Profiles

Test fixtures for the Cultural Resonance engine. Each profile models a distinct Rosewood guest segment and is split per the architecture in [03-technical-architecture.md §3](../docs/03-technical-architecture.md):

| Section | What it represents | Source in the live product |
|---|---|---|
| `direct_input` | The 3 explicit items the guest typed/spoke at check-in (DOB, origin, one-sentence intent) + languages + booking window | Guest tablet / front desk |
| `family[]` | Household + travel-party composition with relations, DOBs, and `traveling_on_this_stay` flag | Observed across prior stays; never inferred from external sources |
| `derived_from_history` | 3–14 prior Rosewood stays with specific `notable_moments`, register tokens, `recurring_staff_relationships`, and a `cross_property_pattern` summary | Accumulated organically by staff cockpit + Memory Artifact |
| `cultural_profile_hint` | What the Cultural Reasoning Agent would derive: lens, register, current life-phase, anchors, avoidances | Internal — staff-visible only on the cockpit |

The split exists so a single profile can exercise the full pipeline: it gives the Context Agent something to read, the Cultural Reasoning Agent a phase + register to work in, and the Composition Agent a history of accepted/declined choices to weigh against the current decision moment.

Schema: [types.ts](types.ts).

## The four profiles

### [shen-family.json](shen-family.json) — Mrs. Shen Yuwen (沈玉雯), 60, Suzhou
**Phase:** Earth · matriarchal grounding
**Stay:** 4 nights at Rosewood Hong Kong for her 60th 大寿 with husband, daughter, son-in-law, and 3-year-old granddaughter
**Distinct from Liu Lihua:** next decade, multi-generational orchestrator role, Wu-literati Suzhou register rather than Hangzhou tea-classical; care expressed through *environment* (seating, half-drawn curtains, whole-fish symbolism) rather than contemplative solitude. Resists being the subject of celebration — staff must route felicitations through her husband or daughter.
**History:** 6 stays across Beijing → Sanya → Hong Kong (×2) → Phuket → Guangzhou over six years; arc traces couple → expanded family → first-grandchild trip.

### [seo-honeymoon.json](seo-honeymoon.json) — Seo Ji-won (서지원) & Han Yu-jin (한유진), Seoul
**Phase:** Threshold / 첫 걸음 · first step
**Stay:** 3 nights at Sand Hill, honeymoon following a small Seoul wedding
**Cultural register:** Contemporary Korean restraint — 단아 (dan-a, graceful simplicity), 정갈 (jeong-gal, neat clarity). Held by a generation between Confucian family duty and global design literacy. Reads luxury through quietness, not display.
**Signature avoid:** the honeymoon framing itself — no champagne, no flowers, no "Mr. & Mrs." narration, no photography. Silence is the amenity.
**History:** 3 prior stays — engagement trip to Rosewood Hong Kong (where the spouse's tinnitus and silent-massage preference was learned), Phuket family New Year, and one solo work-trip stay at Rosewood London.

### [al-zahrani-family.json](al-zahrani-family.json) — Khalid bin Sulaiman Al Zahrani, 58, Jeddah
**Phase:** Harvest / Al-Hasād · gathering the family while it is still whole
**Stay:** 21 nights at Rosewood Castiglion del Bosco (July–August summer escape) — 11 travelers including his 84-year-old mother (first time joining since 2019), wife Hanan, four adult children, two daughters-in-law, two grandchildren, and the family's long-tenured Filipino nanny
**Cultural register:** Hejazi affluent — patriarch-led but matriarch-calibrated (Hanan is the real signal). Observant Islamic practice integrated into the household's normal rhythm, not flagged as special-case. Deep loyalty to staff who remember names and details across years.
**Signature avoid:** scripting that frames Islam as requirement; scheduling across maghrib without checking salat times; treating the nanny as back-of-house.
**History:** 5 stays — Rosewood London (×3), Munich Bayerischer Hof (×1), Castiglion del Bosco (×1). Arc traces city → countryside as the family grew; recurring staff (Anwar's ful medames at London, Frau Huber's women's-pool hour in Munich, Beatrice and Lorenzo's qibla-mark on the Castiglion terrace).
**Seeds the Middle East lens** called out in [arch doc §11](../docs/03-technical-architecture.md).

### [patel-sandhill.json](patel-sandhill.json) — Arjun Patel, 41, Edison NJ
**Phase:** Inheritance · reckoning across three frames
**Stay:** 3 nights at Sand Hill with wife Priya and two children (Anaya 10, Rohan 7). His 14th Sand Hill stay — but the first as a father. Acquisition closed Tuesday.
**Cultural register:** Second-generation Gujarati-American navigating a triangulated identity (immigrant parents' frame of arrival and sacrifice / his constructed founder frame / a third frame his kids are growing into without a name yet). Cultural reasoning here is *not* about Indian-ness as decoration (rangoli, paneer on menu) — it's about the weight of a son who has 'made it' beyond his parents' frame.
**Signature signal:** decade-deep silent relationship with Madera server Maya — who learned his no-alcohol pattern without being told why and quietly swapped his champagne for sparkling water at his Series D dinner. The Castiglion sabbatical he cut short for "a board thing" sits in history as unfinished business.
**Tests the hardest case:** even a 14-stay regular deserves cultural-resonance reasoning, not just "knows their wine preferences."

## Coverage map

| Profile | Cultural lens | Phase | Party size (traveling) | Prior stays | Hero property |
|---|---|---|---|---|---|
| Shen family | Jiangnan / Wu literati | Earth (matriarchal grounding) | 4 of 5 | 6 | Rosewood Hong Kong |
| Seo + Han | Contemporary Korean restraint | Threshold | 2 of 5 documented | 3 | Rosewood Sand Hill |
| Al Zahrani family | Hejazi multi-gen | Harvest | 11 of 12 | 5 | Castiglion del Bosco |
| Arjun Patel | Second-gen Gujarati-American | Inheritance | 4 of 5 | 14 | Rosewood Sand Hill |

Phases were chosen to be **mutually distinct** from each other and from the two existing demo personas (Liu Lihua = Water, Sarah Anderson = Phoenix), so the engine can be exercised across a real spread of life-phase reasoning rather than rehearsing the same beat.

## Adding more profiles

1. Pick a Rosewood guest segment not yet represented (Latin American affluent, Japanese, multi-property loyalty couple, etc.) — see [01-product-strategy.md §2](../docs/01-product-strategy.md) and the Phase 2 GTM properties.
2. Choose a life-phase distinct from the existing five (Water, Phoenix, Earth, Threshold, Harvest, Inheritance).
3. Write the JSON conforming to [types.ts](types.ts). The hard constraint: `direct_input.stay_intent` must be one sentence in the guest's own voice that expresses feeling, never logistics — anything operational lives in `family[]` or `derived_from_history`.
4. Add a row to the coverage map above.

## Generation notes

These profiles were generated in parallel by four Claude subagents on 2026-05-16. Each agent received the same project context (thesis, dual-interface architecture, restraint principle, schema) plus a specific archetype brief with constraints around cultural specificity, named avoidances of stereotype, and the requirement that `notable_moments` be concretely specific rather than generic.
