// Cached simulation fixtures.
// Hand-authored, narratively true to the user-profiles JSON files
// (Inoue, Al-Zahrani, Rosen, etc.). The live toggle re-runs cells
// through `/api/simulate/run` — these are the safe baseline.

import type {
  ConditionCell,
  CoverageCell,
  CurationGap,
  PerStaySim,
  PivotScenario,
  PropertyGuestRow,
  PropertySim,
  ResourceMeta,
  SurpriseEvent,
  TimeKey,
  TimelineTouchpoint,
  WeatherKey,
} from "./types";

const TIMES: TimeKey[] = ["06:00", "09:00", "12:00", "15:00", "20:00"];
const WEATHERS: WeatherKey[] = ["foggy", "overcast", "clear", "sun", "rain"];

// Helper: build a 5×5 matrix from a sparse override map + a baseline cell.
function buildMatrix(
  baseline: (t: TimeKey, w: WeatherKey) => ConditionCell,
  overrides: Partial<Record<`${TimeKey}|${WeatherKey}`, ConditionCell>>,
): ConditionCell[] {
  const out: ConditionCell[] = [];
  for (const t of TIMES) {
    for (const w of WEATHERS) {
      const k = `${t}|${w}` as `${TimeKey}|${WeatherKey}`;
      out.push(overrides[k] ?? baseline(t, w));
    }
  }
  return out;
}

// -----------------------------------------------------------------------------
// INOUE — Japanese retired couple, banshū / late-autumn register.
// Source: user-profiles/inoue-retired.json
// -----------------------------------------------------------------------------

const inoueMatrix = buildMatrix(
  (t, w) => ({
    time: t,
    weather: w,
    headline: "Hot water at dawn; tray placed; withdraw.",
    detail:
      "Routine governs. Off-menu okayu prepped, in-room delivery, no narration on serving.",
    routed_to: ["in_room_dining", "housekeeping"],
    tone: "baseline",
  }),
  {
    "06:00|foggy": {
      time: "06:00",
      weather: "foggy",
      headline: "Thermos primed. Engawa doors cracked.",
      detail:
        "Setsuko's signal-quiet morning. Garden empty until 9, fog over the oaks reads as gift, not weather.",
      routed_to: ["in_room_dining", "housekeeping", "garden"],
      tone: "shift",
    },
    "06:00|sun": {
      time: "06:00",
      weather: "sun",
      headline: "Linen blind drawn 2/3 before tray.",
      detail:
        "Sun on Sand Hill mornings is rare in late-spring. Soften the threshold so the engawa feeling holds without shade-asking.",
      routed_to: ["in_room_dining", "housekeeping"],
      tone: "shift",
    },
    "09:00|foggy": {
      time: "09:00",
      weather: "foggy",
      headline: "Maple-bench cleared, no escort.",
      detail:
        "Henry Okafor (garden) walks the bench dry by 8:50. No greeting on approach; cue the staff hallway.",
      routed_to: ["garden", "concierge"],
      tone: "shift",
    },
    "12:00|clear": {
      time: "12:00",
      weather: "clear",
      headline: "Aoi arrives 13:00 — host her, not them.",
      detail:
        "Daughter's explicit pre-arrival note: parents are Rosewood's guests, not hers. Bill held; no greeting performance.",
      routed_to: ["concierge", "restaurant"],
      tone: "flag",
    },
    "15:00|foggy": {
      time: "15:00",
      weather: "foggy",
      headline: "Engawa reading hours; thermos refresh.",
      detail:
        "Setsuko reads, Haruki sits. Aurora (housekeeping) refresh by side door, not knock.",
      routed_to: ["housekeeping"],
      tone: "shift",
    },
    "15:00|rain": {
      time: "15:00",
      weather: "rain",
      headline: "Rain — heater on, linen swap.",
      detail:
        "Damp linen offends; quick swap by half-three, towel-warmer to high.",
      routed_to: ["housekeeping"],
      tone: "shift",
    },
    "20:00|clear": {
      time: "20:00",
      weather: "clear",
      headline: "Turndown earlier; futon hands-off.",
      detail:
        "Couple brings own pillow case. Turndown crew opens linen but does not arrange — they prefer to set their own corners.",
      routed_to: ["housekeeping"],
      tone: "shift",
    },
    "20:00|rain": {
      time: "20:00",
      weather: "rain",
      headline: "Same as clear. Routine over weather.",
      detail:
        "This couple's evenings do not move with weather. Resist the urge to add comfort theatre.",
      routed_to: ["housekeeping"],
      tone: "baseline",
    },
  },
);

const inouePivots: PivotScenario[] = [
  {
    id: "inoue-aoi-extra-dinner",
    trigger_message:
      "Setsuko: 'Could Aoi join us a third night, on Wednesday rather than Thursday?'",
    anticipated_response:
      "Adjust without comment. Re-table Madera Wed 19:30; cancel the Thu hold; do not surface that Wed-vs-Thu mattered.",
    routed_to: ["concierge", "restaurant"],
    notes:
      "Bill remains pre-paid. Maître d' brief: do not toast the daughter; greet by name only.",
  },
  {
    id: "inoue-haruki-quiet-day",
    trigger_message: "Setsuko (in writing): 'My husband will stay in today.'",
    anticipated_response:
      "Quiet-day protocol: no housekeeping pass before 14:00, in-room breakfast on the same tray as yesterday, no narration.",
    routed_to: ["housekeeping", "in_room_dining"],
    notes: "Likely jet-lag day or threshold pause. Do not register it as illness.",
  },
  {
    id: "inoue-okayu-resume",
    trigger_message:
      "Setsuko at front desk in low register: 'I'm sorry, the rice this morning was a little firm.'",
    anticipated_response:
      "Already corrected. Tomorrow's okayu cooked thirty minutes, umeboshi from Marco's old supply, served on the small wooden tray. No reply asked of them.",
    routed_to: ["in_room_dining", "kitchen"],
    notes:
      "Apology IS the correction request. Acting on it without making them re-state it is the entire job.",
  },
  {
    id: "inoue-photo-decline",
    trigger_message:
      "Standing offer: 'Would they like a portrait at the Madera terrace with their daughter?'",
    anticipated_response:
      "Decline preempted. Do not raise. If Aoi asks the maître d' independently, route the question to her phone, not the table.",
    routed_to: ["concierge", "restaurant"],
    notes:
      "Photography flagged across four prior stays. Standing avoidance.",
  },
];

