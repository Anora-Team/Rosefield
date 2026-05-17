"use client";

import type { PerStaySim } from "@/lib/simulate/types";

interface GuestPickerProps {
  guests: ReadonlyArray<PerStaySim>;
  active: string;
  onSelect: (guest_id: string) => void;
}

export function GuestPicker({ guests, active, onSelect }: GuestPickerProps) {
  return (
    <div
      role="tablist"
      aria-label="Simulated guest"
      className="flex flex-col border border-line-hairline divide-y divide-line-hairline"
    >
      {guests.map((g) => {
        const isActive = g.guest_id === active;
        return (
          <button
            key={g.guest_id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(g.guest_id)}
            className={[
              "text-left px-4 py-3",
              "transition-colors duration-base ease-quiet",
              "focus:outline-none focus-visible:border-line-emphasis",
              isActive
                ? "bg-surface-sunken text-accent-signature"
                : "bg-transparent text-content-secondary hover:text-content-primary",
            ].join(" ")}
          >
            <div className="text-body-sm font-serif">{g.display_name}</div>
            <div className="text-micro uppercase tracking-wide text-content-tertiary mt-1">
              {g.archetype}
            </div>
          </button>
        );
      })}
    </div>
  );
}
