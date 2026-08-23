/**
 * Core domain types for the guest list & RSVP flow.
 * Keep this the single source of truth for the shape of a guest record —
 * both the mock data layer and any future backend (Supabase/Firebase/etc.)
 * should conform to this shape.
 */

export type RsvpStatus = "pending" | "attending" | "declined";

export interface Guest {
  /** Stable unique identifier. Never derived from name — safe to use as a DB key. */
  id: string;
  /** Full name as it should be displayed, e.g. "Amaan Ghoghawala". */
  primaryGuestName: string;
  /** Maximum number of people (including the primary guest) this invitation covers. */
  allowedGuestCount: number;
  /** Names of everyone attending, filled in once the RSVP is submitted (primary guest included). */
  guestNames: string[];
  /** Current RSVP state. Starts "pending" until the guest responds. */
  rsvpStatus: RsvpStatus;
  /** How many of the allowed seats are actually attending. Set on submit. */
  attendingCount?: number;
  /** Optional freeform note from the guest (dietary needs, well-wishes, etc). */
  notes?: string;
  /** ISO 8601 timestamp of when the RSVP was last submitted/updated. */
  respondedAt?: string;
}

/** Lightweight, non-identifying record returned by a name search — never leaks other guests' data. */
export interface GuestSearchResult {
  id: string;
  primaryGuestName: string;
  allowedGuestCount: number;
  rsvpStatus: RsvpStatus;
}

export interface RsvpSubmission {
  guestId: string;
  attending: boolean;
  attendeeNames: string[];
  notes?: string;
}

export type GuestLookupOutcome =
  | { kind: "none" }
  | { kind: "single"; guest: Guest }
  | { kind: "multiple"; candidates: GuestSearchResult[] };