const inoueSurprises: SurpriseEvent[] = [
  {
    id: "inoue-haruki-fall",
    event:
      "Haruki slips on the engawa step 06:30 on Day 3 — no injury but startled.",
    impact:
      "Setsuko will not raise this with staff. The signal will be that they take breakfast at the table for the first time.",
    prepared_actions: [
      "Garden team: micro-textured step strips installed Day 2 night, unannounced.",
      "Housekeeping: dry the engawa pre-dawn after any night precipitation.",
      "In-room dining: keep the table set up for two meals after the change without asking.",
    ],
    risk: "high",
  },
  {
    id: "inoue-aoi-news",
    event:
      "Aoi shares at Day 4 dinner that she is engaged — to the partner the parents have not met.",
    impact:
      "The room atmosphere will tilt; Setsuko will not show it; Haruki will go quiet. They will not want the staff to know.",
    prepared_actions: [
      "Maître d' Brassard: do not refill, do not approach for ~7 minutes after the shift.",
      "No dessert tray gesture; let them order or not.",
      "Housekeeping turndown delayed 45 minutes that night.",
    ],
    risk: "medium",
  },
  {
    id: "inoue-temple-ask",
    event:
      "Haruki, unprompted on Day 2 morning: 'Is there a small Buddhist temple nearby?'",
    impact:
      "First active request from him this trip. The ask matters more than the destination.",
    prepared_actions: [
      "Concierge: handwritten card with three options (Stanford's Memorial Church Zen sit, Jikoji in Los Gatos, Berkeley Higashi Honganji) in Japanese and English, left on the side table.",
      "Mei Tanaka (Mandarin/Japanese-speaking concierge) on call if he chooses to ask follow-up.",
      "House car held without time commitment.",
    ],
    risk: "low",
  },
  {
    id: "inoue-flower-arrival",
    event:
      "Aoi sends in-room flowers Day 1 evening as a daughter's gesture, unaware of standing avoidance.",
    impact:
      "Setsuko will quietly ask for them to be moved to the lounge. The misalignment will hang.",
    prepared_actions: [
      "Concierge: discreet message to Aoi pre-arrival noting the standing in-room flower avoidance.",
      "If flowers arrive anyway, housekeeping moves them to the lounge with a note in Japanese: 'Your mother thought the lounge guests might enjoy these.'",
    ],
    risk: "medium",
  },
];

const inoueTimeline: TimelineTouchpoint[] = [
  {
    id: "inoue-tp-1",
    when: "T-3 days",
    anticipated_need: "Pre-arrival quiet-room confirmation",
    prepare:
      "Concierge handwrites confirmation to Setsuko's address (not email) — ground-floor room, garden-adjacent, ground-floor entry.",
    owner: "concierge",
  },
  {
    id: "inoue-tp-2",
    when: "T-1 day",
    anticipated_need: "Marco brief on okayu resume",
    prepare:
      "Kitchen brief: 2018 stay okayu protocol — water-to-rice 8:1, plate the umeboshi separately, deliver to room from Day 1.",
    owner: "kitchen",
  },
  {
    id: "inoue-tp-3",
    when: "Arrival ~16:30",
    anticipated_need: "Check-in choreography",
    prepare:
      "Address Setsuko in writing for key handover; address Haruki by surname only with a quarter-bow; no welcome refreshment offered.",
    owner: "concierge",
  },
  {
    id: "inoue-tp-4",
    when: "Day 1 evening",
    anticipated_need: "Quiet-room protocol active",
    prepare:
      "Suite R210 held silent — no welcome card, no fruit, single stem only if it has been requested (it has not).",
    owner: "housekeeping",
  },
  {
    id: "inoue-tp-5",
    when: "Day 2 06:00",
    anticipated_need: "Hot-water service window",
    prepare:
      "Thermos arrives 05:55, slip-in delivery, no knock. Tray with okayu from Day 2 onward.",
    owner: "in_room_dining",
  },
  {
    id: "inoue-tp-6",
    when: "Day 3 dinner with Aoi",
    anticipated_need: "Dignity of pre-paid hosting",
    prepare:
      "Madera Brassard brief: greet Aoi as the guest's daughter, NOT as the host. No special occasion mark.",
    owner: "restaurant",
  },
  {
    id: "inoue-tp-7",
    when: "Day 5 11:00",
    anticipated_need: "Checkout — no farewell theatre",
    prepare:
      "Bill cleared in advance. House car held but offered in writing only. No staff line, no group sendoff.",
    owner: "concierge",
  },
  {
    id: "inoue-tp-8",
    when: "T+1 week",
    anticipated_need: "Indirect-gratitude window",
    prepare:
      "If a paper note arrives by post (Kanazawa→Sand Hill), translate, log, route to Marco and Aurora by name.",
    owner: "concierge",
  },
];

const inoueSim: PerStaySim = {
  guest_id: "inoue-retired",
  display_name: "Inoue Haruki & Setsuko",
  archetype: "Japanese retired couple · banshū register · daughter visit",
  baseline_summary:
    "Five-night stay; Haruki retired three months ago. Setsuko is the logistical voice; Haruki the slow noticer. They accept exactly two things at every property: hot water at dawn, and one staff member who has learned not to narrate. The trip is also a quiet sounding of what retirement becomes — do not name it.",
  matrix: inoueMatrix,
  pivots: inouePivots,
  surprises: inoueSurprises,
  timeline: inoueTimeline,
};

