"use client";

import { useState, type FormEvent } from "react";

interface CompanionInputProps {
  onSubmit: (msg: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function CompanionInput({
  onSubmit,
  disabled = false,
  placeholder = "Write to the Companion…",
}: CompanionInputProps) {
  const [value, setValue] = useState("");
  const [inFlight, setInFlight] = useState(false);

  const isDisabled = disabled || inFlight;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    setInFlight(true);
    setValue("");
    try {
      await onSubmit(trimmed);
    } finally {
      setInFlight(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-inline border-t border-line-hairline pt-stack"
    >
      <button
        type="button"
        disabled
        title="Voice input — cut from this build"
        aria-label="Voice input — cut from this build"
        className={[
          "shrink-0 border border-line-hairline bg-transparent",
          "px-3 py-2 text-micro uppercase tracking-wide",
          "text-content-disabled cursor-not-allowed",
        ].join(" ")}
      >
        Voice
      </button>

      <div className="flex flex-1 flex-col">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={isDisabled}
          className={[
            "w-full bg-surface-raised",
            "border-b border-line-hairline",
            "px-2 py-3",
            "font-serif text-body-lg text-content-primary",
            "placeholder:text-content-tertiary",
            "focus:outline-none focus:border-line-emphasis",
            "disabled:text-content-disabled",
          ].join(" ")}
        />
      </div>

      <button
        type="submit"
        disabled={isDisabled || value.trim().length === 0}
        className={[
          "shrink-0 border border-line-hairline bg-transparent",
          "px-5 py-2 text-micro uppercase tracking-wide",
          "text-accent-signature",
          "transition-colors duration-base ease-quiet",
          "hover:bg-surface-sunken",
          "focus:outline-none focus-visible:border-line-emphasis",
          "disabled:text-content-disabled disabled:cursor-not-allowed",
        ].join(" ")}
      >
        {inFlight ? "…" : "Send"}
      </button>
    </form>
  );
}
