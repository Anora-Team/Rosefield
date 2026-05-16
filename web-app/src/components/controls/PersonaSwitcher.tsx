"use client";

export type PersonaId = "liu" | "sarah" | "patel";

interface PersonaSwitcherProps {
  active: PersonaId;
  onSwitch: (personaId: PersonaId) => void;
}

const PERSONAS: ReadonlyArray<{ id: PersonaId; label: string; sublabel: string }> = [
  { id: "liu", label: "Liu", sublabel: "anniversary" },
  { id: "sarah", label: "Sarah", sublabel: "solo retreat" },
  { id: "patel", label: "Patel", sublabel: "family" },
];

export function PersonaSwitcher({ active, onSwitch }: PersonaSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Active persona"
      className="inline-flex border border-line-hairline divide-x divide-line-hairline"
    >
      {PERSONAS.map((p) => {
        const isActive = p.id === active;
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSwitch(p.id)}
            className={[
              "px-4 py-2 text-micro uppercase tracking-wide",
              "transition-colors duration-base ease-quiet",
              "focus:outline-none focus-visible:border-line-emphasis",
              isActive
                ? "bg-surface-sunken text-accent-signature"
                : "bg-transparent text-content-secondary hover:text-content-primary",
            ].join(" ")}
          >
            <span className="block">{p.label}</span>
            <span className="block text-content-tertiary normal-case tracking-normal italic">
              {p.sublabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
