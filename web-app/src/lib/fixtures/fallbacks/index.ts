// Fallback cache — pre-warmed PipelineOutputs keyed by scenario_hint.
// Used by /api/companion/turn when the live LLM pipeline fails or is too slow.
//
// Each entry is a full PipelineOutput. The hand-authored JSON files cover
// Liu Scenario 1 (the demo-critical never-cut path); for Sarah, Patel, and
// the Liu mid-stay weather pivot we promote the UI mock pipelines into the
// same cache so the server can answer in <10ms for every demo beat.
//
// Keys must match the `scenario_hint` values the page sends. The page sends
// `${activePersona}-turn-${cursor}` where cursor starts at 0; the demo-doc
// canonical keys use `-scenario-N-turn-K` numbering. We register both forms
// against the same payload so either caller wins.

import type { PipelineOutput } from "@/lib/types";

import liuScenario1Turn1 from "./liu-scenario-1-turn-1.json";
import liuScenario1Turn2 from "./liu-scenario-1-turn-2.json";
import liuScenario1Turn3 from "./liu-scenario-1-turn-3.json";

import { liuWeatherPivotPipeline } from "@/lib/mocks/scenario-2-liu-weather";
import { sarahPivotPipeline } from "@/lib/mocks/scenario-3-sarah";
import { patelPipeline } from "@/lib/mocks/scenario-4-patel";

const liu1 = liuScenario1Turn1 as PipelineOutput;
const liu2 = liuScenario1Turn2 as PipelineOutput;
const liu3 = liuScenario1Turn3 as PipelineOutput;

// Canonical + alias keys collapse to the same payload.
const fallbacks: Record<string, PipelineOutput> = {
  // Liu Scenario 1 — the never-cut path. Canonical and page-cursor forms.
  "liu-scenario-1-turn-1": liu1,
  "liu-scenario-1-turn-2": liu2,
  "liu-scenario-1-turn-3": liu3,
  "liu-turn-0": liu1,
  "liu-turn-1": liu2,
  "liu-turn-2": liu3,

  // Liu Scenario 2 — mid-stay weather pivot.
  "liu-scenario-2-weather-pivot": liuWeatherPivotPipeline,
  "liu-weather-pivot": liuWeatherPivotPipeline,

  // Sarah Scenario 3 — emotional pivot (Western archetypal / Phoenix).
  "sarah-scenario-3-pivot": sarahPivotPipeline,
  "sarah-turn-0": sarahPivotPipeline,

  // Patel Scenario 4 — cross-cultural flash (Mumbai / Jain).
  "patel-scenario-4-flash": patelPipeline,
  "patel-turn-0": patelPipeline,
};

/**
 * Look up a pre-warmed PipelineOutput by scenario_hint key. Returns null if
 * no fallback exists for the given key.
 *
 * Caller is responsible for stamping a fresh decision_id if it wants
 * traceability separate from the canned response.
 */
export function getFallback(key: string | undefined | null): PipelineOutput | null {
  if (!key) return null;
  const hit = fallbacks[key];
  return hit ? clone(hit) : null;
}

export function listFallbackKeys(): string[] {
  return Object.keys(fallbacks);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
