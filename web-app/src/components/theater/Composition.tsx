"use client";

import type { CompositionOutput } from "@/lib/types";
import { TheaterPanel } from "./TheaterPanel";

interface CompositionPanelProps {
  output: CompositionOutput;
  revealed: boolean;
  delayMs?: number;
}

export function CompositionPanel({ output, revealed, delayMs }: CompositionPanelProps) {
  return (
    <TheaterPanel title="Composition" revealed={revealed} delayMs={delayMs}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack">
        <div>
          <p className="text-micro uppercase tracking-wide text-content-tertiary mb-hairline-gap">
            Internal recommendation
          </p>
          <p className="text-body-sm text-content-primary">{output.final_recommendation}</p>
        </div>
        <div>
          <p className="text-micro uppercase tracking-wide text-content-tertiary mb-hairline-gap">
            Guest-facing line
          </p>
          <p className="text-body-sm text-accent-signature font-serif italic">
            “{output.guest_facing_body}”
          </p>
        </div>
      </div>

      <div className="mt-stack pt-stack border-t border-line-hairline flex items-baseline gap-inline">
        <span
          className={[
            "text-micro uppercase tracking-wide",
            output.is_welcome_gate_passed
              ? "text-accent-signature"
              : "text-accent-terracotta",
          ].join(" ")}
        >
          {output.is_welcome_gate_passed ? "Gate passed" : "Gate held"}
        </span>
        <span className="text-content-tertiary">·</span>
        <span className="text-body-sm text-content-secondary italic">
          {output.gate_notes}
        </span>
      </div>

      {output.consent_required && (
        <p className="mt-stack text-micro uppercase tracking-wide text-content-tertiary">
          Consent required before fan-out
        </p>
      )}
    </TheaterPanel>
  );
}
