import type { Guest } from "../types/guest";

/**
 * ============================================================================
 *  GUEST LIST — add one entry per invitation (a party, not a person).
 * ============================================================================
 * `id` — any unique string, e.g. "guest-001", "guest-002", ...
 * `primaryGuestName` — full name exactly as the guest will type it to search.
 * `allowedGuestCount` — the hard seat cap for that invitation.
 * `guestNames` and `rsvpStatus` — leave as `[]` / `"pending"`; the site fills
 *   these in automatically once the guest submits their RSVP.
 *
 * See src/services/guestService.ts for how this is consumed, and its header
 * comment for how to swap this out for Supabase, Firebase, or another
 * backend once you're ready to go live.
 */
export const guests: Guest[] = [
  {
    id: "guest-001",
    primaryGuestName: "Amaan Ghoghawala",
    allowedGuestCount: 4,
    guestNames: [],
    rsvpStatus: "pending",
  },
];
