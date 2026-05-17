"use client";

export type AgentMode = "cached" | "live";

interface ModeToggleProps {
  mode: AgentMode;
  onChange: (mode: AgentMode) => void;
}

const OPTIONS: ReadonlyArray<{ id: AgentMode; label: string; sub: string }> = [
  { id: "cached", label: "Cached", sub: "pre-warmed" },
  { id: "live", label: "Live", sub: "Sonnet 4.6" },
];

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Agent mode"
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
              "px-4 py-2 text-micro uppercase tracking-wide",
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
