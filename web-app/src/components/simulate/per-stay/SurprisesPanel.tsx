"use client";

import type { SurpriseEvent } from "@/lib/simulate/types";

interface SurprisesPanelProps {
  surprises: ReadonlyArray<SurpriseEvent>;
}

const RISK_TONE: Record<SurpriseEvent["risk"], string> = {
  high: "text-accent-terracotta",
  medium: "text-accent-gilt",
  low: "text-content-tertiary",
};

export function SurprisesPanel({ surprises }: SurprisesPanelProps) {
  return (
    <ul className="flex flex-col divide-y divide-line-hairline border border-line-hairline">
      {surprises.map((s) => (
        <li key={s.id} className="px-4 py-4 flex flex-col gap-2 bg-surface-raised">
          <div className="flex items-baseline justify-between gap-stack">
            <h4 className="text-body-lg font-serif text-content-primary">
              {s.event}
            </h4>
            <span
              className={[
                "text-micro uppercase tracking-wide",
                RISK_TONE[s.risk],
              ].join(" ")}
            >
              risk · {s.risk}
            </span>
          </div>
          <p className="text-body-sm text-content-secondary italic">
            {s.impact}
          </p>
          <div className="text-micro uppercase tracking-wide text-content-tertiary mt-1">
            prepared actions
          </div>
          <ul className="flex flex-col gap-1 pl-4 list-disc marker:text-content-tertiary">
            {s.prepared_actions.map((a, i) => (
              <li key={i} className="text-body-sm text-content-primary">
                {a}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
