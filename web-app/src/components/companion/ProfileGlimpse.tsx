"use client";

import type { ProfileHubOutput } from "@/lib/types";

interface ProfileGlimpseProps {
  profile?: ProfileHubOutput;
  guestName?: string;
}

// Prose-first summary card. Hairline-bordered, surface-raised. Sits below the
// thread on the left rail, mirroring the wireframe in docs/02 §7.
export function ProfileGlimpse({ profile, guestName }: ProfileGlimpseProps) {
  if (!profile) {
    return (
      <aside className="border border-line-hairline bg-surface-raised px-5 py-4">
        <p className="text-micro uppercase tracking-wide text-content-tertiary">
          Profile glimpse
        </p>
        <p className="mt-hairline-gap text-body-sm text-content-tertiary font-serif italic">
          The profile fills in as the Companion learns.
        </p>
      </aside>
    );
  }

  const spouse = profile.family.find((f) => f.relation === "spouse" || f.relation === "partner");
  const extras = profile.family.filter((f) => f !== spouse);

  // Prose-first paragraph (Net-a-Porter EIP rule per docs/02 §3).
  const sentences: string[] = [];
  if (guestName) sentences.push(`${guestName}.`);
  if (profile.occasion) sentences.push(`${profile.occasion}.`);
  sentences.push(`Lens: ${profile.cultural_lens}, ${profile.current_phase.toLowerCase()}.`);
  if (spouse) {
    sentences.push(`With ${spouse.name}${spouse.origin ? ` from ${spouse.origin}` : ""}.`);
  }
  if (extras.length > 0) {
    sentences.push(`${extras.length} additional family branch${extras.length === 1 ? "" : "es"} linked.`);
  }
  sentences.push(`Pace: ${profile.pace_tag}.`);
  if (profile.prior_stay_count > 0) {
    sentences.push(`${profile.prior_stay_count} prior stay${profile.prior_stay_count === 1 ? "" : "s"}.`);
  } else {
    sentences.push("First stay.");
  }

  return (
    <aside className="border border-line-hairline bg-surface-raised px-5 py-4">
      <p className="text-micro uppercase tracking-wide text-content-tertiary">
        Profile glimpse
      </p>
      <p className="mt-hairline-gap text-body-sm text-content-primary font-serif leading-relaxed">
        {sentences.join(" ")}
      </p>
    </aside>
  );
}
