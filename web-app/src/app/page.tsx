"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CompanionTurnRequest,
  CompanionTurnResponse,
  ContextInput,
  MemoryOutput,
  PipelineOutput,
  ThreadMessage,
  ThreadState,
} from "@/lib/types";

import { CompanionThread } from "@/components/companion/CompanionThread";
import { CompanionInput } from "@/components/companion/CompanionInput";
import { MemoryArtifact } from "@/components/companion/MemoryArtifact";
import { TheaterStack } from "@/components/theater/TheaterStack";
import { PersonaSwitcher, type PersonaId } from "@/components/controls/PersonaSwitcher";
import { ContextControls } from "@/components/controls/ContextControls";
import { ModeToggle, type AgentMode } from "@/components/controls/ModeToggle";
import type { ConsentAction } from "@/components/companion/ConsentAffordance";

import {
  liuGuestEchoes,
  liuMemoryArtifact,
  liuOpeningMessages,
  liuPreArrivalContext,
  liuTurnSequence,
} from "@/lib/mocks/scenario-1-liu";
import {
  sarahContext,
  sarahOpeningMessages,
  sarahPivotMessage,
  sarahPivotPipeline,
} from "@/lib/mocks/scenario-3-sarah";
import {
  patelContext,
  patelOpeningMessages,
  patelPipeline,
  patelReplyMessage,
} from "@/lib/mocks/scenario-4-patel";

// -----------------------------------------------------------------------------
// Persona seed bundles. Each persona has its own initial thread + context, and
// an ordered list of canned turns to fall back on when the API is unavailable.
// -----------------------------------------------------------------------------
interface PersonaSeed {
  id: PersonaId;
  name: string;
  initialMessages: ThreadMessage[];
  initialContext: ContextInput;
  initialPipeline: PipelineOutput | null;
  // Each "fallback turn" supplies the Companion response + pipeline for the
  // current user submission, plus an optional pre-baked guest echo to render
  // as the user line when the demo is being click-driven rather than typed.
  fallbackTurns: ReadonlyArray<{
    pipeline: PipelineOutput;
    companionMessages: ThreadMessage[];
    guestEcho?: ThreadMessage;
  }>;
  memory: MemoryOutput | null;
}

const PERSONAS: Record<PersonaId, PersonaSeed> = {
  liu: {
    id: "liu",
    name: "Mrs. Liu Lihua",
    initialMessages: liuOpeningMessages,
    initialContext: liuPreArrivalContext,
    initialPipeline: null,
    fallbackTurns: [
      {
        pipeline: liuTurnSequence[0].pipeline,
        companionMessages: liuTurnSequence[0].new_messages,
      },
      {
        pipeline: liuTurnSequence[1].pipeline,
        companionMessages: liuTurnSequence[1].new_messages,
        guestEcho: liuGuestEchoes[0],
      },
      {
        pipeline: liuTurnSequence[2].pipeline,
        companionMessages: liuTurnSequence[2].new_messages,
        guestEcho: liuGuestEchoes[1],
      },
    ],
    memory: liuMemoryArtifact,
  },
  sarah: {
    id: "sarah",
    name: "Sarah Anderson",
    initialMessages: sarahOpeningMessages,
    initialContext: sarahContext,
    initialPipeline: null,
    fallbackTurns: [
      {
        pipeline: sarahPivotPipeline,
        companionMessages: [sarahPivotMessage],
      },
    ],
    memory: null,
  },
  patel: {
    id: "patel",
    name: "Mr. & Mrs. Patel",
    initialMessages: patelOpeningMessages,
    initialContext: patelContext,
    initialPipeline: null,
    fallbackTurns: [
      {
        pipeline: patelPipeline,
        companionMessages: [patelReplyMessage],
      },
    ],
    memory: null,
  },
};

// Internal per-persona state container.
interface PersonaState {
  messages: ThreadMessage[];
  pipeline: PipelineOutput | null;
  context: ContextInput;
  fallbackCursor: number;
  consentGiven: boolean;
  showMemory: boolean;
}

