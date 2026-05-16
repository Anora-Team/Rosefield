"use client";

import type { ProfileHubOutput } from "@/lib/types";
import { TheaterPanel } from "./TheaterPanel";

interface ProfileHubPanelProps {
  output: ProfileHubOutput;
  revealed: boolean;
  delayMs?: number;
  guestName?: string;
}

export function ProfileHubPanel({ output, revealed, delayMs, guestName }: ProfileHubPanelProps) {
  return (
    <TheaterPanel title="Profile Hub" revealed={revealed} delayMs={delayMs}>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-inline gap-y-hairline-gap">
        {guestName && (
          <div className="contents">
            <dt className="text-body-sm text-content-tertiary">Guest</dt>
            <dd className="text-body-sm text-content-primary">{guestName}</dd>
          </div>
        )}
        <div className="contents">
          <dt className="text-body-sm text-content-tertiary">Lens</dt>
          <dd className="text-body-sm text-content-primary">{output.cultural_lens}</dd>
        </div>
        <div className="contents">
          <dt className="text-body-sm text-content-tertiary">Phase</dt>
          <dd className="text-body-sm text-content-primary">{output.current_phase}</dd>
        </div>
        {output.occasion && (
          <div className="contents">
            <dt className="text-body-sm text-content-tertiary">Occasion</dt>
            <dd className="text-body-sm text-content-primary">{output.occasion}</dd>
          </div>
        )}
        <div className="contents">
          <dt className="text-body-sm text-content-tertiary">Pace</dt>
          <dd className="text-body-sm text-content-primary">{output.pace_tag}</dd>
        </div>
        <div className="contents">
          <dt className="text-body-sm text-content-tertiary">Prior stays</dt>
          <dd className="text-body-sm text-content-primary">{output.prior_stay_count}</dd>
        </div>
      </dl>

      {output.family.length > 0 && (
        <div className="mt-stack pt-stack border-t border-line-hairline">
          <p className="text-micro uppercase tracking-wide text-content-tertiary mb-hairline-gap">
            Family branches
          </p>
          <ul className="flex flex-col gap-hairline-gap">
            {output.family.map((member, i) => (
              <li key={i} className="text-body-sm text-content-primary">
                <span className="text-content-tertiary">{member.relation}</span>
                <span className="text-content-tertiary"> · </span>
                {member.name}
                {member.origin && (
                  <span className="text-content-secondary"> · {member.origin}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {output.history_summary && (
        <p className="mt-stack pt-stack border-t border-line-hairline text-body-sm text-content-secondary italic font-serif">
          {output.history_summary}
        </p>
      )}
    </TheaterPanel>
  );
}
