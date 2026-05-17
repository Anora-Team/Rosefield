"use client";

import type { PivotScenario } from "@/lib/simulate/types";

interface PivotsPanelProps {
  pivots: ReadonlyArray<PivotScenario>;
}

export function PivotsPanel({ pivots }: PivotsPanelProps) {
  return (
    <ul className="flex flex-col divide-y divide-line-hairline border border-line-hairline">
      {pivots.map((p) => (
        <li key={p.id} className="px-4 py-4 flex flex-col gap-2 bg-surface-raised">
          <div className="text-micro uppercase tracking-wide text-content-tertiary">
            trigger
          </div>
          <p className="text-body-sm italic text-content-secondary">
            {p.trigger_message}
          </p>
          <div className="text-micro uppercase tracking-wide text-content-tertiary mt-2">
            anticipated response
          </div>
          <p className="text-body-sm text-content-primary">
            {p.anticipated_response}
          </p>
          <div className="flex items-center justify-between gap-stack mt-1">
            <span className="text-micro uppercase tracking-wide text-content-tertiary">
              routed: {p.routed_to.join(" · ")}
            </span>
            <span className="text-micro italic text-content-tertiary">
              {p.notes}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