// -----------------------------------------------------------------------------
// AL-ZAHRANI — Hejazi multi-generational summer escape, 3 weeks.
// Source: user-profiles/al-zahrani-family.json
// -----------------------------------------------------------------------------

const alZahraniMatrix = buildMatrix(
  (t, w) => ({
    time: t,
    weather: w,
    headline: "Family flow open; halal kitchen on prep.",
    detail:
      "Multi-gen choreography: grandmother's rest windows, prayer times respected, no alcohol in any service path.",
    routed_to: ["kitchen", "housekeeping"],
    tone: "baseline",
  }),
  {
    "06:00|clear": {
      time: "06:00",
      weather: "clear",
      headline: "Fajr already passed; quiet on the wing.",
      detail:
        "Grandmother and patriarch likely awake post-Fajr; tea + Arabic coffee on tray. No service knock — leave at the suite door.",
      routed_to: ["in_room_dining", "housekeeping"],
      tone: "shift",
    },
    "09:00|sun": {
      time: "09:00",
      weather: "sun",
      headline: "Children to pool; shade extended.",
      detail:
        "Grandchildren window. Garden umbrellas pre-set; private cabana held for the women. Nanny Marites visible-as-family.",
      routed_to: ["garden", "concierge"],
      tone: "shift",
    },
    "12:00|sun": {
      time: "12:00",
      weather: "sun",
      headline: "Dhuhr window 12:45; service pauses.",
      detail:
        "Prayer mat already in suite; do not page the patriarch between 12:30 and 13:15.",
      routed_to: ["concierge"],
      tone: "flag",
    },
    "15:00|sun": {
      time: "15:00",
      weather: "sun",
      headline: "Asr nearing; cool-drink rounds quiet.",
      detail:
        "Sweet tea, no alcohol on the rolling cart. Sous-chef Patel briefed on dairy/halal sourcing.",
      routed_to: ["in_room_dining", "kitchen"],
      tone: "shift",
    },
    "20:00|clear": {
      time: "20:00",
      weather: "clear",
      headline: "Maghrib at 20:14; dinner staged to follow.",
      detail:
        "Madera or in-suite dining hold from 20:30; family table assembles after evening prayer. No bread basket prior.",
      routed_to: ["restaurant", "in_room_dining"],
      tone: "shift",
    },
    "20:00|rain": {
      time: "20:00",
      weather: "rain",
      headline: "In-suite dining default; family hub set.",
      detail:
        "Adjoining suites' connecting doors propped; one table seats ten with the grandmother at the head, patriarch's seat at her right.",
      routed_to: ["in_room_dining", "housekeeping"],
      tone: "shift",
    },
  },
);

const alZahraniPivots: PivotScenario[] = [
  {
    id: "az-grandmother-rest",
    trigger_message:
      "Daughter-in-law via concierge: 'Grandmother is resting today; we'll skip the family lunch downstairs.'",
    anticipated_response:
      "Family lunch resets to the suite at the same hour, no smaller. Children's plates prepped in the kitchen and walked up. No mention of why.",
    routed_to: ["restaurant", "in_room_dining"],
    notes: "Grandmother's wellness is the household's hidden axis; the family will speak around it.",
  },
  {
    id: "az-quranic-recitation",
    trigger_message:
      "Patriarch asks (Arabic, via interpreter): 'Is there somewhere I might recite aloud for thirty minutes without being heard?'",
    anticipated_response:
      "Suite R210 (the quiet-room workaround) held with prayer mat; concierge confirms the corridor is staff-only between his start and end times.",
    routed_to: ["concierge", "housekeeping"],
    notes: "GAP exposed: no real designated meditation/prayer room. Workaround must hold.",
  },
  {
    id: "az-toddler-ill",
    trigger_message:
      "Marites (nanny) at 22:00: 'The little one has a fever.'",
    anticipated_response:
      "On-call physician contacted, hospital-grade thermometer brought up, plain rice cooked at the kitchen if requested. Marites addressed by name, not 'the nanny'.",
    routed_to: ["kitchen", "concierge", "housekeeping"],
    notes: "Treat caregivers as family-tier guests; flagged across the file.",
  },
  {
    id: "az-bachelor-son",
    trigger_message:
      "Younger son returning at 02:00 after dinner in San Francisco.",
    anticipated_response:
      "Valet on duty quietly; no logging on the patriarch-visible report. Sleep-floor protocol — no calls to the family suite line.",
    routed_to: ["valet", "concierge"],
    notes: "Sons' evenings remain private to the patriarch; do not surface.",
  },
];

const alZahraniSurprises: SurpriseEvent[] = [
  {
    id: "az-grandmother-immobility",
    event: "Grandmother becomes unable to descend to the garden after Day 4.",
    impact:
      "The whole household's center of gravity rises to her suite. Public-area planning must pivot indoors.",
    prepared_actions: [
      "Connecting-door reconfiguration: 3 suites linked into a family floor.",
      "In-suite kitchen station set up with sous-chef Patel walking the menu daily.",
      "Garden experiences offered in writing only, with 'or we can bring it up' framing.",
    ],
    risk: "high",
  },
  {
    id: "az-extended-family-arrival",
    event:
      "Two additional cousins fly in unannounced on Day 9 and need rooms.",
    impact:
      "The patriarch will not absorb the disruption visibly. The household will, quietly.",
    prepared_actions: [
      "Reservations holds: two same-floor suites on permanent block during all Al-Zahrani stays.",
      "Halal welcome amenity ready in storage, not produced from scratch.",
      "Concierge: 'These rooms were always available' — never frame as scrambling.",
    ],
    risk: "medium",
  },
  {
    id: "az-ramadan-overlap",
    event:
      "Stay window overlaps a moveable observance week (not Ramadan this year, but Hijri Eid).",
    impact:
      "Meal timing flips entirely. Kitchen and restaurant must operate on a different clock for the family without telling staff this is unusual.",
    prepared_actions: [
      "Standing protocol document for the Al-Zahrani household timed against the Hijri calendar.",
      "Madera brief: family will likely dine in-suite all week of the observance.",
      "No public reference to the observance in signage or staff-greeting scripts.",
    ],
    risk: "low",
  },
];

