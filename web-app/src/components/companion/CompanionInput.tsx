"use client";

import { useRef, useState, type FormEvent } from "react";
import { useSpeechRecognition } from "@/lib/voice/use-speech-recognition";

interface CompanionInputProps {
  onSubmit: (msg: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  /** BCP-47 tag for the recognizer; passed through to useSpeechRecognition. */
  speechLang?: string;
}

export function CompanionInput({
  onSubmit,
  disabled = false,
  placeholder = "Message Sand Hill…",
  speechLang,
}: CompanionInputProps) {
  const [value, setValue] = useState("");
  const [inFlight, setInFlight] = useState(false);
  // Tracks whether the latest mic session was committed by the user, so we
  // can auto-submit when onFinal fires.
  const autoSubmitRef = useRef(false);

  const speech = useSpeechRecognition({
    lang: speechLang,
    onFinal: (transcript) => {
      // Surface the transcript even if the user manually stopped mid-stream,
      // then auto-submit only when the user committed via the second mic tap.
      setValue(transcript);
      if (autoSubmitRef.current) {
        autoSubmitRef.current = false;
        void submitWith(transcript);
      }
    },
  });

  // While the user is speaking, render the live transcript directly from the
  // hook (derived state — avoids mirroring into local state inside an effect).
  const displayValue = speech.isListening ? speech.transcript : value;

  const isDisabled = disabled || inFlight;

  async function submitWith(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || isDisabled) return;
    setInFlight(true);
    setValue("");
    try {
      await onSubmit(trimmed);
    } finally {
      setInFlight(false);
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await submitWith(value);
  };

  const handleVoice = () => {
    if (isDisabled || !speech.isSupported) return;
    if (speech.isListening) {
      // User tapped the mic to commit — auto-submit when the final result arrives.
      autoSubmitRef.current = true;
      speech.stop();
      return;
    }
    autoSubmitRef.current = false;
    setValue("");
    speech.reset();
    speech.start();
  };

  const voiceTitle = !speech.isSupported
    ? "Voice input unsupported in this browser"
    : speech.isListening
      ? "Tap to stop and send"
      : "Tap to speak";

  const canSend = displayValue.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-hairline-gap"
    >
      <div className="flex items-center gap-inline border border-line-hairline bg-surface-raised px-3 py-2">
        <button
          type="button"
          onClick={handleVoice}
          disabled={isDisabled || !speech.isSupported}
          title={voiceTitle}
          aria-label={voiceTitle}
          aria-pressed={speech.isListening}
          className={[
            "shrink-0 flex h-8 w-8 items-center justify-center",
            "rounded-full transition-colors duration-base ease-quiet",
            speech.isListening
              ? "text-accent-signature bg-surface-sunken"
              : "text-content-tertiary hover:text-content-primary hover:bg-surface-sunken",
            "disabled:text-content-disabled disabled:cursor-not-allowed disabled:hover:bg-transparent",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {speech.isListening ? (
            <span className="block h-2 w-2 rounded-full bg-current animate-pulse" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="5" y="1.5" width="4" height="7" rx="2" fill="currentColor" />
              <path
                d="M3 7a4 4 0 008 0M7 11v1.5"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>

        <input
          type="text"
          value={displayValue}
          onChange={(e) => setValue(e.target.value)}
          placeholder={speech.isListening ? "Listening…" : placeholder}
          disabled={isDisabled || speech.isListening}
          aria-label="Message Sand Hill"
          className={[
            "flex-1 bg-transparent",
            "px-1 py-1.5",
            "font-serif text-body-lg text-content-primary",
            "placeholder:text-content-tertiary placeholder:italic",
            "focus:outline-none",
            "disabled:text-content-disabled",
          ].join(" ")}
        />

        <button
          type="submit"
          disabled={isDisabled || !canSend}
          aria-label={inFlight ? "Sending" : "Send message"}
          className={[
            "shrink-0 flex h-8 w-8 items-center justify-center",
            "rounded-full transition-colors duration-base ease-quiet",
            canSend
              ? "text-accent-signature hover:bg-surface-sunken"
              : "text-content-disabled cursor-not-allowed",
            "focus:outline-none focus-visible:bg-surface-sunken",
          ].join(" ")}
        >
          {inFlight ? (
            <span className="text-micro tracking-wide">…</span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2 7h9M7.5 3.5L11 7l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
      {speech.error && (
        <span className="text-micro uppercase tracking-wide text-content-tertiary">
          Voice: {speech.error}
        </span>
      )}
    </form>
  );
}

