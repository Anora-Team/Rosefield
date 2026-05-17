"use client";

import type { PropertySim } from "@/lib/simulate/types";

import { CoverageHeatmap } from "./CoverageHeatmap";
import { GapList } from "./GapList";

interface PropertyViewProps {
  sim: PropertySim;
}

export function PropertyView({ sim }: PropertyViewProps) {
  return (
    <div className="flex flex-col gap-section min-w-0">
      <header className="flex flex-wrap items-baseline justify-between gap-stack border-b border-line-hairline pb-stack">
        <div>
          <h3 className="text-heading-md font-serif text-content-primary">
            VIP cohort coverage
          </h3>
          <p className="text-micro uppercase tracking-wide text-content-tertiary mt-1">
            {sim.cohort_size} guests · {sim.date_window}
          </p>
        </div>
      </header>

      <CoverageHeatmap
        guests={sim.guests}
        resources={sim.resources}
        cells={sim.cells}
      />

      <header className="flex flex-wrap items-baseline justify-between gap-stack border-b border-line-hairline pb-stack mt-section">
        <div>
          <h3 className="text-heading-md font-serif text-content-primary">
            Curation gaps — ranked
          </h3>
          <p className="text-micro uppercase tracking-wide text-content-tertiary mt-1">
            What to add, staff, or stock so the next quarter&rsquo;s VIPs are received,
            not surprised at.
          </p>
        </div>
      </header>

      <GapList gaps={sim.gaps} />
    </div>
  );
}