const alZahraniTimeline: TimelineTouchpoint[] = [
  {
    id: "az-tp-1",
    when: "T-2 weeks",
    anticipated_need: "Suite block, halal sourcing chain, prayer-time table",
    prepare:
      "Reservations holds 4 adjoining suites; kitchen confirms halal supplier in advance; prayer times for the full stay window printed in suite, in Arabic + English.",
    owner: "concierge",
  },
  {
    id: "az-tp-2",
    when: "Arrival 19:00",
    anticipated_need: "Patriarch-led check-in without script",
    prepare:
      "Greet patriarch by family name first, then matriarch. Marites (nanny) greeted by name as part of family entry. Children offered juice, no alcohol anywhere in the welcome path.",
    owner: "concierge",
  },
  {
    id: "az-tp-3",
    when: "Day 1 morning",
    anticipated_need: "Prayer rugs + qibla orientation confirmed",
    prepare:
      "Housekeeping pre-places clean rugs facing Mecca in each suite; do not announce — leave a single-line bilingual note.",
    owner: "housekeeping",
  },
  {
    id: "az-tp-4",
    when: "Day 3 evening",
    anticipated_need: "Family dinner reset to suite (likely)",
    prepare:
      "Madera holds a 10-top, but in-suite contingency prepped from 17:00. Switch executes silently up to 19:30.",
    owner: "restaurant",
  },
  {
    id: "az-tp-5",
    when: "Mid-stay (Day 10)",
    anticipated_need: "Quiet rebuild — patriarch will fade from public spaces",
    prepare:
      "Service shifts to door-drop deliveries; concierge handles all by daughter-in-law, not patriarch.",
    owner: "concierge",
  },
  {
    id: "az-tp-6",
    when: "Departure (Day 21)",
    anticipated_need: "Grandmother first; no farewell line for staff",
    prepare:
      "Wheelchair pre-staged at the suite door, not in the lobby. House car holds 25 minutes silently. Children's juice boxes packed for the road.",
    owner: "valet",
  },
];

const alZahraniSim: PerStaySim = {
  guest_id: "al-zahrani-family",
  display_name: "Al Zahrani household (three weeks)",
  archetype: "Hejazi multi-generational · patriarch-led · halal · prayer-spine",
  baseline_summary:
    "Twenty-one nights, four adjoining suites, eleven family members across three generations. The matriarch is the household's hidden axis. Islamic practice integrated quietly — alcohol is not a special exception, it is simply not present. The whole stay is choreographed around prayer windows and the grandmother's energy.",
  matrix: alZahraniMatrix,
  pivots: alZahraniPivots,
  surprises: alZahraniSurprises,
  timeline: alZahraniTimeline,
};

// -----------------------------------------------------------------------------
// ROSEN — widowed solo returner, first stay alone.
// Source: user-profiles/rosen-mayakoba.json (adapted to Sand Hill)
// -----------------------------------------------------------------------------

const rosenMatrix = buildMatrix(
  (t, w) => ({
    time: t,
    weather: w,
    headline: "Casita-rhythm; no welcome continuity.",
    detail:
      "Twelfth winter, first without him. Suppress every familiarity-greeting script; she returns to find out if she can still love this place alone.",
    routed_to: ["housekeeping", "concierge"],
    tone: "baseline",
  }),
  {
    "06:00|foggy": {
      time: "06:00",
      weather: "foggy",
      headline: "Coffee is a question, not a standing order.",
      detail:
        "Two-cup default for twelve years. Today: one cup, with a small written note: 'If you'd like the second, we'll bring it.'",
      routed_to: ["in_room_dining"],
      tone: "flag",
    },
    "09:00|clear": {
      time: "09:00",
      weather: "clear",
      headline: "Garden bench — his bench — left available.",
      detail:
        "Do not move it. Do not assign it to others this week. Do not mention.",
      routed_to: ["garden"],
      tone: "flag",
    },
    "12:00|overcast": {
      time: "12:00",
      weather: "overcast",
      headline: "Friday — candles in the room by 17:00.",
      detail:
        "Two candles, plain matches, the same brass holders housekeeping logged on the 2024 stay. No 'Shabbat shalom' from staff who didn't say it before.",
      routed_to: ["housekeeping"],
      tone: "shift",
    },
    "20:00|clear": {
      time: "20:00",
      weather: "clear",
      headline: "Dinner alone in the casita — set for one.",
      detail:
        "The second placemat is gone. No bread basket served until requested.",
      routed_to: ["in_room_dining"],
      tone: "flag",
    },
    "20:00|rain": {
      time: "20:00",
      weather: "rain",
      headline: "Fireplace lit by housekeeping, unannounced.",
      detail:
        "Rain reaches her in the chest, not the mind. Warmth set silently; turndown skipped if light is on past 22:30.",
      routed_to: ["housekeeping"],
      tone: "shift",
    },
  },
);

const rosenPivots: PivotScenario[] = [
  {
    id: "rosen-name-him",
    trigger_message:
      "Mrs. Rosen, unprompted, mid-conversation with concierge: 'Marvin used to take that walk every morning.'",
    anticipated_response:
      "Follow her lead — use his name back to her, once, naturally. Do not continue past her cue.",
    routed_to: ["concierge"],
    notes:
      "She has named him. The avoidance lifts only as far as she opens it.",
  },
  {
    id: "rosen-photo-decline",
    trigger_message:
      "Staff impulse: hold a print of her and Marvin from a prior stay 'just in case she wants it.'",
    anticipated_response:
      "Do not. Hold the print in the file. If she asks for memorabilia, retrieve. Otherwise it does not exist this week.",
    routed_to: ["concierge"],
    notes:
      "Surprise mementos collapse the choice she came here to make.",
  },
  {
    id: "rosen-second-cup",
    trigger_message:
      "On Day 3, after declining the second cup twice: 'Yes, actually, please bring the second.'",
    anticipated_response:
      "Bring it. Tomorrow's note reads: 'Two cups, as before? Or shall we ask each morning?'",
    routed_to: ["in_room_dining"],
    notes: "Standing orders are now decisions. Let her choose the cadence back.",
  },
  {
    id: "rosen-leave-early",
    trigger_message:
      "Day 4 evening: 'I think I'd like to head home a day early.'",
    anticipated_response:
      "Yes. Flight change handled, departure car at her preferred hour, no flag in the file marking the stay as 'cut short'.",
    routed_to: ["concierge", "valet"],
    notes:
      "Honoring the choice is the entire answer. Do not interview the decision.",
  },
];

