"use client";

// Thin React wrapper around the browser SpeechRecognition API (Chrome/Edge/
// Safari prefix `webkit`). Free, low-latency, no API key. Falls back to
// `isSupported = false` everywhere else; the caller is expected to disable
// the mic affordance in that case.

import { useCallback, useEffect, useRef, useState } from "react";

// The DOM lib doesn't declare these on `Window` because the API is still
// vendor-prefixed. Declare just enough to type our usage.
interface SpeechRecognitionEventAlt extends Event {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}
interface SpeechRecognitionErrorEventAlt extends Event {
  error: string;
  message?: string;
}
interface SpeechRecognitionAlt extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: SpeechRecognitionEventAlt) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventAlt) => void) | null;
  onend: ((ev: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionAlt;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export interface UseSpeechRecognitionOptions {
  /** BCP-47 tag, e.g. "en-US", "zh-CN". Defaults to navigator.language. */
  lang?: string;
  /** Fires once a final transcript is available (typically when the user pauses). */
  onFinal?: (transcript: string) => void;
}

export interface UseSpeechRecognitionResult {
  isSupported: boolean;
  isListening: boolean;
  /** Interim + finalized transcript, updated as the user speaks. */
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(
  opts: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionResult {
  const Ctor = getCtor();
  const isSupported = Ctor !== null;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionAlt | null>(null);
  const finalRef = useRef<string>("");
  // Latest onFinal callback so we can reference it without re-binding the
  // recognition instance on every render.
  const onFinalRef = useRef(opts.onFinal);
  useEffect(() => {
    onFinalRef.current = opts.onFinal;
  }, [opts.onFinal]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    finalRef.current = "";
    setTranscript("");
    setError(null);
  }, []);

  const start = useCallback(() => {
    if (!Ctor) {
      setError("speech_recognition_unsupported");
      return;
    }
    // Tear down any prior instance.
    recognitionRef.current?.abort();
    finalRef.current = "";
    setTranscript("");
    setError(null);

    const r = new Ctor();
    r.lang = opts.lang ?? (typeof navigator !== "undefined" ? navigator.language : "en-US");
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (ev) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i];
        const chunk = result[0].transcript;
        if (result.isFinal) {
          finalRef.current = (finalRef.current + " " + chunk).trim();
        } else {
          interim += chunk;
        }
      }
      const combined = [finalRef.current, interim.trim()].filter(Boolean).join(" ");
      setTranscript(combined);
    };
    r.onerror = (ev) => {
      // "no-speech" and "aborted" are not real errors for a demo; swallow.
      if (ev.error === "no-speech" || ev.error === "aborted") return;
      setError(ev.error || "speech_error");
    };
    r.onend = () => {
      setIsListening(false);
      const final = finalRef.current.trim();
      if (final && onFinalRef.current) onFinalRef.current(final);
    };

    recognitionRef.current = r;
    try {
      r.start();
      setIsListening(true);
    } catch (err) {
      setError((err as Error).message);
      setIsListening(false);
    }
  }, [Ctor, opts.lang]);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  return { isSupported, isListening, transcript, error, start, stop, reset };
}
