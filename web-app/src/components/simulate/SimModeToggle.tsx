"use client";

export type SimMode = "per_stay" | "property";

interface SimModeToggleProps {
  mode: SimMode;
  onChange: (mode: SimMode) => void;
}

const OPTIONS: ReadonlyArray<{ id: SimMode; label: string; sub: string }> = [
  { id: "per_stay", label: "Per-Stay", sub: "one guest · many conditions" },
  { id: "property", label: "Property-Wide", sub: "many VIPs · coverage gaps" },
];

export function SimModeToggle({ mode, onChange }: SimModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Simulation mode"
      className="inline-flex border border-line-hairline divide-x divide-line-hairline"
    >
      {OPTIONS.map((o) => {
        const isActive = o.id === mode;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(o.id)}
            className={[
              "px-5 py-3 text-micro uppercase tracking-wide text-left",
              "transition-colors duration-base ease-quiet",
              "focus:outline-none focus-visible:border-line-emphasis",
              isActive
                ? "bg-surface-sunken text-accent-signature"
                : "bg-transparent text-content-secondary hover:text-content-primary",
            ].join(" ")}
          >
            <span className="block">{o.label}</span>
            <span className="block text-content-tertiary normal-case tracking-normal italic">
              {o.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