const rosenSurprises: SurpriseEvent[] = [
  {
    id: "rosen-yahrzeit",
    event:
      "A staff member discovers the stay window overlaps Marvin's yahrzeit (death anniversary).",
    impact:
      "She has not raised it. The acknowledgment is not ours to make. But the day's choreography may need to bend silently.",
    prepared_actions: [
      "Housekeeping: candles already in the suite, do not light unless she does.",
      "Restaurant: no Shabbat-themed flourish on that evening's meal, even if it falls on a Friday.",
      "Concierge: gentle availability of a quiet drive if she wants it, in writing.",
    ],
    risk: "high",
  },
  {
    id: "rosen-meeting-old-couple",
    event:
      "She runs into a couple who recognize her from past stays; awkward 'Where's Marvin?' moment.",
    impact:
      "The lobby team is the first to know.",
    prepared_actions: [
      "Concierge intercepts gently — offers her a private path back to the casita.",
      "Do not commiserate. Do not narrate. Open the door, hand her the room key, withdraw.",
    ],
    risk: "medium",
  },
  {
    id: "rosen-family-call",
    event:
      "Her daughter calls the front desk asking how Mom is doing.",
    impact:
      "Family wants reassurance. Mrs. Rosen wants to be exactly here, not surveilled.",
    prepared_actions: [
      "Standard reply: 'She's well. I'll let her know you called.' No detail.",
      "Pass message in writing on the side table, not by phone in the casita.",
    ],
    risk: "low",
  },
];

const rosenTimeline: TimelineTouchpoint[] = [
  {
    id: "rosen-tp-1",
    when: "T-1 week",
    anticipated_need: "Update the standing orders silently",
    prepare:
      "Remove second coffee cup from the standing breakfast. Remove second pillow set from the casita base linen. Remove Marvin's seat preference from Madera.",
    owner: "housekeeping",
  },
  {
    id: "rosen-tp-2",
    when: "Arrival",
    anticipated_need: "No 'welcome back' theatre",
    prepare:
      "Greet by name, once. Hand the key, walk her to the casita with one sentence about the foggy week ahead. No reference to twelve prior winters.",
    owner: "concierge",
  },
  {
    id: "rosen-tp-3",
    when: "Day 1 evening",
    anticipated_need: "Friday-night candle protocol",
    prepare:
      "Candles + matches placed; brass holders the same as 2024. No greeting. No staff sighting near the casita between 17:30 and 19:00.",
    owner: "housekeeping",
  },
  {
    id: "rosen-tp-4",
    when: "Day 3 (likely)",
    anticipated_need: "She may sit on his bench",
    prepare:
      "Bench available, side path clear. Garden team rotates other guests away from that corner silently.",
    owner: "garden",
  },
  {
    id: "rosen-tp-5",
    when: "Day 5",
    anticipated_need: "Mid-stay re-check on the standing-orders question",
    prepare:
      "Concierge offers, in writing: 'Shall we hold the morning rhythm as-is, or would you like to change anything?'",
    owner: "concierge",
  },
  {
    id: "rosen-tp-6",
    when: "Departure",
    anticipated_need: "No farewell line, no 'see you next year'",
    prepare:
      "Car at her hour. The phrase 'we hope to see you' is retired from the script. If she returns, that will be a fresh conversation.",
    owner: "valet",
  },
];

const rosenSim: PerStaySim = {
  guest_id: "rosen-solo",
  display_name: "Mrs. Miriam Rosen (solo return)",
  archetype: "Widowed solo returner · twelfth winter · first without him",
  baseline_summary:
    "Six nights. Continuity scripts are the wound. Standing orders are now questions, not instructions. The whole stay is a sounding of whether she can still love this place on her own — the property's job is to neither pretend nothing has changed nor make a ceremony of what did.",
  matrix: rosenMatrix,
  pivots: rosenPivots,
  surprises: rosenSurprises,
  timeline: rosenTimeline,
};

// -----------------------------------------------------------------------------
// Export per-stay sims
// -----------------------------------------------------------------------------

export const PER_STAY_SIMS: PerStaySim[] = [inoueSim, alZahraniSim, rosenSim];

export function getPerStaySim(guestId: string): PerStaySim {
  return PER_STAY_SIMS.find((s) => s.guest_id === guestId) ?? PER_STAY_SIMS[0];
}

// -----------------------------------------------------------------------------
// PROPERTY-WIDE — coverage heatmap over a VIP cohort.
// -----------------------------------------------------------------------------

const RESOURCES: ResourceMeta[] = [
  {
    key: "madera",
    label: "Madera",
    blurb: "Signature restaurant · wood-fire · sommelier-led",
  },
  {
    key: "in_room_dining",
    label: "In-room dining",
    blurb: "Terrace setup, tea program, off-menu accommodations",
  },
  {
    key: "garden",
    label: "Garden",
    blurb: "Oak-shaded grounds, water feature, herb beds",
  },
  {
    key: "spa",
    label: "Spa",
    blurb: "Sense of Place — couples/solo, herb aromatherapy",
  },
  {
    key: "pool",
    label: "Pool",
    blurb: "Family pool, cabanas, summer-default",
  },
  {
    key: "library_quiet",
    label: "Library / Quiet",
    blurb: "Reading corner, fireside, no permanent quiet room",
  },
  {
    key: "prayer_meditation",
    label: "Prayer / Meditation",
    blurb: "GAP — workaround via held suite, not advertised",
  },
  {
    key: "tea_program",
    label: "Tea program",
    blurb: "Longjing, pu-erh, sencha, gyokuro · gaiwan + pot service",
  },
  {
    key: "concierge_local",
    label: "Concierge local",
    blurb: "Cantor, Filoli, Stanford, coastal, hike routing",
  },
  {
    key: "transport_valet",
    label: "Transport",
    blurb: "House cars, child seats, SFO/SJC, late return",
  },
];

