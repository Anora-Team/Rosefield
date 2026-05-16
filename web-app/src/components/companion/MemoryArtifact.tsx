"use client";

import { useEffect, useState } from "react";
import type { MemoryOutput } from "@/lib/types";

interface MemoryArtifactProps {
  memory: MemoryOutput | null;
  onClose: () => void;
}

// Full-pane reveal over the conversation. Display type, generous spacing, two
// paragraphs (one may be bilingual). Fade-in over 600ms with ease-quiet.
export function MemoryArtifact({ memory, onClose }: MemoryArtifactProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (memory) {
      // Defer to next frame so the transition runs.
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    const off = requestAnimationFrame(() => setVisible(false));
    return () => cancelAnimationFrame(off);
  }, [memory]);

  if (!memory) return null;

  const paragraphs = memory.memory_artifact.split(/\n+/).filter((p) => p.trim().length > 0);

  return (
    <div
      role="dialog"
      aria-label="Memory artifact"
      className={[
        "absolute inset-0 z-overlay",
        "bg-surface-ink text-content-inverse",
        "flex flex-col justify-center",
        "px-12 py-16",
        "transition-opacity ease-quiet",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{ transitionDuration: "var(--motion-duration-arrive)" }}
    >
      <p className="text-micro uppercase tracking-wide text-accent-gilt mb-12">
        Rosewood Sand Hill · remembers
      </p>

      <div className="max-w-[48ch] mx-auto flex flex-col gap-stack overflow-y-auto">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className={[
              "text-display-lg font-serif font-light leading-snug",
              i > 0 ? "italic" : "",
            ].join(" ")}
          >
            {p}
          </p>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-stack">
        <div className="w-6 h-px bg-accent-gilt" />
        <p className="text-micro uppercase tracking-wide text-accent-gilt opacity-60">
          Two weeks after departure · in the place&apos;s voice
        </p>
        <button
          type="button"
          onClick={onClose}
          className={[
            "mt-stack border border-line-hairline bg-transparent",
            "px-5 py-2 text-micro uppercase tracking-wide",
            "text-content-inverse opacity-70",
            "hover:opacity-100 transition-opacity duration-base ease-quiet",
            "focus:outline-none focus-visible:border-accent-gilt",
          ].join(" ")}
        >
          Close
        </button>
      </div>
    </div>
  );
}
