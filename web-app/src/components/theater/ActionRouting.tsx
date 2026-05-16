"use client";

import type { ActionRoutingOutput, StaffTeam } from "@/lib/types";
import { TheaterPanel } from "./TheaterPanel";

interface ActionRoutingPanelProps {
  output: ActionRoutingOutput;
  revealed: boolean;
  delayMs?: number;
  live?: boolean;
}

const TEAM_LABEL: Record<StaffTeam, string> = {
  concierge: "Concierge",
  restaurant: "Restaurant",
  spa: "Spa",
  housekeeping: "Housekeeping",
  valet: "Valet",
  kitchen: "Kitchen",
  garden: "Garden",
  in_room_dining: "In-Room Dining",
};

export function ActionRoutingPanel({
  output,
  revealed,
  delayMs,
  live = false,
}: ActionRoutingPanelProps) {
  const title = "Composition → Actions";

  if (output.routed_tasks.length === 0) {
    return (
      <TheaterPanel title={title} revealed={revealed} delayMs={delayMs}>
        <p className="text-body-sm italic text-content-tertiary">
          Awaiting consent — actions drafted, not routed.
        </p>
      </TheaterPanel>
    );
  }

  return (
    <TheaterPanel title={title} revealed={revealed} delayMs={delayMs}>
      <div className="flex items-baseline justify-between mb-stack">
        <p className="text-micro uppercase tracking-wide text-content-tertiary">
          {output.routed_tasks.length} routed task
          {output.routed_tasks.length === 1 ? "" : "s"}
        </p>
        <p
          className={[
            "text-micro uppercase tracking-wide",
            live ? "text-accent-signature" : "text-content-tertiary italic",
          ].join(" ")}
        >
          {live ? "Live" : "Drafted"}
        </p>
      </div>

      <ol className="flex flex-col gap-stack">
        {output.routed_tasks.map((task, i) => (
          <li
            key={i}
            className="border-t border-line-hairline pt-stack flex flex-col gap-hairline-gap"
          >
            <div className="flex items-baseline gap-inline">
              <span className="text-micro uppercase tracking-wide text-accent-signature">
                {TEAM_LABEL[task.staff_team] ?? task.staff_team}
              </span>
              <span className="text-content-tertiary">·</span>
              <span className="text-micro uppercase tracking-wide text-content-tertiary tabular-nums">
                due {task.due_by}
              </span>
            </div>
            <p className="text-body-sm text-content-primary font-serif">{task.task}</p>
            <p className="text-body-sm italic text-content-secondary font-serif leading-snug">
              {task.cultural_context}
            </p>
          </li>
        ))}
      </ol>
    </TheaterPanel>
  );
}