const GUESTS: PropertyGuestRow[] = [
  {
    id: "inoue-retired",
    display_name: "Inoue Haruki & Setsuko",
    archetype_short: "Japanese retired · banshū",
    flag: "ma · off-menu okayu · no touch",
  },
  {
    id: "al-zahrani-family",
    display_name: "Al Zahrani household",
    archetype_short: "Hejazi multi-gen · 3 weeks",
    flag: "halal · prayer-spine · matriarch",
  },
  {
    id: "rosen-solo",
    display_name: "Mrs. Miriam Rosen",
    archetype_short: "Widowed solo · first alone",
    flag: "candle Fri · standing orders are questions",
  },
  {
    id: "shen-family",
    display_name: "Shen Yuwen 三代",
    archetype_short: "Suzhou matriarch · 60th",
    flag: "Wu literati · low-key · no celebrant frame",
  },
  {
    id: "patel-sandhill",
    display_name: "Arjun & Priya Patel",
    archetype_short: "Founder family · post-acquisition",
    flag: "no-celebration framing · no alcohol",
  },
  {
    id: "ellsworth-vaughan",
    display_name: "Ellsworth & Vaughan",
    archetype_short: "Art-world long-partnered",
    flag: "no pride aesthetics · 'Mr. & Mr.' once max",
  },
  {
    id: "jhunjhunwala-london",
    display_name: "Jhunjhunwala household",
    archetype_short: "Marwari industrialist · 3 gens",
    flag: "no alcohol · vansh register",
  },
  {
    id: "seo-honeymoon",
    display_name: "Seo & Han (honeymoon)",
    archetype_short: "Korean dan-a · quiet luxury",
    flag: "no honeymoon framing · no surprise",
  },
  {
    id: "walsh-castiglion",
    display_name: "Megan Walsh",
    archetype_short: "Sabbatical solo · fallow",
    flag: "do not curate · let her sit",
  },
  {
    id: "de-mericourt-family",
    display_name: "de Méricourt family",
    archetype_short: "Bourgogne vineyard heirs",
    flag: "treat as peers in wine · no welcome bottle",
  },
];

// Coverage cells — keyed by guest × resource, hand-curated for narrative truth.
function cell(
  guest_id: string,
  resource: CoverageCell["resource"],
  fit: CoverageCell["fit"],
  note: string,
): CoverageCell {
  return { guest_id, resource, fit, note };
}

