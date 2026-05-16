# Simulated Guest Profiles

Test fixtures for the Cultural Resonance engine. This is a **simulation population** for exercising the engine across the spread of Rosewood guest segments — not just demo personas. From this population, the hackathon demo and any user-journey walkthrough pick specific cases.

Each profile is split per the architecture in [03-technical-architecture.md §3](../docs/03-technical-architecture.md):

| Section | What it represents | Source in the live product |
|---|---|---|
| `direct_input` | The 3 explicit items the guest typed/spoke at check-in (DOB, origin, one-sentence intent) + languages + booking window | Guest Companion (conversational, not a form) |
| `family[]` | Household + travel-party composition with relations, DOBs, and `traveling_on_this_stay` flag | Observed across prior stays via consent-anchored linking |
| `derived_from_history` | 3–14 prior Rosewood stays with specific `notable_moments`, register tokens, `recurring_staff_relationships`, and a `cross_property_pattern` summary | Accumulated organically by Operations Theater + Memory Artifact |
| `cultural_profile_hint` | What the Cultural Reasoning Agent would derive: lens, register, current life-phase, anchors, avoidances | Operations Theater — staff-visible only |

The split mirrors the product thesis: **3 explicit inputs in, everything else derived**. The schema lives in [types.ts](types.ts).

## The twelve profiles, by party shape

### Solos at a pivot (3)
- **Sarah Anderson** — 38, London, **Phoenix** (post-divorce solo retreat, the original Western archetypal demo persona — see codebase)
- [walsh-castiglion.json](walsh-castiglion.json) — **Megan Walsh**, 38, Shaker Heights → 26-night Castiglion sabbatical, **Fallow**. Just left Big Law securities litigation. Midwestern Catholic lapsed — the shape persists as instinct-against-display. Avoid list includes "do not name the length of the stay back to her."
- [rosen-mayakoba.json](rosen-mayakoba.json) — **Mrs. Miriam Rosen**, 68, Scarsdale → 12th winter at Mayakoba Casita 24, **Aftermath / Empty Chair**. Husband Daniel z"l died 14 months ago. 13 stays of history, his presence in every prior note. Every paired default (two cups at 6am, Captain Beto's "private two-person" charter, second pillow) becomes a staff-facing instruction to *un-pair* without naming him.

### Couples marking the long arc (5)
- **Mrs. Liu Lihua** — 47, Hangzhou, **Water** (25-year anniversary, contemplative — the existing East Asian demo anchor)
- [seo-honeymoon.json](seo-honeymoon.json) — **Seo Ji-won + Han Yu-jin**, late-20s Seoul, honeymoon at Sand Hill, **Threshold / 첫 걸음**. 단아 (dan-a) / 정갈 (jeong-gal) restraint. The honeymoon framing itself is the signature avoid — silence is the amenity.
- [inoue-retired.json](inoue-retired.json) — **Inoue Haruki + Setsuko**, early-60s Kanazawa → 5 nights at Sand Hill visiting their Palo Alto biotech-researcher daughter Aoi, **Late Autumn / 晩秋 (banshū)**. Hokuriku craft / 老舗 reserve / Sōgetsu ikebana. "See my daughter without making it into an occasion."
- [ellsworth-and-vaughan.json](ellsworth-and-vaughan.json) — **Daniel Ellsworth + Marcus Vaughan**, late-50s, NY/London — together 27 years, married 2015-07-04 (two weeks after Obergefell). 11th legal-marriage anniversary at Rosewood London → Hôtel de Crillon. **Witnessed / Long-Companionship**. The avoid list bans the entire pride-marketing register and flags "safe" / "welcoming" framing as the insult itself. One handwritten Crillon note on a tray that was already coming.
- [whitlam-castiglion.json](whitlam-castiglion.json) — **Eleanor Whitlam + Tom Brennan**, mid-30s Melbourne — climate finance + marine ecology (Yuku-Baja-Muliku rangers on the GBR). 8 nights at Castiglion. **Reciprocity / Country**. Margaret's new lymphoma diagnosis + the child-decision sit underneath, never named to staff. Avoid list forbids importing Acknowledgment-of-Country into Tuscany.

