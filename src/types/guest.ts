/**
 * Core domain types for the guest list & multi-event RSVP flow.
 * Keep this the single source of truth for these shapes — both the
 * Supabase-backed service layer and the UI depend on it.
 */

export type RsvpStatus = "pending" | "attending" | "declined";

export type EventSlug = "nikkah" | "shaadi" | "valima";

export type GuestSide = "groom" | "bride";

/** A guest is a party/invitation-holder — one row per family/household, not per person. */
export interface Guest {
  id: string;
  primaryGuestName: string;
  /** Which side of the family invited this guest. Unset until they (or you) choose it. */
  side: GuestSide | null;
}

/** One guest's RSVP status for a single event (Nikkah, Shaadi, or Valima). */
export interface Invitation {
  id: string;
  eventSlug: EventSlug;
  allowedGuestCount: number;
  guestNames: string[];
  rsvpStatus: RsvpStatus;
  attendingCount?: number;
  notes?: string;
  respondedAt?: string;
}

/** Lightweight, non-identifying record returned by a name search. */
export interface GuestSearchResult {
  id: string;
  primaryGuestName: string;
  invitationCount: number;
}

export type GuestLookupOutcome =
  | { kind: "none" }
  | { kind: "single"; guest: Guest; invitations: Invitation[] }
  | { kind: "multiple"; candidates: GuestSearchResult[] };

export interface RsvpSubmission {
  invitationId: string;
  attending: boolean;
  attendeeNames: string[];
  notes?: string;
}
