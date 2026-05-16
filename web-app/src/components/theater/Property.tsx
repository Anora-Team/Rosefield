"use client";

import type { PropertyExperienceOutput } from "@/lib/types";
import { TheaterPanel } from "./TheaterPanel";

interface PropertyPanelProps {
  output: PropertyExperienceOutput;
  revealed: boolean;
  delayMs?: number;
}

const STATUS_LABEL: Record<string, string> = {
  open: "open",
  limited: "limited",
  closed: "closed",
};

export function PropertyPanel({ output, revealed, delayMs }: PropertyPanelProps) {
  const hasGaps = output.known_gaps.length > 0;

  return (
    <TheaterPanel title="Property Experience Hub" revealed={revealed} delayMs={delayMs}>
      <p className="text-body-sm text-content-secondary italic font-serif">
        {output.seasonal_context}
      </p>

      <div className="mt-stack pt-stack border-t border-line-hairline">
        <p className="text-micro uppercase tracking-wide text-content-tertiary mb-hairline-gap">
          Availability
        </p>
        <ul className="flex flex-col gap-hairline-gap">
          {output.availability.map((svc, i) => (
            <li key={i} className="text-body-sm text-content-primary flex items-baseline gap-inline">
              <span className="flex-1">{svc.service}</span>
              <span
                className={[
                  "text-micro uppercase tracking-wide",
                  svc.status === "open"
                    ? "text-accent-signature"
                    : svc.status === "limited"
                    ? "text-content-secondary"
                    : "text-accent-terracotta",
                ].join(" ")}
              >
                {STATUS_LABEL[svc.status] ?? svc.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {output.cultural_resources.length > 0 && (
        <div className="mt-stack pt-stack border-t border-line-hairline">
          <p className="text-micro uppercase tracking-wide text-content-tertiary mb-hairline-gap">
            Cultural resources
          </p>
          <ul className="flex flex-col gap-hairline-gap">
            {output.cultural_resources.map((res, i) => (
              <li key={i} className="text-body-sm text-content-primary">
                <span className="font-medium">{res.label}</span>
                <span className="text-content-tertiary"> · </span>
                <span className="text-content-secondary">{res.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-stack pt-stack border-t border-line-hairline">
        <p className="text-micro uppercase tracking-wide text-content-tertiary mb-hairline-gap">
          Window note
        </p>
        <p className="text-body-sm text-accent-signature font-medium">{output.window_note}</p>
      </div>

      {hasGaps && (
        <div className="mt-stack pt-stack border-t border-line-hairline">
          <p className="text-micro uppercase tracking-wide text-accent-terracotta mb-hairline-gap">
            Known gaps
          </p>
          <ul className="flex flex-col gap-hairline-gap">
            {output.known_gaps.map((gap, i) => (
              <li key={i} className="text-body-sm text-accent-terracotta">
                <span className="text-content-tertiary uppercase tracking-wide">
                  {gap.severity}
                </span>
                <span className="text-content-tertiary"> · </span>
                {gap.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </TheaterPanel>
  );
}