const CELLS: CoverageCell[] = [
  // Inoue
  cell("inoue-retired", "madera", "neutral", "Used for daughter dinner; otherwise in-room."),
  cell("inoue-retired", "in_room_dining", "strong", "Marco's off-menu okayu lineage; tray-and-withdraw."),
  cell("inoue-retired", "garden", "strong", "Maple-bench, 7–9am, no escort."),
  cell("inoue-retired", "spa", "conflict", "No-touch standing avoidance across four stays."),
  cell("inoue-retired", "pool", "neutral", "Not used."),
  cell("inoue-retired", "library_quiet", "soft_gap", "No fixed quiet room; engawa-feeling held in suite."),
  cell("inoue-retired", "prayer_meditation", "soft_gap", "Buddhist quiet practice — meditation space not defined."),
  cell("inoue-retired", "tea_program", "strong", "Sencha + gyokuro + own chawan; staff non-narration."),
  cell("inoue-retired", "concierge_local", "neutral", "Self-routes; Mei Tanaka on standby."),
  cell("inoue-retired", "transport_valet", "neutral", "House car to Stanford if Aoi asks."),

  // Al-Zahrani
  cell("al-zahrani-family", "madera", "soft_gap", "Halal sourcing needs chef pre-brief; alcohol pairings dropped."),
  cell("al-zahrani-family", "in_room_dining", "strong", "Family-hub setup, adjoining-door suites, sweet-tea cart."),
  cell("al-zahrani-family", "garden", "strong", "Private cabana, women's-only shade, midday flow protected."),
  cell("al-zahrani-family", "spa", "soft_gap", "Same-sex therapist required; honored but not standardized."),
  cell("al-zahrani-family", "pool", "strong", "Children's window 9–11; cabana flagged Al Zahrani for 3 weeks."),
  cell("al-zahrani-family", "library_quiet", "neutral", "Used by patriarch evenings."),
  cell("al-zahrani-family", "prayer_meditation", "hard_gap", "No designated prayer room. Workaround suite R210."),
  cell("al-zahrani-family", "tea_program", "neutral", "Arabic coffee not in tea menu — supplied off-program."),
  cell("al-zahrani-family", "concierge_local", "strong", "Long-stay routing; Bay Area Saudi family network."),
  cell("al-zahrani-family", "transport_valet", "strong", "Multiple drivers, child seats, late returns no-log."),

  // Rosen
  cell("rosen-solo", "madera", "soft_gap", "Solo dinner; second placemat removed; no host-side fuss."),
  cell("rosen-solo", "in_room_dining", "strong", "Single-cup default; Shabbat candle protocol."),
  cell("rosen-solo", "garden", "strong", "Marvin's bench protected; no reassignment."),
  cell("rosen-solo", "spa", "neutral", "Standing decline three properties; do not offer."),
  cell("rosen-solo", "pool", "neutral", "Not used."),
  cell("rosen-solo", "library_quiet", "neutral", "Fireside reading; rain-night protocol."),
  cell("rosen-solo", "prayer_meditation", "soft_gap", "Friday-night candles handled in suite — fine, but informal."),
  cell("rosen-solo", "tea_program", "neutral", "Loose-leaf English breakfast, single pot."),
  cell("rosen-solo", "concierge_local", "neutral", "Memorial-quiet drives; coastal."),
  cell("rosen-solo", "transport_valet", "strong", "Same driver as 12 winters where possible."),

  // Shen
  cell("shen-family", "madera", "soft_gap", "Three-gen seating; no birthday production; quiet courses."),
  cell("shen-family", "in_room_dining", "strong", "Suite as family living room; grandchildren managed."),
  cell("shen-family", "garden", "strong", "Wu-literati register reads garden as scroll."),
  cell("shen-family", "spa", "neutral", "Daughter only."),
  cell("shen-family", "pool", "soft_gap", "Grandchildren want it; matriarch never."),
  cell("shen-family", "library_quiet", "neutral", "Matriarch reads; staff not seen."),
  cell("shen-family", "prayer_meditation", "soft_gap", "Quiet sit on garden, ad hoc."),
  cell("shen-family", "tea_program", "strong", "Longjing pre-Qingming; gaiwan service; staff withdraws."),
  cell("shen-family", "concierge_local", "neutral", "Cantor preferred over Filoli."),
  cell("shen-family", "transport_valet", "strong", "Two-car convoy for the cohort."),

  // Patel
  cell("patel-sandhill", "madera", "neutral", "Family dinner; no toast, no celebration framing."),
  cell("patel-sandhill", "in_room_dining", "strong", "Off-menu Jain accommodations from sous-chef Patel."),
  cell("patel-sandhill", "garden", "strong", "Children's morning, no portraiture."),
  cell("patel-sandhill", "spa", "neutral", "Priya may, Arjun won't."),
  cell("patel-sandhill", "pool", "strong", "Saturday morning is the off-ramp."),
  cell("patel-sandhill", "library_quiet", "neutral", "Used; fireside."),
  cell("patel-sandhill", "prayer_meditation", "soft_gap", "Mid-day pause culturally, not religiously, framed."),
  cell("patel-sandhill", "tea_program", "neutral", "Masala chai stocked; not in menu."),
  cell("patel-sandhill", "concierge_local", "strong", "Stanford regular; Coupa."),
  cell("patel-sandhill", "transport_valet", "strong", "Tesla-trade norms; same driver where possible."),

  // Ellsworth & Vaughan
  cell("ellsworth-vaughan", "madera", "strong", "Wine peers; sommelier-as-captain."),
  cell("ellsworth-vaughan", "in_room_dining", "strong", "Anniversary dinner without anniversary frame."),
  cell("ellsworth-vaughan", "garden", "neutral", "Used; walks."),
  cell("ellsworth-vaughan", "spa", "neutral", "Solo treatments; same-sex therapist offered both, taken once."),
  cell("ellsworth-vaughan", "pool", "neutral", "Not used."),
  cell("ellsworth-vaughan", "library_quiet", "strong", "Catalogue reading; in-house art context."),
  cell("ellsworth-vaughan", "prayer_meditation", "neutral", "Not relevant."),
  cell("ellsworth-vaughan", "tea_program", "neutral", "Black tea afternoon, gilded English register."),
  cell("ellsworth-vaughan", "concierge_local", "strong", "Anderson Collection, SFMOMA route."),
  cell("ellsworth-vaughan", "transport_valet", "strong", "Single house car for the week."),

  // Jhunjhunwala
  cell("jhunjhunwala-london", "madera", "soft_gap", "Vegetarian standing protocol; alcohol stripped."),
  cell("jhunjhunwala-london", "in_room_dining", "strong", "Bauji's plate in suite; family eats around him."),
  cell("jhunjhunwala-london", "garden", "neutral", "Evening walks only."),
  cell("jhunjhunwala-london", "spa", "neutral", "Daughter-in-law only."),
  cell("jhunjhunwala-london", "pool", "neutral", "Grandchildren; midday."),
  cell("jhunjhunwala-london", "library_quiet", "strong", "Bauji's evening reading corner held nightly."),
  cell("jhunjhunwala-london", "prayer_meditation", "soft_gap", "Jain practice — same workaround suite."),
  cell("jhunjhunwala-london", "tea_program", "soft_gap", "Masala chai outside the tea-program register."),
  cell("jhunjhunwala-london", "concierge_local", "strong", "Board roadshow routing + family."),
  cell("jhunjhunwala-london", "transport_valet", "strong", "Two cars: one Vikramaditya, one Bauji."),

  // Seo & Han
  cell("seo-honeymoon", "madera", "neutral", "Quiet two-top; no honeymoon flourish."),
  cell("seo-honeymoon", "in_room_dining", "strong", "Two breakfasts, no surprise; dan-a register."),
  cell("seo-honeymoon", "garden", "strong", "Morning walks; no escort."),
  cell("seo-honeymoon", "spa", "neutral", "Possibly Day 4 — solo; not coupled treatment."),
  cell("seo-honeymoon", "pool", "neutral", "Not used."),
  cell("seo-honeymoon", "library_quiet", "neutral", "Used."),
  cell("seo-honeymoon", "prayer_meditation", "neutral", "Not relevant."),
  cell("seo-honeymoon", "tea_program", "soft_gap", "Korean barley tea / sungnyung not stocked."),
  cell("seo-honeymoon", "concierge_local", "strong", "Quiet Saturday morning at Cantor."),
  cell("seo-honeymoon", "transport_valet", "neutral", "House car to wine country declined."),

  // Walsh
  cell("walsh-castiglion", "madera", "neutral", "Bar-seat dinner, novel in hand."),
  cell("walsh-castiglion", "in_room_dining", "strong", "Toast and coffee; no curation."),
  cell("walsh-castiglion", "garden", "strong", "Long sit. Do not interrupt."),
  cell("walsh-castiglion", "spa", "conflict", "Three properties of decline. Do not offer."),
  cell("walsh-castiglion", "pool", "neutral", "Not used."),
  cell("walsh-castiglion", "library_quiet", "strong", "Fallow phase. Books, rain, fire."),
  cell("walsh-castiglion", "prayer_meditation", "soft_gap", "Lapsed Catholic — silent register, not a service."),
  cell("walsh-castiglion", "tea_program", "neutral", "Black tea, no fuss."),
  cell("walsh-castiglion", "concierge_local", "soft_gap", "Asked once. Don't ask again."),
  cell("walsh-castiglion", "transport_valet", "neutral", "Self-drive."),

  // de Méricourt
  cell("de-mericourt-family", "madera", "strong", "Sommelier briefed: family is peer, not audience."),
  cell("de-mericourt-family", "in_room_dining", "neutral", "Used for breakfasts."),
  cell("de-mericourt-family", "garden", "strong", "Stewardship register reads landscape."),
  cell("de-mericourt-family", "spa", "neutral", "Daughter only."),
  cell("de-mericourt-family", "pool", "neutral", "Children once."),
  cell("de-mericourt-family", "library_quiet", "neutral", "Father reads at fireside."),
  cell("de-mericourt-family", "prayer_meditation", "neutral", "Not relevant."),
  cell("de-mericourt-family", "tea_program", "soft_gap", "Tisane register absent — verveine, tilleul not stocked."),
  cell("de-mericourt-family", "concierge_local", "neutral", "Cars routed wine country with care."),
  cell("de-mericourt-family", "transport_valet", "strong", "Patriarch's car preferences held."),
];

