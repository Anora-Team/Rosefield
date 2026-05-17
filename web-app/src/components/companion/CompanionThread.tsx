"use client";

import type { ThreadMessage } from "@/lib/types";
import { ConsentAffordance, type ConsentAction } from "./ConsentAffordance";
import { useTts } from "@/lib/voice/use-tts";

interface CompanionThreadProps {
  messages: ThreadMessage[];
  onConsent?: (messageId: string, action: ConsentAction) => void;
  awaitingConsentId?: string | null;
  inFlight?: boolean;
}

function formatStamp(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function CompanionThread({
  messages,
  onConsent,
  awaitingConsentId,
  inFlight = false,
}: CompanionThreadProps) {
  const tts = useTts();

  return (
    <ol className="flex flex-col gap-stack">
      {messages.map((msg) => {
        const isGuest = msg.role === "guest";
        const consentActive =
          !isGuest &&
          msg.consent_required === true &&
          (!awaitingConsentId || awaitingConsentId === msg.id);

        const isActiveTts = tts.activeId === msg.id;
        const ttsBusy = isActiveTts && tts.status === "loading";
        const ttsPlaying = isActiveTts && tts.status === "playing";
        const ttsTitle = ttsBusy ? "Loading voice…" : ttsPlaying ? "Stop" : "Play aloud";
        const stamp = formatStamp(msg.timestamp);

        return (
          <li
            key={msg.id}
            className={[
              "flex flex-col",
              isGuest ? "items-end" : "items-start",
            ].join(" ")}
          >
            <div
              className={[
                "group relative max-w-[36ch]",
                "border border-line-hairline",
                isGuest ? "bg-surface-sunken" : "bg-surface-raised",
                "px-5 py-4",
              ].join(" ")}
            >
              <p className="text-body-lg text-content-primary font-serif leading-snug">
                {msg.body}
              </p>

              {!isGuest && msg.body && (
                <button
                  type="button"
                  onClick={() => {
                    if (isActiveTts && tts.status !== "idle") {
                      tts.stop();
                    } else {
                      void tts.play(msg.id, msg.body);
                    }
                  }}
                  disabled={ttsBusy}
                  title={ttsTitle}
                  aria-label={`${ttsTitle} this concierge message`}
                  className={[
                    "absolute -bottom-2 right-3 translate-y-full",
                    "flex h-6 w-6 items-center justify-center",
                    "border border-line-hairline bg-surface-canvas",
                    "transition-opacity duration-base ease-quiet",
                    ttsPlaying || ttsBusy
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100",
                    ttsPlaying
                      ? "text-accent-signature"
                      : "text-content-tertiary hover:text-content-primary",
                    "disabled:text-content-disabled disabled:cursor-not-allowed",
                  ].join(" ")}
                >
                  {ttsPlaying ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                      <rect x="1" y="1" width="8" height="8" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 4h2l3-2v8L4 8H2V4z" fill="currentColor" />
                      <path
                        d="M8.5 4a2.5 2.5 0 010 4"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              )}

              {isActiveTts && tts.status === "error" && (
                <p className="mt-hairline-gap text-micro uppercase tracking-wide text-content-tertiary">
                  Voice unavailable
                </p>
              )}

              {consentActive && onConsent && (
                <ConsentAffordance
                  onAction={(action) => onConsent(msg.id, action)}
                  disabled={inFlight}
                />
              )}
            </div>

            {stamp && (
              <p className="mt-hairline-gap px-1 text-micro tracking-wide text-content-tertiary tabular-nums">
                {stamp}
              </p>
            )}
          </li>
        );
      })}

      {inFlight && (
        <li className="flex items-start">
          <div
            className="border border-line-hairline bg-surface-raised px-5 py-4"
            aria-label="Concierge is composing"
          >
            <span className="inline-flex items-center gap-1 text-content-tertiary">
              <span className="block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              <span className="block h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
              <span className="block h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:300ms]" />
            </span>
          </div>
        </li>
      )}
    </ol>
  );
}
