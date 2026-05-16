"use client";

import type { ThreadMessage } from "@/lib/types";
import { ConsentAffordance, type ConsentAction } from "./ConsentAffordance";

interface CompanionThreadProps {
  messages: ThreadMessage[];
  onConsent?: (messageId: string, action: ConsentAction) => void;
  awaitingConsentId?: string | null;
  inFlight?: boolean;
}

export function CompanionThread({
  messages,
  onConsent,
  awaitingConsentId,
  inFlight = false,
}: CompanionThreadProps) {
  return (
    <ol className="flex flex-col gap-stack">
      {messages.map((msg) => {
        const isGuest = msg.role === "guest";
        const speakerLabel = isGuest ? "Guest" : "Companion";
        const consentActive =
          !isGuest &&
          msg.consent_required === true &&
          (!awaitingConsentId || awaitingConsentId === msg.id);

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
                "max-w-[36ch]",
                "border border-line-hairline",
                isGuest ? "bg-surface-sunken" : "bg-surface-raised",
                "px-5 py-4",
              ].join(" ")}
            >
              <p className="text-micro uppercase tracking-wide text-content-tertiary">
                {speakerLabel}
              </p>
              <p className="mt-hairline-gap text-body-lg text-content-primary font-serif">
                {msg.body}
              </p>
              {consentActive && onConsent && (
                <ConsentAffordance
                  onAction={(action) => onConsent(msg.id, action)}
                  disabled={inFlight}
                />
              )}
            </div>
          </li>
        );
      })}
      {inFlight && (
        <li className="flex items-start">
          <div className="px-5 py-4 text-micro uppercase tracking-wide text-content-tertiary">
            Companion is composing…
          </div>
        </li>
      )}
    </ol>
  );
}