function freshState(seed: PersonaSeed): PersonaState {
  return {
    messages: [...seed.initialMessages],
    pipeline: seed.initialPipeline,
    context: { ...seed.initialContext },
    fallbackCursor: 0,
    consentGiven: false,
    showMemory: false,
  };
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default function Home() {
  const [activePersona, setActivePersona] = useState<PersonaId>("liu");
  const [agentMode, setAgentMode] = useState<AgentMode>("cached");
  const [inFlight, setInFlight] = useState(false);
  const [byPersona, setByPersona] = useState<Record<PersonaId, PersonaState>>(() => ({
    liu: freshState(PERSONAS.liu),
    sarah: freshState(PERSONAS.sarah),
    patel: freshState(PERSONAS.patel),
  }));

  const seed = PERSONAS[activePersona];
  const state = byPersona[activePersona];

  const updateActive = useCallback(
    (patch: Partial<PersonaState>) => {
      setByPersona((prev) => ({
        ...prev,
        [activePersona]: { ...prev[activePersona], ...patch },
      }));
    },
    [activePersona],
  );

  const buildThreadState = useCallback(
    (s: PersonaState): ThreadState => ({
      guest_id: activePersona,
      messages: s.messages,
      last_pipeline: s.pipeline ?? undefined,
    }),
    [activePersona],
  );

  const advanceFallback = useCallback(
    (s: PersonaState, userMessage?: ThreadMessage): PersonaState => {
      const turn = seed.fallbackTurns[s.fallbackCursor];
      if (!turn) {
        // Out of canned turns — keep latest pipeline, just echo a holding line.
        const holding: ThreadMessage = {
          id: `${activePersona}-hold-${s.messages.length}`,
          role: "companion",
          body: "I'll write only if something material shifts.",
          timestamp: new Date().toISOString(),
        };
        return {
          ...s,
          messages: userMessage
            ? [...s.messages, userMessage, holding]
            : [...s.messages, holding],
        };
      }
      const userLine = userMessage ?? turn.guestEcho;
      return {
        ...s,
        messages: [
          ...s.messages,
          ...(userLine ? [userLine] : []),
          ...turn.companionMessages,
        ],
        pipeline: turn.pipeline,
        fallbackCursor: s.fallbackCursor + 1,
      };
    },
    [activePersona, seed.fallbackTurns],
  );

  const handleSubmit = useCallback(
    async (msg: string) => {
      const userMessage: ThreadMessage = {
        id: `${activePersona}-user-${Date.now()}`,
        role: "guest",
        body: msg,
        timestamp: new Date().toISOString(),
      };
      const before = byPersona[activePersona];

      // Optimistically render the user message immediately.
      const optimistic: PersonaState = {
        ...before,
        messages: [...before.messages, userMessage],
      };
      setByPersona((prev) => ({ ...prev, [activePersona]: optimistic }));

      const req: CompanionTurnRequest = {
        guest_id: activePersona,
        message: msg,
        thread_state: buildThreadState(before),
        context: before.context,
        scenario_hint: `${activePersona}-turn-${before.fallbackCursor}`,
      };

      setInFlight(true);
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (agentMode === "live") headers["x-rosefield-mode"] = "live";
        const res = await fetch("/api/companion/turn", {
          method: "POST",
          headers,
          body: JSON.stringify(req),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as CompanionTurnResponse;
        setByPersona((prev) => ({
          ...prev,
          [activePersona]: {
            ...prev[activePersona],
            messages: [...prev[activePersona].messages, ...data.new_messages],
            pipeline: data.pipeline,
          },
        }));
      } catch {
        // API unavailable — advance through the canned turn sequence so the
        // UI works completely standalone. The user line is already optimistic;
        // pass undefined to avoid duplicating it.
        setByPersona((prev) => ({
          ...prev,
          [activePersona]: advanceFallback(prev[activePersona], undefined),
        }));
      } finally {
        setInFlight(false);
      }
    },
    [activePersona, agentMode, byPersona, buildThreadState, advanceFallback],
  );

  const handleConsent = useCallback(
    (messageId: string, action: ConsentAction) => {
      const noteBody =
        action === "yes"
          ? "Yes."
          : action === "no"
          ? "Not now."
          : "Adjust — softer.";
      // The consent action behaves like a free-text submission of `noteBody`,
      // wiring it into the same turn machinery. If `yes` advances to the
      // pipeline that contains routed_tasks, we'll flip consentGiven so the
      // Action Routing panel reads as LIVE.
      const next = activePersona;
      const userMessage: ThreadMessage = {
        id: `${next}-consent-${Date.now()}`,
        role: "guest",
        body: noteBody,
        timestamp: new Date().toISOString(),
        decision_id: messageId,
      };
      setByPersona((prev) => {
        const s = prev[next];
        const advanced = advanceFallback(
          { ...s, messages: [...s.messages, userMessage] },
          undefined,
        );
        return {
          ...prev,
          [next]: {
            ...advanced,
            consentGiven: action === "yes" ? true : advanced.consentGiven,
          },
        };
      });
    },
    [activePersona, advanceFallback],
  );

  const handlePersonaSwitch = useCallback((id: PersonaId) => {
    setActivePersona(id);
  }, []);

  // -------------------------------------------------------------------------
  // Proactive context triggers — when the operator scrubs the clock or flips
  // the weather, certain (persona, context) combos should fire a Companion-
  // initiated turn. For Liu, the demo-canonical trigger is: Saturday mid-day
  // with clearing skies → "fog has lifted earlier than expected" pivot.
  // -------------------------------------------------------------------------
  const lastProactiveKey = useRef<string | null>(null);

  const handleContextChange = useCallback(
    (ctx: ContextInput) => {
      updateActive({ context: ctx });

      // Liu weather pivot: only fire after the morning consent is in place
      // AND we haven't already pivoted for this context fingerprint.
      if (activePersona !== "liu") return;
      const personaState = byPersona.liu;
      if (!personaState.consentGiven) return;

      const isMiddayClear =
        (ctx.time === "11:00" || ctx.time === "12:00" || ctx.time === "15:00") &&
        (ctx.weather === "clear" || ctx.weather === "sun");
      if (!isMiddayClear) return;

      const fingerprint = `liu-weather-pivot|${ctx.time}|${ctx.weather}`;
      if (lastProactiveKey.current === fingerprint) return;
      lastProactiveKey.current = fingerprint;

      // Fire a proactive turn — no user message, scenario_hint drives the
      // pipeline. Body of the request just describes the trigger for traceability.
      void (async () => {
        const req: CompanionTurnRequest = {
          guest_id: "liu",
          message: "[context: weather cleared earlier than forecast]",
          thread_state: buildThreadState(personaState),
          context: ctx,
          scenario_hint: "liu-weather-pivot",
        };
        try {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (agentMode === "live") headers["x-rosefield-mode"] = "live";
          const res = await fetch("/api/companion/turn", {
            method: "POST",
            headers,
            body: JSON.stringify(req),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = (await res.json()) as CompanionTurnResponse;
          setByPersona((prev) => ({
            ...prev,
            liu: {
              ...prev.liu,
              messages: [...prev.liu.messages, ...data.new_messages],
              pipeline: data.pipeline,
              context: ctx,
            },
          }));
        } catch {
          // ignore — context still updated locally
        }
      })();
    },
    [activePersona, agentMode, byPersona, buildThreadState, updateActive],
  );

  const handleRevealMemory = useCallback(() => {
    if (seed.memory) updateActive({ showMemory: true });
  }, [seed.memory, updateActive]);

  const handleCloseMemory = useCallback(() => {
    updateActive({ showMemory: false });
  }, [updateActive]);

  // Auto-reveal the Memory Artifact when the Liu arc reaches its end-state
  // (consent given AND fallbackCursor has advanced past turn 3). The audience
  // gets the emotional close without the operator hitting the "Reveal" button.
  useEffect(() => {
    if (activePersona !== "liu") return;
    if (!seed.memory) return;
    if (!state.consentGiven) return;
    if (state.fallbackCursor < 3) return;
    if (state.showMemory) return;
    const t = window.setTimeout(() => {
      updateActive({ showMemory: true });
    }, 2200);
    return () => window.clearTimeout(t);
  }, [
    activePersona,
    seed.memory,
    state.consentGiven,
    state.fallbackCursor,
    state.showMemory,
    updateActive,
  ]);

  const awaitingConsentId = useMemo(() => {
    // Last companion message awaiting consent.
    for (let i = state.messages.length - 1; i >= 0; i--) {
      const m = state.messages[i];
      if (m.role === "companion" && m.consent_required) return m.id;
      if (m.role === "guest" && i < state.messages.length - 1) break;
    }
    return null;
  }, [state.messages]);

  return (
    <div className="h-screen flex flex-col bg-surface-canvas text-content-primary">
      {/* ----------- Top bar ----------- */}
      <header className="shrink-0 border-b border-line-hairline px-section py-stack">
        <div className="flex flex-wrap items-center justify-between gap-stack">
          <div className="flex items-baseline gap-inline">
            <span className="text-micro uppercase tracking-wide text-content-tertiary">
              Cultural Resonance
            </span>
            <span className="text-content-tertiary">·</span>
            <span className="text-micro uppercase tracking-wide text-content-secondary">
              Rosewood Sand Hill
            </span>
            <span className="text-content-tertiary">·</span>
            <span className="text-micro uppercase tracking-wide text-accent-signature">
              Live
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-section">
            <PersonaSwitcher active={activePersona} onSwitch={handlePersonaSwitch} />
            <ModeToggle mode={agentMode} onChange={setAgentMode} />
            <ContextControls context={state.context} onChange={handleContextChange} />
            <Link
              href="/simulate"
              className={[
                "border border-line-hairline bg-transparent",
                "px-4 py-2 text-micro uppercase tracking-wide",
                "text-accent-signature",
                "hover:bg-surface-sunken transition-colors duration-base ease-quiet",
                "focus:outline-none focus-visible:border-line-emphasis",
              ].join(" ")}
            >
              Simulation →
            </Link>
            {seed.memory && (
              <button
                type="button"
                onClick={handleRevealMemory}
                className={[
                  "border border-line-hairline bg-transparent",
                  "px-4 py-2 text-micro uppercase tracking-wide",
                  "text-accent-signature",
                  "hover:bg-surface-sunken transition-colors duration-base ease-quiet",
                  "focus:outline-none focus-visible:border-line-emphasis",
                ].join(" ")}
              >
                Reveal memory
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ----------- Split screen ----------- */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2">
        {/* ---- Guest Companion ---- */}
        <div
          data-density="guest"
          className="relative min-h-0 overflow-y-auto border-b lg:border-b-0 lg:border-r border-line-hairline bg-surface-canvas"
        >
          <div className="px-canvas-x py-canvas-y flex flex-col gap-section min-h-full">
            <div className="flex items-center justify-between border-b border-line-hairline pb-stack">
              <div className="flex items-center gap-stack">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center border border-line-hairline bg-surface-raised font-serif text-body-lg text-accent-signature"
                >
                  R
                </span>
                <div className="flex flex-col">
                  <h2 className="text-heading-md font-serif text-content-primary leading-none">
                    Rosewood Sand Hill
                  </h2>
                  <span className="mt-1 text-micro uppercase tracking-wide text-content-tertiary">
                    Concierge
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-micro uppercase tracking-wide text-content-tertiary">
                <span className="block h-1.5 w-1.5 rounded-full bg-accent-signature" />
                Available
              </span>
            </div>

            <CompanionThread
              messages={state.messages}
              onConsent={handleConsent}
              awaitingConsentId={awaitingConsentId}
              inFlight={inFlight}
            />

            <div className="mt-auto">
              <CompanionInput onSubmit={handleSubmit} />
            </div>
          </div>

          {state.showMemory && (
            <MemoryArtifact memory={seed.memory} onClose={handleCloseMemory} />
          )}
        </div>

        {/* ---- Operations Theater ---- */}
        <div
          data-density="staff"
          className="min-h-0 overflow-y-auto bg-surface-canvas"
        >
          <div className="px-canvas-x py-canvas-y flex flex-col gap-section min-h-full">
            <div className="flex items-baseline justify-between">
              <h2 className="text-heading-lg font-serif text-content-primary">
                Operations Theater
              </h2>
              <span className="text-micro uppercase tracking-wide text-content-tertiary">
                {state.pipeline?.source === "live" ? "Live agents" : "Mocked agents"}
              </span>
            </div>

            <TheaterStack
              pipeline={state.pipeline}
              guestName={seed.name}
              actionsLive={state.consentGiven}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
