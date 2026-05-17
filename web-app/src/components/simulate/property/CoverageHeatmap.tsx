"use client";

import { useMemo, useState } from "react";

import type {
  CoverageCell,
  FitLevel,
  PropertyGuestRow,
  ResourceMeta,
} from "@/lib/simulate/types";

interface CoverageHeatmapProps {
  guests: ReadonlyArray<PropertyGuestRow>;
  resources: ReadonlyArray<ResourceMeta>;
  cells: ReadonlyArray<CoverageCell>;
}

const FIT_CLASS: Record<FitLevel, string> = {
  strong: "bg-accent-signature/20 text-accent-signature",
  neutral: "bg-transparent text-content-tertiary",
  soft_gap: "bg-accent-gilt/20 text-accent-gilt",
  hard_gap: "bg-accent-terracotta/25 text-accent-terracotta",
  conflict: "bg-accent-terracotta/40 text-accent-terracotta",
};

const FIT_GLYPH: Record<FitLevel, string> = {
  strong: "●",
  neutral: "·",
  soft_gap: "◐",
  hard_gap: "○",
  conflict: "✕",
};

export function CoverageHeatmap({
  guests,
  resources,
  cells,
}: CoverageHeatmapProps) {
  const lookup = useMemo(() => {
    const m = new Map<string, CoverageCell>();
    for (const c of cells) m.set(`${c.guest_id}|${c.resource}`, c);
    return m;
  }, [cells]);

  const [hover, setHover] = useState<CoverageCell | null>(null);

  return (
    <div className="flex flex-col gap-stack min-w-0">
      <div className="flex flex-wrap items-center gap-4 text-micro uppercase tracking-wide text-content-tertiary">
        <span className="flex items-center gap-1.5">
          <span className="text-accent-signature">●</span> strong fit
        </span>
        <span className="flex items-center gap-1.5">
          <span>·</span> neutral
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-accent-gilt">◐</span> soft gap
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-accent-terracotta">○</span> hard gap
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-accent-terracotta">✕</span> conflict
        </span>
      </div>

      <div className="overflow-x-auto border border-line-hairline">
        <table className="w-full border-collapse text-body-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-micro uppercase tracking-wide text-content-tertiary border-b border-line-hairline bg-surface-raised sticky left-0">
                Guest
              </th>
              {resources.map((r) => (
                <th
                  key={r.key}
                  className="px-3 py-2 text-left text-micro uppercase tracking-wide text-content-tertiary border-b border-l border-line-hairline align-bottom"
                  title={r.blurb}
                >
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g.id} className="border-t border-line-hairline">
                <th className="px-3 py-2 text-left align-top bg-surface-raised sticky left-0 border-r border-line-hairline">
                  <div className="text-body-sm font-serif text-content-primary">
                    {g.display_name}
                  </div>
                  <div className="text-micro uppercase tracking-wide text-content-tertiary mt-0.5">
                    {g.flag}
                  </div>
                </th>
                {resources.map((r) => {
                  const c = lookup.get(`${g.id}|${r.key}`);
                  if (!c) {
                    return (
                      <td
                        key={r.key}
                        className="border-l border-line-hairline px-3 py-2 text-content-tertiary text-center"
                      >
                        —
                      </td>
                    );
                  }
                  return (
                    <td
                      key={r.key}
                      onMouseEnter={() => setHover(c)}
                      onMouseLeave={() =>
                        setHover((prev) => (prev?.guest_id === c.guest_id && prev.resource === c.resource ? null : prev))
                      }
                      className={[
                        "border-l border-line-hairline px-3 py-2 text-center cursor-default",
                        FIT_CLASS[c.fit],
                      ].join(" ")}
                      title={c.note}
                    >
                      <span className="text-body-lg">{FIT_GLYPH[c.fit]}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hover && (
        <aside className="border border-line-hairline bg-surface-raised px-4 py-3">
          <div className="text-micro uppercase tracking-wide text-content-tertiary">
            {guests.find((g) => g.id === hover.guest_id)?.display_name} ·{" "}
            {resources.find((r) => r.key === hover.resource)?.label} · fit ·{" "}
            {hover.fit.replace("_", " ")}
          </div>
          <p className="mt-1 text-body-sm text-content-primary">{hover.note}</p>
        </aside>
      )}
    </div>
  );
}
