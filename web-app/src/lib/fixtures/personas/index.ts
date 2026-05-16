// Persona registry — lookup by guest_id used in API requests.

import type { GuestProfile } from "@/lib/types";
import { liuProfile } from "./liu";
import { sarahProfile } from "./sarah";
import { patelProfile } from "./patel";

export const personas: Record<string, GuestProfile> = {
  liu: liuProfile,
  sarah: sarahProfile,
  patel: patelProfile,
};

export function getPersona(guestId: string): GuestProfile | null {
  return personas[guestId] ?? null;
}

export { liuProfile, sarahProfile, patelProfile };
