"use client";

import type { TimelineTouchpoint } from "@/lib/simulate/types";

interface TimelinePanelProps {
  timeline: ReadonlyArray<TimelineTouchpoint>;
}

export function TimelinePanel({ timeline }: TimelinePanelProps) {
  return (
    <ol className="flex flex-col border border-line-hairline divide-y divide-line-hairline">
      {timeline.map((t) => (
        <li
          key={t.id}
          className="bg-surface-raised px-4 py-3 grid gap-2 lg:grid-cols-[10rem_1fr_8rem] lg:items-baseline"
        >
          <div className="text-micro uppercase tracking-wide text-accent-signature">
            {t.when}
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-body-sm text-content-primary">
              {t.anticipated_need}
            </div>
            <div className="text-body-sm text-content-secondary italic">
              {t.prepare}
            </div>
          </div>
          <div className="text-micro uppercase tracking-wide text-content-tertiary lg:text-right">
            {t.owner}
          </div>
        </li>
      ))}
    </ol>
  );
}
