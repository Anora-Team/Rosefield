"use client";

import { useEffect, useState, type ReactNode } from "react";

interface TheaterPanelProps {
  title: string;
  children: ReactNode;
  revealed: boolean;
  delayMs?: number;
}

// Reusable panel: uppercase tracked title, hairline divider, body in text-body-sm.
// When revealed becomes true, fade in over duration-settle (400ms) ease-quiet.
// Uses inline transitionDuration to reference the CSS custom property, so the
// timing always matches the design token even if Tailwind utility names shift.
export function TheaterPanel({ title, children, revealed, delayMs = 0 }: TheaterPanelProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!revealed) {
      const off = requestAnimationFrame(() => setShown(false));
      return () => cancelAnimationFrame(off);
    }
    if (delayMs <= 0) {
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    const t = window.setTimeout(() => setShown(true), delayMs);
    return () => window.clearTimeout(t);
  }, [revealed, delayMs]);

  return (
    <section
      data-revealed={shown ? "true" : "false"}
      className={[
        "border border-line-hairline bg-surface-raised",
        "px-section py-section",
        "transition-opacity ease-quiet",
        shown ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{ transitionDuration: "var(--motion-duration-settle)" }}
    >
      <header className="flex items-baseline justify-between pb-hairline-gap border-b border-line-hairline">
        <h3 className="text-micro uppercase tracking-wide text-content-tertiary">{title}</h3>
      </header>
      <div className="mt-stack text-body-sm text-content-primary">{children}</div>
    </section>
  );
}
