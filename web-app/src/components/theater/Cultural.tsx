"use client";

import type { CulturalReasoningOutput } from "@/lib/types";
import { TheaterPanel } from "./TheaterPanel";

interface CulturalPanelProps {
  output: CulturalReasoningOutput;
  revealed: boolean;
  delayMs?: number;
}

export function CulturalPanel({ output, revealed, delayMs }: CulturalPanelProps) {
  return (
    <TheaterPanel title="Cultural Reasoning" revealed={revealed} delayMs={delayMs}>
      <p className="text-body-sm font-serif text-accent-signature font-medium">
        {output.recommendation}
      </p>

      <p className="mt-stack text-body-sm italic text-content-secondary font-serif leading-relaxed">
        {output.cultural_reasoning}
      </p>

      {output.alternative_if_context_shifts && (
        <div className="mt-stack pt-stack border-t border-line-hairline">
          <p className="text-micro uppercase tracking-wide text-content-tertiary mb-hairline-gap">
            Alternative if context shifts
          </p>
          <p className="text-body-sm text-content-secondary">
            {output.alternative_if_context_shifts}
          </p>
        </div>
      )}

      {output.emotional_arc_note && (
        <div className="mt-stack pt-stack border-t border-line-hairline">
          <p className="text-micro uppercase tracking-wide text-content-tertiary mb-hairline-gap">
            Arc note
          </p>
          <p className="text-body-sm text-content-secondary italic">
            {output.emotional_arc_note}
          </p>
        </div>
      )}

      {output.avoidance_applied.length > 0 && (
        <div className="mt-stack pt-stack border-t border-line-hairline">
          <p className="text-micro uppercase tracking-wide text-content-tertiary mb-hairline-gap">
            Avoidances applied
          </p>
          <ul className="flex flex-col gap-hairline-gap">
            {output.avoidance_applied.map((rule, i) => (
              <li
                key={i}
                className="text-body-sm text-content-tertiary before:content-['—_'] before:text-content-tertiary"
              >
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}
    </TheaterPanel>
  );
}
