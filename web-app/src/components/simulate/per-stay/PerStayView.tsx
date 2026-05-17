"use client";

import { useCallback, useMemo, useState } from "react";

import type { ConditionCell, PerStaySim } from "@/lib/simulate/types";
import type { AgentMode } from "@/components/controls/ModeToggle";

import { GuestPicker } from "./GuestPicker";
import { ConditionsMatrix } from "./ConditionsMatrix";
import { PivotsPanel } from "./PivotsPanel";
import { SurprisesPanel } from "./SurprisesPanel";
import { TimelinePanel } from "./TimelinePanel";

interface PerStayViewProps {
  sims: ReadonlyArray<PerStaySim>;
  agentMode: AgentMode;
}

type Axis = "matrix" | "pivots" | "surprises" | "timeline";

const AXES: ReadonlyArray<{ id: Axis; label: string; sub: string }> = [
  { id: "matrix", label: "Weather × Time", sub: "5 × 5" },
  { id: "pivots", label: "Pivots", sub: "guest re-asks" },
  { id: "surprises", label: "Surprises", sub: "what we'd prep" },
  { id: "timeline", label: "Timeline", sub: "T-3d → checkout" },
];

export function PerStayView({ sims, agentMode }: PerStayViewProps) {
  const [activeGuest, setActiveGuest] = useState<string>(sims[0].guest_id);
  const [activeAxis, setActiveAxis] = useState<Axis>("matrix");
  const [liveBusy, setLiveBusy] = useState<string | null>(null);
  const [liveResults, setLiveResults] = useState<Record<string, string>>({});

  const sim = useMemo(
    () => sims.find((s) => s.guest_id === activeGuest) ?? sims[0],
    [sims, activeGuest],
  );

  const handleLiveRun = useCallback(
    async (cell: ConditionCell) => {
      if (agentMode !== "live") return;
      const key = `${cell.time}|${cell.weather}`;
      setLiveBusy(key);
      try {
        const res = await fetch("/api/simulate/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guest_id: sim.guest_id,
            display_name: sim.display_name,
            archetype: sim.archetype,
            baseline_summary: sim.baseline_summary,
            cell,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { detail: string };
        setLiveResults((prev) => ({ ...prev, [`${sim.guest_id}|${key}`]: data.detail }));
      } catch {
        setLiveResults((prev) => ({
          ...prev,
          [`${sim.guest_id}|${key}`]:
            "Live recompute failed — cached projection still applies.",
        }));
      } finally {
        setLiveBusy(null);
      }
    },
    [agentMode, sim],
  );

  // Splice live results into the matrix as detail overrides.
  const decoratedCells = useMemo(() => {
    return sim.matrix.map((c) => {
      const k = `${sim.guest_id}|${c.time}|${c.weather}`;
      if (liveResults[k]) {
        return {
          ...c,
          detail: `${c.detail}  —  [live] ${liveResults[k]}`,
        };
      }
      return c;
    });
  }, [sim, liveResults]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-section min-h-0">
      {/* Left rail — guest picker + baseline */}
      <aside className="flex flex-col gap-stack">
        <div className="text-micro uppercase tracking-wide text-content-tertiary">
          Simulated guest
        </div>
        <GuestPicker
          guests={sims}
          active={activeGuest}
          onSelect={setActiveGuest}
        />
        <div className="border border-line-hairline bg-surface-raised px-4 py-4">
          <div className="text-micro uppercase tracking-wide text-content-tertiary">
            Baseline
          </div>
          <p className="mt-2 text-body-sm text-content-primary leading-relaxed">
            {sim.baseline_summary}
          </p>
        </div>
      </aside>

      {/* Right pane — axis tabs + body */}
      <section className="flex flex-col gap-stack min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-stack">
          <div
            role="tablist"
            aria-label="Simulation axis"
            className="inline-flex border border-line-hairline divide-x divide-line-hairline"
          >
            {AXES.map((a) => {
              const isActive = activeAxis === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveAxis(a.id)}
                  className={[
                    "px-4 py-2 text-micro uppercase tracking-wide text-left",
                    "transition-colors duration-base ease-quiet",
                    "focus:outline-none focus-visible:border-line-emphasis",
                    isActive
                      ? "bg-surface-sunken text-accent-signature"
                      : "bg-transparent text-content-secondary hover:text-content-primary",
                  ].join(" ")}
                >
                  <span className="block">{a.label}</span>
                  <span className="block text-content-tertiary normal-case tracking-normal italic">
                    {a.sub}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="text-micro uppercase tracking-wide text-content-tertiary">
            {agentMode === "live" ? "Live · per-cell on demand" : "Cached projection"}
          </span>
        </div>

        {activeAxis === "matrix" && (
          <ConditionsMatrix
            key={sim.guest_id}
            cells={decoratedCells}
            onLiveRun={agentMode === "live" ? handleLiveRun : undefined}
            liveBusy={liveBusy}
          />
        )}
        {activeAxis === "pivots" && <PivotsPanel pivots={sim.pivots} />}
        {activeAxis === "surprises" && (
          <SurprisesPanel surprises={sim.surprises} />
        )}
        {activeAxis === "timeline" && <TimelinePanel timeline={sim.timeline} />}
      </section>
    </div>
  );
}
