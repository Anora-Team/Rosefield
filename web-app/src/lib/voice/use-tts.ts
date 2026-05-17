"use client";

// Posts text to /api/voice/tts and plays back the streamed MPEG audio.
// Tracks a single active utterance — calling `play` on a second message
// cancels the first. The Companion's restraint-tuned design means we never
// stack speech.

import { useCallback, useEffect, useRef, useState } from "react";

export type TtsStatus = "idle" | "loading" | "playing" | "error";

export interface UseTtsResult {
  /** The id of the message currently being processed or played. */
  activeId: string | null;
  status: TtsStatus;
  error: string | null;
  /** Begin playback. Cancels any prior utterance. */
  play: (id: string, text: string, opts?: { language_code?: string }) => Promise<void>;
  stop: () => void;
}

export function useTts(): UseTtsResult {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<TtsStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  // Each call gets a monotonically increasing token; if a newer call starts
  // while we're awaiting fetch/decode, the older one bails out before mutating
  // state.
  const tokenRef = useRef(0);

  const teardown = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    tokenRef.current += 1; // invalidate any in-flight play()
    teardown();
    setActiveId(null);
    setStatus("idle");
  }, [teardown]);

  const play = useCallback(
    async (id: string, text: string, opts?: { language_code?: string }) => {
      const myToken = ++tokenRef.current;
      teardown();
      setActiveId(id);
      setStatus("loading");
      setError(null);

      try {
        const res = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language_code: opts?.language_code }),
        });
        if (myToken !== tokenRef.current) return; // superseded
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status}${detail ? `: ${detail}` : ""}`);
        }
        // We let the audio element handle progressive playback by handing it
        // an object URL backed by the fully-buffered Blob. Streaming MSE is
        // overkill for this demo and ElevenLabs typically returns the full
        // payload in well under a second on turbo_v2_5.
        const blob = await res.blob();
        if (myToken !== tokenRef.current) return;
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onplaying = () => {
          if (myToken === tokenRef.current) setStatus("playing");
        };
        audio.onended = () => {
          if (myToken !== tokenRef.current) return;
          setStatus("idle");
          setActiveId(null);
          teardown();
        };
        audio.onerror = () => {
          if (myToken !== tokenRef.current) return;
          setStatus("error");
          setError("audio_playback_failed");
        };
        await audio.play();
      } catch (err) {
        if (myToken !== tokenRef.current) return;
        setStatus("error");
        setError((err as Error).message);
        setActiveId(null);
        teardown();
      }
    },
    [teardown],
  );

  // Tear down on unmount.
  useEffect(() => {
    return () => {
      tokenRef.current += 1;
      teardown();
    };
  }, [teardown]);

  return { activeId, status, error, play, stop };
}
