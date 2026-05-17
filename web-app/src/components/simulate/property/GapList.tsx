"use client";

import type { CurationGap } from "@/lib/simulate/types";

interface GapListProps {
  gaps: ReadonlyArray<CurationGap>;
}

const SEV_CLASS: Record<CurationGap["severity"], string> = {
  blocking: "text-accent-terracotta",
  degrading: "text-accent-gilt",
  minor: "text-content-tertiary",
};

export function GapList({ gaps }: GapListProps) {
  return (
    <ol className="flex flex-col border border-line-hairline divide-y divide-line-hairline">
      {gaps.map((g, idx) => (
        <li key={g.id} className="bg-surface-raised px-4 py-4 flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-stack">
            <div className="flex items-baseline gap-3">
              <span className="text-micro uppercase tracking-wide text-content-tertiary tabular-nums">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <h4 className="text-body-lg font-serif text-content-primary">
                {g.title}
              </h4>
            </div>
            <span
              className={[
                "text-micro uppercase tracking-wide shrink-0",
                SEV_CLASS[g.severity],
              ].join(" ")}
            >
              {g.severity}
            </span>
          </div>
          <p className="text-body-sm text-content-primary leading-relaxed">
            {g.recommendation}
          </p>
          <div className="text-micro uppercase tracking-wide text-content-tertiary">
            affects: {g.affected_guests.join(" · ")}
          </div>
        </li>
      ))}
    </ol>
  );
}