### Multi-generational families (4)
- [shen-family.json](shen-family.json) — **Mrs. Shen Yuwen**, 60, Suzhou → 4 nights at Rosewood Hong Kong for her 60th 大寿 with husband, daughter, son-in-law, and 3-year-old granddaughter Yaoyao. **Earth / matriarchal grounding**. Wu literati register. Resists being the subject of celebration — staff must route felicitations through husband or daughter; care expressed through environment (seating, half-drawn curtains, whole-fish symbolism).
- [al-zahrani-family.json](al-zahrani-family.json) — **Khalid bin Sulaiman Al Zahrani**, 58, Jeddah → 21-night Castiglion del Bosco summer escape, 11 travelers including his 84-year-old mother (first time joining since 2019). **Harvest / Al-Hasād** — gathering the family while it is still whole. Patriarch-led, matriarch-calibrated (Hanan is the real signal). Observant Islamic practice as household rhythm, not flagged requirement.
- [cardoso-family.json](cardoso-family.json) — **Eduardo Cardoso de Almeida**, 60, São Paulo → 12 nights at Mayakoba for his 60th, 9 travelers across 3 generations. **Warmth / Calor de Casa**. Paulistano industrial — Brazilian-not-Spanish recognition test. Mother Dona Iolanda died 2023; her empty chair is the trip's quiet engine.
- [jhunjhunwala-london.json](jhunjhunwala-london.json) — **Vikramaditya Jhunjhunwala**, 52, Mumbai → 10 nights at Rosewood London with Jain-strict patriarch Bauji, Poddar-Kolkata wife, two elderly parents, Harrow boarding son, and an LSE daughter whose engagement is being quietly negotiated through the trip's Hatton Garden jewelry pickup. **Lineage / Vansh (वंश)** — third-generation Marwari stewardship.
- [de-mericourt-family.json](de-mericourt-family.json) — **Henri-Édouard de Méricourt**, 63, Vosne-Romanée → 6 nights at Sand Hill, US distributor circuit for the Domaine + visiting daughter Marguerite on her SFMOMA residency. Elder son Hugues is co-gérant; 86-year-old mother Madeleine joins for opening night only. **Stewardship / Garde** — responsibility to the inherited *thing* (land, name, wine), not primarily to family continuity.
- [patel-sandhill.json](patel-sandhill.json) — **Arjun Patel**, 41, Edison NJ → 3 nights at Sand Hill with wife Priya and two children. His 14th Sand Hill stay — but the first as a father. Acquisition closed Tuesday. **Inheritance** — second-gen Gujarati-American reckoning across three frames (parents' arrival, his founder identity, his kids' unnamed third register). Tests the "home property" thesis.

## Coverage map

| Profile | Cultural lens | Phase | Party (traveling) | Prior stays | Hero property |
|---|---|---|---|---|---|
| Sarah Anderson | Western archetypal | Phoenix | 1 of 1 | (in codebase) | Sand Hill |
| Walsh | Midwestern Catholic lapsed | Fallow | 1 of 3 | 3 | Castiglion del Bosco |
| Rosen | American Jewish suburban (Reform) | Aftermath / Empty Chair | 1 of 6 | 13 | Mayakoba |
| Liu Lihua | East Asian contemplative | Water | 2 of 2 | (in codebase) | Sand Hill |
| Seo + Han | Contemporary Korean restraint | Threshold / 첫 걸음 | 2 of 5 | 3 | Sand Hill |
| Inoue | Hokuriku Japanese reserve | Late Autumn / 晩秋 | 2 of 3 | 4 | Sand Hill |
| Ellsworth + Vaughan | Transatlantic gay art-world | Witnessed / Long-Companionship | 2 of 5 | 5 | London + Crillon |
| Whitlam + Brennan | Australian cosmopolitan-progressive | Reciprocity / Country | 2 of 6 | 3 | Castiglion del Bosco |
| Shen family | Jiangnan / Wu literati | Earth | 4 of 5 | 6 | Rosewood Hong Kong |
| Al Zahrani family | Hejazi multi-gen | Harvest / Al-Hasād | 11 of 12 | 5 | Castiglion del Bosco |
| Cardoso family | Paulistano industrial warmth | Warmth / Calor de Casa | 9 of 9 | 6 | Mayakoba |
| Jhunjhunwala family | Marwari Bombay industrial | Lineage / Vansh | 5 of 6 | 11 | Rosewood London |
| de Méricourt family | French Burgundy provincial nobility | Stewardship / Garde | 5 of 7 | 6 | Sand Hill |
| Patel | Second-gen Gujarati-American | Inheritance | 4 of 5 | 14 | Sand Hill |

