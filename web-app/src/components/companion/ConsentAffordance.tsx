"use client";

// Three hairline-bordered buttons rendered inline within a Companion bubble
// when consent_required is true. No rounded corners, ghosted background.

export type ConsentAction = "yes" | "adjust" | "no";

interface ConsentAffordanceProps {
  onAction: (action: ConsentAction) => void;
  disabled?: boolean;
}

const buttons: ReadonlyArray<{ action: ConsentAction; label: string }> = [
  { action: "yes", label: "Yes" },
  { action: "adjust", label: "Adjust" },
  { action: "no", label: "No" },
];

export function ConsentAffordance({ onAction, disabled = false }: ConsentAffordanceProps) {
  return (
    <div className="mt-stack flex flex-wrap gap-inline">
      {buttons.map(({ action, label }) => (
        <button
          key={action}
          type="button"
          onClick={() => onAction(action)}
          disabled={disabled}
          className={[
            "border border-line-hairline bg-transparent",
            "px-5 py-2 text-micro uppercase tracking-wide",
            "text-content-primary",
            "transition-colors duration-base ease-quiet",
            "hover:bg-surface-sunken hover:text-accent-signature",
            "focus:outline-none focus-visible:border-line-emphasis",
            "disabled:cursor-not-allowed disabled:text-content-disabled",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
