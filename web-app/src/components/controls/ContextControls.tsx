"use client";

import { useMemo } from "react";
import type { ContextInput } from "@/lib/types";

interface ContextControlsProps {
  context: ContextInput;
  onChange: (ctx: ContextInput) => void;
}

const TIME_STOPS: ReadonlyArray<{ label: string; time: string; decision: ContextInput["decision_moment"] }> = [
  { label: "Sat 6am", time: "06:00", decision: "saturday_morning" },
  { label: "Sat 9am", time: "09:00", decision: "saturday_morning" },
  { label: "Sat 12pm", time: "12:00", decision: "midday" },
  { label: "Sat 3pm", time: "15:00", decision: "midday" },
  { label: "Sat 8pm", time: "20:00", decision: "evening" },
];

const WEATHERS: ReadonlyArray<ContextInput["weather"]> = [
  "foggy",
  "clear",
  "rain",
  "sun",
  "overcast",
];

export function ContextControls({ context, onChange }: ContextControlsProps) {
  // Find nearest stop to current context.time.
  const stopIndex = useMemo(() => {
    const i = TIME_STOPS.findIndex((s) => s.time === context.time);
    return i === -1 ? 0 : i;
  }, [context.time]);

  return (
    <div className="flex flex-wrap items-center gap-section">
      <div className="flex flex-col gap-hairline-gap min-w-[18rem]">
        <label className="text-micro uppercase tracking-wide text-content-tertiary">
          Time · {TIME_STOPS[stopIndex].label}
        </label>
        <input
          type="range"
          min={0}
          max={TIME_STOPS.length - 1}
          step={1}
          value={stopIndex}
          onChange={(e) => {
            const idx = Number(e.target.value);
            const stop = TIME_STOPS[idx];
            onChange({ ...context, time: stop.time, decision_moment: stop.decision });
          }}
          style={{ accentColor: "var(--color-accent-signature)" }}
        />
      </div>

      <div className="flex flex-col gap-hairline-gap">
        <span className="text-micro uppercase tracking-wide text-content-tertiary">
          Weather
        </span>
        <div className="inline-flex border border-line-hairline divide-x divide-line-hairline">
          {WEATHERS.map((w) => {
            const isActive = context.weather === w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => onChange({ ...context, weather: w })}
                className={[
                  "px-3 py-1 text-micro uppercase tracking-wide",
                  "transition-colors duration-base ease-quiet",
                  "focus:outline-none focus-visible:border-line-emphasis",
                  isActive
                    ? "bg-surface-sunken text-accent-signature"
                    : "bg-transparent text-content-secondary hover:text-content-primary",
                ].join(" ")}
              >
                {w}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
