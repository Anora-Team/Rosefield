"use client";

import { useMemo, useState } from "react";

import type {
  ConditionCell,
  TimeKey,
  WeatherKey,
  DeltaTone,
} from "@/lib/simulate/types";

interface ConditionsMatrixProps {
  cells: ReadonlyArray<ConditionCell>;
  onLiveRun?: (cell: ConditionCell) => void;
  liveBusy?: string | null; // cell key being recomputed
}

const TIMES: TimeKey[] = ["06:00", "09:00", "12:00", "15:00", "20:00"];
const WEATHERS: WeatherKey[] = ["foggy", "overcast", "clear", "sun", "rain"];

const TONE_CLASS: Record<DeltaTone, string> = {
  baseline: "bg-transparent text-content-tertiary",
  shift: "bg-surface-raised text-content-primary",
  drift: "bg-surface-raised text-content-secondary",
  flag: "bg-surface-sunken text-accent-signature",
};

export function ConditionsMatrix({
  cells,
  onLiveRun,
  liveBusy,
}: ConditionsMatrixProps) {
  const lookup = useMemo(() => {
    const m = new Map<string, ConditionCell>();
    for (const c of cells) m.set(`${c.time}|${c.weather}`, c);
    return m;
  }, [cells]);

  const [active, setActive] = useState<string | null>(null);
  const activeCell = active ? lookup.get(active) ?? null : null;

  return (
    <div className="flex flex-col gap-stack">
      <div className="overflow-x-auto border border-line-hairline">
        <table className="w-full border-collapse text-body-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-micro uppercase tracking-wide text-content-tertiary border-b border-line-hairline">
                Time / Weather
              </th>
              {WEATHERS.map((w) => (
                <th
                  key={w}
                  className="px-3 py-2 text-left text-micro uppercase tracking-wide text-content-tertiary border-b border-line-hairline"
                >
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIMES.map((t) => (
              <tr key={t} className="border-t border-line-hairline">
                <th className="px-3 py-2 text-left text-micro uppercase tracking-wide text-content-tertiary align-top">
                  {t}
                </th>
                {WEATHERS.map((w) => {
                  const key = `${t}|${w}`;
                  const c = lookup.get(key);
                  if (!c) {
                    return (
                      <td
                        key={w}
                        className="border-l border-line-hairline align-top px-3 py-2 text-content-tertiary"
                      >
                        —
                      </td>
                    );
                  }
                  const isActive = active === key;
                  const isBusy = liveBusy === key;
                  return (
                    <td
                      key={w}
                      onClick={() => setActive(key)}
                      className={[
                        "border-l border-line-hairline align-top px-3 py-2 cursor-pointer",
                        TONE_CLASS[c.tone],
                        isActive ? "outline outline-1 outline-line-emphasis" : "",
                      ].join(" ")}
                    >
                      <div className="text-body-sm leading-snug">{c.headline}</div>
                      {c.tone !== "baseline" && (
                        <div className="mt-1 text-micro uppercase tracking-wide text-content-tertiary">
                          {c.routed_to.join(" · ")}
                        </div>
                      )}
                      {isBusy && (
                        <div className="mt-1 text-micro uppercase tracking-wide text-accent-signature italic">
                          recomputing…
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeCell && (
        <aside className="border border-line-hairline bg-surface-raised px-4 py-3 flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-stack">
            <div>
              <div className="text-micro uppercase tracking-wide text-content-tertiary">
                {activeCell.time} · {activeCell.weather}
              </div>
              <h4 className="text-body-lg font-serif text-content-primary mt-1">
                {activeCell.headline}
              </h4>
            </div>
            {onLiveRun && (
              <button
                type="button"
                onClick={() => onLiveRun(activeCell)}
                disabled={liveBusy === `${activeCell.time}|${activeCell.weather}`}
                className={[
                  "border border-line-hairline px-3 py-1.5 text-micro uppercase tracking-wide",
                  "text-accent-signature bg-transparent",
                  "hover:bg-surface-sunken transition-colors duration-base ease-quiet",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus:outline-none focus-visible:border-line-emphasis",
                ].join(" ")}
              >
                Run live
              </button>
            )}
          </div>
          <p className="text-body-sm text-content-secondary">{activeCell.detail}</p>
          <div className="text-micro uppercase tracking-wide text-content-tertiary">
            Routed: {activeCell.routed_to.join(" · ")}
          </div>
        </aside>
      )}
    </div>
  );
}
