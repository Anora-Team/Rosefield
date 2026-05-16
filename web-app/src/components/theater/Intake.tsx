"use client";

import type { IntakeOutput } from "@/lib/types";
import { TheaterPanel } from "./TheaterPanel";

interface IntakePanelProps {
  output: IntakeOutput;
  revealed: boolean;
  delayMs?: number;
}

export function IntakePanel({ output, revealed, delayMs }: IntakePanelProps) {
  return (
    <TheaterPanel title="Intake" revealed={revealed} delayMs={delayMs}>
      <div className="flex flex-col gap-stack">
        <div>
          <p className="text-micro uppercase tracking-wide text-content-tertiary mb-hairline-gap">
            Parsed intents
          </p>
          <ul className="flex flex-col gap-hairline-gap">
            {output.parsed_intents.map((intent, i) => (
              <li key={i} className="text-body-sm text-content-primary">
                <span className="text-content-secondary">{intent.intent}</span>
                <span className="text-content-tertiary"> · </span>
                {intent.detail}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-micro uppercase tracking-wide text-content-tertiary mb-hairline-gap">
            Extracted entities
          </p>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-inline gap-y-hairline-gap">
            {Object.entries(output.extracted_entities).map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="text-body-sm text-content-tertiary">{key}</dt>
                <dd className="text-body-sm text-content-primary">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>

        {output.profile_gaps.length > 0 && (
          <div>
            <p className="text-micro uppercase tracking-wide text-content-tertiary mb-hairline-gap">
              Profile gaps
            </p>
            <ul className="flex flex-wrap gap-inline">
              {output.profile_gaps.map((gap) => (
                <li
                  key={gap}
                  className="border border-line-hairline px-2 py-1 text-micro uppercase tracking-wide text-content-tertiary italic"
                >
                  {gap} · pending
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </TheaterPanel>
  );
}