const GAPS: CurationGap[] = [
  {
    id: "gap-prayer-room",
    title: "Designated prayer / meditation room",
    affected_guests: [
      "Al Zahrani household",
      "Jhunjhunwala household",
      "Inoue Haruki & Setsuko",
      "Shen Yuwen 三代",
      "Mrs. Miriam Rosen",
    ],
    resource: "prayer_meditation",
    severity: "blocking",
    recommendation:
      "Convert the underused east-wing parlor into a permanent quiet-room. Plain wool rug, qibla orientation marked discreetly, no signage. Daily linen reset; reserve windows by suite, not by name.",
  },
  {
    id: "gap-tea-program-breadth",
    title: "Tea program is West-Lake-centric",
    affected_guests: [
      "Jhunjhunwala household",
      "Seo & Han (honeymoon)",
      "Al Zahrani household",
      "de Méricourt family",
    ],
    resource: "tea_program",
    severity: "degrading",
    recommendation:
      "Stock and brief on: masala chai (loose), Korean barley/sungnyung, Arabic coffee with cardamom, French tisanes (verveine, tilleul). Move from 'tea menu' to 'beverage register by guest archetype.'",
  },
  {
    id: "gap-halal-sourcing",
    title: "Madera halal sourcing protocol",
    affected_guests: ["Al Zahrani household", "Jhunjhunwala household (vegetarian-adjacent)"],
    resource: "madera",
    severity: "degrading",
    recommendation:
      "Standing halal sourcing chain with two-day notice. Sommelier brief: alcohol pairings replaced silently with sparkling-tea/mocktail register on flagged household stays — not asked at the table.",
  },
  {
    id: "gap-spa-touch-defaults",
    title: "Spa default assumes touch is welcome",
    affected_guests: ["Inoue Haruki & Setsuko", "Megan Walsh", "Mrs. Miriam Rosen"],
    resource: "spa",
    severity: "minor",
    recommendation:
      "Remove spa from the welcome amenities path for flagged guests. Replace with garden access window and a quiet-room key. Touch is invited, not assumed.",
  },
  {
    id: "gap-celebration-defaults",
    title: "Celebration scripts misalign with restraint cultures",
    affected_guests: [
      "Inoue Haruki & Setsuko",
      "Shen Yuwen 三代",
      "Arjun & Priya Patel",
      "Ellsworth & Vaughan",
      "Seo & Han (honeymoon)",
    ],
    resource: "cross_cutting",
    severity: "blocking",
    recommendation:
      "Retire the 'celebrate-with-us' default: no welcome champagne, no signage, no portraiture offers. Replace with a single hand-written line on plain card, addressed to the listed guest, signed by the lead concierge.",
  },
  {
    id: "gap-continuity-script",
    title: "'Welcome back!' script for returners",
    affected_guests: ["Mrs. Miriam Rosen", "de Méricourt family", "Arjun & Priya Patel"],
    resource: "cross_cutting",
    severity: "degrading",
    recommendation:
      "Continuity is the wound, not the comfort. Strip 'welcome back' from arrival scripts; default to a quieter 'we have your room ready.' Add a re-check note for returners traveling alone for the first time.",
  },
  {
    id: "gap-pool-shade",
    title: "Pool: family-vs-women's-shade conflict on busy summers",
    affected_guests: ["Al Zahrani household", "Shen Yuwen 三代"],
    resource: "pool",
    severity: "minor",
    recommendation:
      "Designate two cabanas as 'flexible private' — pre-screened, retractable canvas, bookable by household. Default attire signage removed; staff brief 'whatever's worn is correct.'",
  },
  {
    id: "gap-library-quiet",
    title: "No actual library / fixed quiet room",
    affected_guests: [
      "Inoue Haruki & Setsuko",
      "Megan Walsh",
      "Ellsworth & Vaughan",
      "Jhunjhunwala household",
    ],
    resource: "library_quiet",
    severity: "degrading",
    recommendation:
      "Establish a permanent room with no Wi-Fi password posted, low light, deep chairs, English/Japanese/French/Mandarin paperback shelf curated by guest archetype. Staff: not seen.",
  },
];

export const PROPERTY_SIM: PropertySim = {
  property_name: "Rosewood Sand Hill",
  cohort_size: GUESTS.length,
  date_window: "Late May – Early June 2026 (overlapping stays)",
  guests: GUESTS,
  resources: RESOURCES,
  cells: CELLS,
  gaps: GAPS,
};
