# Cultural Resonance — Design Language

**Owner:** Design (principal)
**Status:** v0.1 (hackathon foundation, 2026-05-16)
**Scope:** Visual + interaction tokens for the web-app. One language, two density modes — **guest restraint** and **staff cockpit**.

---

## 1. Why these tokens exist

The Cultural Resonance product is built on a single architectural claim: **one engine, two surfaces.** The guest sees ~10% of the reasoning at half the density; the staff sees ~100% at twice the density. If our design tokens cannot express that asymmetry from a shared root, the architecture leaks into ad-hoc CSS and the thesis breaks.

So the tokens are organised in two tiers:

```
PRIMITIVES                  →   the raw palette, type scale, spacing units
  (named by what they are)

SEMANTICS                   →   the meaning of a token in context
  (named by what they do)        surface.canvas, content.primary, accent.signature

DENSITY MODES               →   guest vs. staff — same semantics, different rhythm
  (named by who sees them)       data-density="guest" / data-density="staff"
```

Components consume semantics, never primitives. Density is a single attribute toggle at the surface root.

---

## 2. Rosewood DNA — what the brand actually feels like

Synthesised from Rosewood's public identity, the Sand Hill property, and the existing project docs (`docs/02-experience-design.md` §1, §6).

### Sense of Place — the operative phrase

Rosewood's brand language ("A Sense of Place") rejects the chain-luxury palette of gold-on-marble. Each property is meant to read as if it grew out of its location. For Sand Hill (Menlo Park, CA) that location is:

- **Coastal-fog Mediterranean.** Spanish Colonial Revival architecture, terracotta tile, stucco the colour of weathered parchment, oak shade over decomposed-granite paths.
- **Garden as anchor, not amenity.** Manicured-but-quiet gardens, water features, low planting. Greens are *muted forest and sage*, not emerald.
- **Materials over surfaces.** Linen, raw wood, brushed brass, hand-thrown ceramic. Almost no glossy finishes. No chrome. No black plastic.
- **Light behaviour.** Morning fog → mid-morning gold → long shadows. The brand's printed materials lean on warm neutrals and a single signature dark green that reads almost black at distance.

### Translation rules to digital

