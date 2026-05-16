// scripts/smoke-1a.ts
// Run with: pnpm exec tsx scripts/smoke-1a.ts
//
// Quick offline-friendly smoke tests for three representative agents.
// Verifies: (1) JSON parses, (2) required shape keys exist.
// Loads .env.local so ANTHROPIC_API_KEY is available outside Next.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// --- Minimal .env.local loader (avoid adding dotenv as a dep) -----------
function loadDotenv(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
loadDotenv();

// --- Imports after env load ---------------------------------------------
import * as intake from "@/lib/agents/intake";
import * as profileHub from "@/lib/agents/profile-hub";
import * as culturalReasoning from "@/lib/agents/cultural-reasoning";
import { liuProfile } from "@/lib/fixtures/personas/liu";
import { sandHill } from "@/lib/fixtures/properties/sand-hill";
import type { PropertyExperienceOutput } from "@/lib/types";

interface SmokeResult {
  name: string;
  ok: boolean;
  detail: string;
}

async function safe<T>(
  name: string,
  fn: () => Promise<T>,
  validate: (out: T) => string | null,
): Promise<SmokeResult> {
  try {
    const out = await fn();
    const problem = validate(out);
    if (problem) return { name, ok: false, detail: problem };
    return {
      name,
      ok: true,
      detail: "ok — " + JSON.stringify(out).slice(0, 180) + "...",
    };
  } catch (err) {
    return {
      name,
      ok: false,
      detail: (err as Error).message,
    };
  }
}

async function main() {
  console.log("Smoke 1A — three representative agent calls\n");

  const results: SmokeResult[] = [];

  // 1. Intake — anniversary message
  results.push(
    await safe(
      "intake",
      () =>
        intake.call({
          guest_message:
            "We arrive Friday evening for our 25th anniversary trip — first time in California.",
          thread_history: [],
          prior_profile_state: null,
        }),
      (out) => {
        if (!Array.isArray(out.parsed_intents)) return "missing parsed_intents";
        if (typeof out.extracted_entities !== "object")
          return "missing extracted_entities";
        if (!Array.isArray(out.profile_gaps)) return "missing profile_gaps";
        if (!Array.isArray(out.routing_hint)) return "missing routing_hint";
        return null;
      },
    ),
  );

  // 2. Profile Hub — Liu's static profile + intake
  results.push(
    await safe(
      "profile-hub",
      () =>
        profileHub.call({
          guest_id: "liu",
          prior_profile: null,
          static_profile: liuProfile,
          intake: {
            parsed_intents: [
              { intent: "share_occasion", detail: "25th anniversary" },
            ],
            extracted_entities: { occasion: "anniversary", milestone: "25th" },
            profile_gaps: [],
            routing_hint: ["cultural_reasoning"],
          },
        }),
      (out) => {
        if (!out.cultural_lens) return "missing cultural_lens";
        if (!out.current_phase) return "missing current_phase";
        if (typeof out.consent_state !== "object")
          return "missing consent_state";
        return null;
      },
    ),
  );

  // 3. Cultural Reasoning — Liu Sat 8am foggy
  const profileForCultural = {
    guest_id: "liu",
    cultural_lens: liuProfile.cultural_lens,
    current_phase: liuProfile.current_phase,
    family: liuProfile.family,
    history_summary:
      "Mrs. Liu, Hangzhou origin, arriving for 25th anniversary.",
    consent_state: liuProfile.consent_state,
    pace_tag: "1 activity / half-day",
    occasion: "25th anniversary",
    prior_stay_count: 0,
  };
  const fauxProperty: PropertyExperienceOutput = {
    availability: sandHill.available_services,
    seasonal_context:
      "Late-spring coastal fog through 10am; oaks quiet, garden cool.",
    cultural_resources: sandHill.cultural_resources,
    known_gaps: [],
    window_note: "garden quiet 7–9am",
  };
  results.push(
    await safe(
      "cultural-reasoning",
      () =>
        culturalReasoning.call({
          profile: profileForCultural,
          property: fauxProperty,
          intake: {
            parsed_intents: [
              {
                intent: "request_morning_plan",
                detail: "Plan a quiet first morning.",
              },
            ],
            extracted_entities: {},
            profile_gaps: [],
            routing_hint: ["composition"],
          },
          context: {
            time: "08:00",
            weather: "foggy",
            decision_moment: "saturday_morning",
            temperature_f: 55,
          },
        }),
      (out) => {
        if (!out.recommendation) return "missing recommendation";
        if (!out.cultural_reasoning) return "missing cultural_reasoning";
        if (!Array.isArray(out.avoidance_applied))
          return "missing avoidance_applied";
        return null;
      },
    ),
  );

  // Print
  let okCount = 0;
  for (const r of results) {
    const tag = r.ok ? "[OK] " : "[FAIL] ";
    console.log(tag + r.name);
    console.log("    " + r.detail.replace(/\n/g, "\n    "));
    if (r.ok) okCount++;
  }
  console.log(`\n${okCount}/${results.length} passed.`);
  if (okCount < results.length) process.exit(1);
}

main().catch((err) => {
  console.error("Smoke runner crashed:", err);
  process.exit(2);
});
