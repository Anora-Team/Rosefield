"use client";

import Link from "next/link";
import { useState } from "react";

import { ModeToggle, type AgentMode } from "@/components/controls/ModeToggle";
import {
  SimModeToggle,
  type SimMode,
} from "@/components/simulate/SimModeToggle";
import { PerStayView } from "@/components/simulate/per-stay/PerStayView";
import { PropertyView } from "@/components/simulate/property/PropertyView";

import { PER_STAY_SIMS, PROPERTY_SIM } from "@/lib/simulate/fixtures";

export default function SimulatePage() {
  const [simMode, setSimMode] = useState<SimMode>("per_stay");
  const [agentMode, setAgentMode] = useState<AgentMode>("cached");

  return (
    <div
      data-density="staff"
      className="min-h-screen flex flex-col bg-surface-canvas text-content-primary"
    >
      <header className="shrink-0 border-b border-line-hairline px-section py-stack">
        <div className="flex flex-wrap items-center justify-between gap-stack">
          <div className="flex items-baseline gap-inline">
            <span className="text-micro uppercase tracking-wide text-content-tertiary">
              Cultural Resonance
            </span>
            <span className="text-content-tertiary">·</span>
            <span className="text-micro uppercase tracking-wide text-content-secondary">
              Simulation
            </span>
            <span className="text-content-tertiary">·</span>
            <span className="text-micro uppercase tracking-wide text-accent-signature">
              {simMode === "per_stay" ? "Per-Stay" : "Property-Wide"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-section">
            <SimModeToggle mode={simMode} onChange={setSimMode} />
            <ModeToggle mode={agentMode} onChange={setAgentMode} />
            <Link
              href="/"
              className={[
                "border border-line-hairline bg-transparent",
                "px-4 py-2 text-micro uppercase tracking-wide",
                "text-accent-signature",
                "hover:bg-surface-sunken transition-colors duration-base ease-quiet",
                "focus:outline-none focus-visible:border-line-emphasis",
              ].join(" ")}
            >
              ← back to Companion
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-canvas-x py-canvas-y flex flex-col gap-section">
          {simMode === "per_stay" && (
            <>
              <Preamble
                title="Stress-test a single stay"
                body="Pick a guest. Sweep weather × time, walk through plausible pivots and surprise events, and see the choreography the property would prepare for each one. Cells, pivots, and events are cached projections; switch to Live to recompute any cell through the live agent pipeline."
              />
              <PerStayView sims={PER_STAY_SIMS} agentMode={agentMode} />
            </>
          )}
          {simMode === "property" && (
            <>
              <Preamble
                title="Stress-test the whole property"
                body="A late-spring cohort of ten VIP households mapped against the property's curated resources. Soft and hard gaps surface as ranked curation work — concrete additions to standardize what we currently solve case-by-case."
              />
              <PropertyView sim={PROPERTY_SIM} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Preamble({ title, body }: { title: string; body: string }) {
  return (
    <section className="flex flex-col gap-2 border-b border-line-hairline pb-stack">
      <h2 className="text-heading-lg font-serif text-content-primary">{title}</h2>
      <p className="text-body-sm text-content-secondary max-w-3xl leading-relaxed">
        {body}
      </p>
    </section>
  );
}
