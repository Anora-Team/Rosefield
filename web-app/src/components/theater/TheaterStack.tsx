"use client";

import { useEffect, useRef, useState } from "react";
import type { PipelineOutput, SequenceLabel } from "@/lib/types";
import { IntakePanel } from "./Intake";
import { ProfileHubPanel } from "./ProfileHub";
import { CulturalPanel } from "./Cultural";
import { PropertyPanel } from "./Property";
import { CompositionPanel } from "./Composition";
import { ActionRoutingPanel } from "./ActionRouting";

interface TheaterStackProps {
  pipeline: PipelineOutput | null;
  guestName?: string;
  actionsLive?: boolean;
  // delay between successive panel reveals, in milliseconds.
  staggerMs?: number;
}

// Drives the reveal sequence per pipeline.sequence. Each panel index gets
// delay = index * staggerMs. Reset whenever decision_id changes.
export function TheaterStack({
  pipeline,
  guestName,
  actionsLive = false,
  staggerMs = 300,
}: TheaterStackProps) {
  const [revealed, setRevealed] = useState(false);
  const cancelHandle = useRef<number | null>(null);

  useEffect(() => {
    if (!pipeline) {
      const off = requestAnimationFrame(() => setRevealed(false));
      return () => cancelAnimationFrame(off);
    }
    // Reset on decision change, then flip to revealed next frame.
    const reset = requestAnimationFrame(() => {
      setRevealed(false);
      const id = requestAnimationFrame(() => setRevealed(true));
      // Best-effort cancellation handled by the cleanup below.
      cancelHandle.current = id;
    });
    return () => {
      cancelAnimationFrame(reset);
      if (cancelHandle.current !== null) cancelAnimationFrame(cancelHandle.current);
    };
  }, [pipeline?.decision_id, pipeline]);

  if (!pipeline) {
    return (
      <div className="flex flex-col gap-section text-content-tertiary italic">
        <p className="text-body-sm">Theater idle. Awaiting the next conversational turn.</p>
      </div>
    );
  }

  const panels: Record<SequenceLabel, (index: number) => React.ReactNode> = {
    intake: (i) => (
      <IntakePanel
        key={`intake-${pipeline.decision_id}`}
        output={pipeline.intake}
        revealed={revealed}
        delayMs={i * staggerMs}
      />
    ),
    profile: (i) => (
      <ProfileHubPanel
        key={`profile-${pipeline.decision_id}`}
        output={pipeline.profile}
        revealed={revealed}
        delayMs={i * staggerMs}
        guestName={guestName}
      />
    ),
    property: (i) => (
      <PropertyPanel
        key={`property-${pipeline.decision_id}`}
        output={pipeline.property}
        revealed={revealed}
        delayMs={i * staggerMs}
      />
    ),
    cultural: (i) => (
      <CulturalPanel
        key={`cultural-${pipeline.decision_id}`}
        output={pipeline.cultural}
        revealed={revealed}
        delayMs={i * staggerMs}
      />
    ),
    composition: (i) => (
      <CompositionPanel
        key={`composition-${pipeline.decision_id}`}
        output={pipeline.composition}
        revealed={revealed}
        delayMs={i * staggerMs}
      />
    ),
    actions: (i) => (
      <ActionRoutingPanel
        key={`actions-${pipeline.decision_id}`}
        output={pipeline.actions}
        revealed={revealed}
        delayMs={i * staggerMs}
        live={actionsLive}
      />
    ),
  };

  return (
    <div className="flex flex-col gap-section">
      {pipeline.sequence.map((label, i) => panels[label](i))}
    </div>
  );
}