**14 mutually distinct life-phases** so far. The phase axis must stay non-colliding as new profiles are added — when generating a new profile, pick one not on this list.

## Recommended pair for the user-journey demo

The hackathon's 4 decision-moment scenarios (Liu × 2 + Sarah + Patel, per [project-demo-three-pillar](../docs/03-technical-architecture.md) framing) already exercise the engine on quick pivots. For a deeper **user-journey demo** that walks Companion + Operations Theater through a full lifecycle (pre-booking → arrival → mid-stay pivot → Memory Artifact), pick two profiles maximally distant on cultural lens × phase × party shape × emotional valence, but tied together by *restraint as the through-line*.

**Recommendation: Mrs. Miriam Rosen + Mrs. Shen Yuwen.**

| Dimension | Rosen | Shen |
|---|---|---|
| Phase | Aftermath / Empty Chair | Earth / matriarchal grounding |
| Party | 1 traveling | 4 traveling (3-gen) |
| Stay | 10 nights at Mayakoba (12th winter) | 4 nights at Hong Kong (60th 大寿) |
| Lens | American Jewish Reform (Scarsdale) | Suzhou Wu literati |
| Veteran-ness | 13 stays, Casita 24, Ana, Captain Beto | 6 stays, well-known across properties |
| Restraint shape | **Subtraction** — every paired default unpaired without naming him | **Indirection** — felicitations routed through husband + daughter |
| Memory Artifact | The first winter she had to relearn alone | A three-generation gift Yaoyao will hold when she's old |

**Why this pair carries the thesis:** maximum distance on geography, party shape, emotional valence, and what staff are asked to *do* — yet tied by the same engine output (restraint, indirection, what *not* to recommend). The Companion + Theater split-screen makes the asymmetry visible: identical pipeline, two completely different lifecycle arcs, both refusing the obvious move.

**What the demo could show in ~5 min:**
- **Pre-arrival (~75s):** Two pre-booking Companion conversations resolve to two 3-input cards. Action Routing fans two different staff preps — Mayakoba housekeeping told to unpair Casita 24's every standing order; Hong Kong banquet & florals told to design Mrs. Shen's banquet so she is *not* its visual focus.
- **Arrival (~90s):** Identical context ("guest arrived at 6pm, time before dinner") produces diametrically opposite recommendations. Rosen: leave the room, nothing scheduled. Shen: arrange the quiet check-in via the granddaughter Yaoyao, not via Mrs. Shen herself.
- **Mid-stay pivot (~90s):** A weather change or availability shift triggers re-reasoning. Both surfaces re-paint from the same pipeline run, in their respective registers.
- **Memory Artifact (~60s):** Side-by-side artifacts in their cultural mother tongues.

**Alternative pair: Jhunjhunwala + Walsh.** Maximum contrast on *production volume* — high-coordination multi-gen (Bauji's dignity, the engagement, the parents' rhythms) vs. recommend-nothing-well (don't name her stay length, don't pre-schedule food). Pick this pair if the demo audience leans engineering / agent-architecture rather than experience-design.

## Adding more profiles

1. Pick a Rosewood guest segment not yet represented (Latin American outside Brazil, Russian/Eastern European, African affluent, inter-cultural couple, business-only solo, pet-traveling, accessibility-focused) — see [01-product-strategy.md §2](../docs/01-product-strategy.md) and the Phase 2 GTM properties.
2. Choose a life-phase **not** in the coverage map above.
3. Write the JSON conforming to [types.ts](types.ts). Hard constraint: `direct_input.stay_intent` must be one sentence in the guest's own voice expressing *feeling*, never logistics — anything operational lives in `family[]` or `derived_from_history`.
4. Add a row to the coverage map.

## Generation notes

Profiles generated 2026-05-16 in two batches (4 + 8) by parallel Claude subagents. Each agent received the same project context (thesis, dual-interface architecture, restraint principle, schema reference) plus a specific archetype brief with constraints around cultural specificity, named avoidances of stereotype, and the requirement that `notable_moments` be concretely specific (named dishes, named staff, exact requests) rather than generic.