| Physical signal | Token expression |
|---|---|
| Parchment stucco, decomposed granite | `surface.canvas` is a warm cream (#F5F1E8), not pure white |
| Deep planted-shade green | `accent.signature` is Discovery Green (#2C4A3E) — used sparingly, like architectural trim |
| Brushed brass / gilt frames | `accent.gilt` (#B5985A) only on hairline dividers, never as fill |
| Ink-and-rice-paper restraint | Text is warm charcoal (#2D2D2D), never `#000` |
| Hairline mullions on doors | `line.hairline` is the *only* border weight — 1px, low-contrast |
| No applied ornament | `radius` is 0 everywhere except input edges; no shadows, no gradients |
| Cormorant book-jacket type | Single serif family across display and body |

The discipline is: **subtract until removing the next element would break meaning, then stop.** Rosewood interiors don't decorate empty walls — they leave them. The product should do the same.

---

## 3. Design principles (operative, not aspirational)

These are the tests a token, component, or layout has to pass.

1. **Restraint reads as warmth.** Whitespace and silence are positive design choices — not absence. Density is earned, not default.
2. **Hairlines over fills.** Boundary by line, not by background change. One pixel, low contrast.
3. **No chrome.** No gradients, no shadows, no rounded pills, no AI sparkles, no progress bars. Form announces itself only through type, line, and space.
4. **Two densities, one voice.** Guest and staff share every colour and every typeface; they differ only in size, leading, and rhythm.
5. **Type does the talking.** All hierarchy, all mood, all "luxury" reads off the typography. Colour is mostly absent on purpose.
6. **Motion as a settling, not a flourish.** Fades in 200ms with a quiet ease curve. No bounce, no slide, no attention-getting.
7. **The signature appears once per view.** Discovery Green is the property's voice — used like a single line of dark green ink in a hand-set letterpress. If it appears twice in a frame, one of them is wrong.

---

## 4. Token system overview

### Files

| File | Purpose |
|---|---|
| [tokens.css](tokens.css) | Canonical implementation. Tailwind v4 `@theme` block + raw CSS custom properties. Drop-in for `web-app/src/app/globals.css`. |
| [tokens.json](tokens.json) | DTCG-format JSON. For Figma (Tokens Studio), Style Dictionary, or any external sync. |
| [preview.html](preview.html) | Standalone visual reference. Open in a browser — no build step. Use this to verify before wiring into the app. |

### Naming convention

```
--<category>-<role>-<variant>
e.g. --color-surface-canvas
     --color-accent-signature-soft
     --space-section-staff
     --type-body-lg
```

Primitives are namespaced under `--primitive-*`; everything a component touches is semantic.

---

## 5. Colour story

A two-tier system. Primitives are tasting notes; semantics are how the kitchen uses them.

### Primitives — the palette

The palette intentionally has no pure white, no pure black, and no saturated colour. Everything is pulled half a step toward warmth.

| Token | Hex | Note |
|---|---|---|
| `--primitive-parchment-50` | `#FBF8F1` | Lightest cream — for elevated surfaces over canvas |
| `--primitive-parchment-100` | `#F5F1E8` | Canvas — primary background, the page itself |
| `--primitive-parchment-200` | `#ECE6D6` | Quiet differentiation; staff panel infill |
| `--primitive-sand-300` | `#D8D2C1` | Hairlines, low-emphasis dividers |
| `--primitive-sand-400` | `#B8AE96` | Disabled text, very quiet meta |
| `--primitive-ink-900` | `#1A1A1A` | Dark-mode canvas / inverse surface |
| `--primitive-ink-800` | `#2D2D2D` | Body text — warm charcoal, never `#000` |
| `--primitive-ink-600` | `#4A4A48` | Secondary body |
| `--primitive-ink-400` | `#6E6B62` | Tertiary / captions |
| `--primitive-discovery-900` | `#1F362C` | Signature green at maximum depth (avatar bg, modal veils) |
| `--primitive-discovery-700` | `#2C4A3E` | **Discovery Green — the Rosewood signature** |
| `--primitive-discovery-300` | `#7A968A` | Soft signature for tags, very rare use |
| `--primitive-gilt-600` | `#B5985A` | Warm gold — hairline emphasis, never fill |
| `--primitive-gilt-300` | `#D9C896` | Lightest gilt — used only on dark surfaces |
| `--primitive-terracotta-600` | `#A56A4C` | Held in reserve. Spanish Colonial nod. Use for one accent per *property*, not per view. |

### Semantics — what components reference

```
surface.canvas         → parchment-100   (the page)
surface.raised         → parchment-50    (a panel sitting on canvas)
surface.sunken         → parchment-200   (a well — staff cockpit infill)
surface.ink            → ink-900         (dark surfaces; modals, footer)
surface.veil           → ink-900 @ 4%    (overlay behind modal; never a shadow)

content.primary        → ink-800         (body)
content.secondary      → ink-600         (supporting copy)
content.tertiary       → ink-400         (captions, micro-labels)
content.disabled       → sand-400
content.inverse        → parchment-50    (on ink surfaces)

accent.signature       → discovery-700   (Discovery Green — one per view)
accent.signature-soft  → discovery-300   (very sparing — tags, status dots)
accent.gilt            → gilt-600        (hairlines on important dividers only)

line.hairline          → sand-300        (1px borders, the default and usually only line)
line.divider           → ink-400 @ 20%   (only for major section breaks)
line.emphasis          → discovery-700   (only on focus rings; one per moment)

state.focus            → discovery-700 @ 30%   (a quiet ring, 2px offset)
state.selected         → parchment-200          (a fill change, never a coloured highlight)
```

### What we did **not** put in the system

- No `success / warning / error / info` palette. The product avoids alert-states; if something goes wrong, the system retreats to silence (the "Is This Welcome?" gate). Validation is handled in prose.
- No saturated brand secondary. Rosewood is a single-signature property; multiple brand colours would dilute it.
- No grey ramp independent of warmth. Every neutral is biased toward the parchment family. A "cool grey" would feel like SaaS chrome.

---

## 6. Typography

### Family

Single family: **Cormorant Garamond** (variable, weights 300–600). Loaded via `next/font/google` in the app.

A single family was a deliberate choice over the more common serif-display + sans-body pairing. Reasons:
- The product is prose-heavy on both surfaces (cultural reasoning paragraphs, memory artifact). A consistent voice across all copy is more important than UI/content separation.
- Cormorant's italics and small caps give us hierarchy without needing a second family.
- It echoes Rosewood's printed brand materials, which lean on a single editorial serif.

Fallbacks: `'Cormorant Garamond', 'Cormorant', 'EB Garamond', Georgia, 'Times New Roman', serif`.

We do **not** ship a monospace stack. Numbers (room numbers, times) use Cormorant's tabular figures via `font-variant-numeric: tabular-nums`.

### Scale (Minor Third, 1.2)

| Token | Size | Leading | Use |
|---|---|---|---|
| `type-display-xl` | 56px | 1.05 | Memory Artifact opening |
| `type-display-lg` | 40px | 1.1 | Marketing hero only |
| `type-heading-xl` | 28px | 1.2 | Major panel titles |
| `type-heading-lg` | 22px | 1.25 | Section titles (Arrange panel headers) |
| `type-heading-md` | 19px | 1.3 | Subsection |
| `type-body-lg` | 18px | 1.6 | **Guest tablet — restful reading** |
| `type-body` | 16px | 1.55 | Staff body baseline |
| `type-body-sm` | 14px | 1.5 | Dense staff rows |
| `type-caption` | 13px | 1.45 | Meta, timestamps |
| `type-micro` | 11px | 1.4 | Uppercase tracked labels (WHY / AVAILABILITY) |

### Weights & treatments

| Token | Weight | Use |
|---|---|---|
| `weight-light` | 300 | Display only |
| `weight-regular` | 400 | All body |
| `weight-medium` | 500 | Inline emphasis (never bold-bold) |
| `weight-semibold` | 600 | Headings, section labels |

| Token | Tracking | Use |
|---|---|---|
| `tracking-tight` | `-0.02em` | Display |
| `tracking-normal` | `0` | Body |
| `tracking-wide` | `0.08em` | Uppercase micro labels (`WHY`, `AVAILABILITY`) |
| `tracking-loose` | `0.16em` | Brand wordmark only |

Italics are reserved for **cultural register switches** (Mandarin phrases, cited art titles) and quoted guest words. Never for emphasis.

---

## 7. Space, shape, motion

### Spacing — 4px base, 8pt grid

Primitives `space-0` … `space-32` map to multiples of 4px. Components reference *semantic* spacing tokens that encode density:

| Semantic token | Guest mode | Staff mode |
|---|---|---|
| `space-canvas-x` | 64px | 32px |
| `space-canvas-y` | 80px | 32px |
| `space-section` | 48px | 20px |
| `space-stack` | 24px | 12px |
| `space-inline` | 16px | 8px |
| `space-hairline-gap` | 12px | 8px |

The density mode toggles all of these at once via a single `data-density` attribute. This is what makes "one engine, two surfaces" tactile in the CSS.

### Shape

`radius-0` (0px) is the default everywhere. `radius-hairline` (2px) exists only for input borders. There is no `radius-md`, `radius-lg`, or `radius-pill` — those would belong to a different brand.

### Elevation

There is no shadow scale. A modal sits on a `surface.veil` (the page tinted 4% with ink-900). That is the whole elevation system.

### Motion

| Token | Value | Use |
|---|---|---|
| `motion-duration-quick` | 120ms | Hover state changes |
| `motion-duration-base` | 200ms | Default fade-in for content (per doc) |
| `motion-duration-settle` | 400ms | Panel re-paint after a context shift |
| `motion-duration-arrive` | 600ms | Memory Artifact reveal |
| `motion-ease-quiet` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default — settles like a leaf |
| `motion-ease-linear` | `linear` | Streaming text appearance only |

Transforms are restricted to `opacity` and 4-pixel `translateY`. No scale, no rotate, no spring.

---

## 8. Density modes — the surface contract

Every page sets a single attribute at the root:

```html
<body data-density="guest"> ... </body>   <!-- in-room tablet, WeChat -->
<body data-density="staff"> ... </body>   <!-- cockpit, arrange panel -->
```

This single switch re-paints:
- All spacing semantics (canvas, section, stack, inline)
- Default body type scale (`type-body-lg` for guest, `type-body-sm` for staff)
- Line-height defaults

It does **not** touch colour or font family. That's the invariant: same voice, different breath.

---

## 9. Wiring into the web-app

Tailwind v4 reads design tokens directly from `@theme` blocks in CSS. To adopt:

1. Replace `web-app/src/app/globals.css` with the contents of [tokens.css](tokens.css) (or `@import` it).
2. In `layout.tsx`, load Cormorant Garamond via `next/font/google` and set the CSS variable `--font-cormorant`.
3. Set `data-density` on `<body>` from the route — `(staff)` segment → `staff`, `(guest)` segment → `guest`.
4. Components reference Tailwind utilities (`bg-surface-canvas`, `text-content-primary`, `border-line-hairline`, `p-canvas`, etc.) — all generated from the tokens.

A worked example (staff Arrange panel header):

```tsx
<section className="bg-surface-raised border border-line-hairline p-section">
  <p className="text-micro tracking-wide text-content-tertiary uppercase">Why</p>
  <p className="text-body mt-stack text-content-primary">
    Anniversary morning. Foggy. Water phase — stillness. Garden quiet until 9.
  </p>
</section>
```

---

## 10. Open questions for the next iteration

These are explicitly deferred past the hackathon — captured here so they don't get re-discovered:

- **Dark mode.** The `ink-900` surface tokens exist but aren't wired. The Memory Artifact in particular may benefit from a dark, full-bleed treatment. Decide after the demo.
- **Mandarin type pairing.** Cormorant covers Latin only. Need a Han-character companion (Source Han Serif TC at weight 400 is the leading candidate) for WeChat surface and bilingual Memory Artifact.
- **Tabular numerals in staff rows.** Cormorant ships them; we need to confirm the Google Fonts variable file exposes the `tnum` feature. If not, swap to `EB Garamond` for staff body.
- **Motion when context shifts.** The cockpit re-reasons live (demo state 4). The current `motion-duration-settle` (400ms) is a starting guess; calibrate against the real LLM streaming cadence during rehearsal.
