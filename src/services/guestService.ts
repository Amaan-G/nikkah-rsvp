import { supabase } from "../lib/supabaseClient";
import type {
  EventSlug,
  Guest,
  GuestLookupOutcome,
  GuestSearchResult,
  GuestSide,
  Invitation,
  RsvpStatus,
  RsvpSubmission,
} from "../types/guest";

/**
 * ============================================================================
 *  GUEST SERVICE — the only module the UI talks to for guest/RSVP data.
 * ============================================================================
 * Backed by Supabase. See supabase/schema.sql for the tables/RPC
 * functions/RLS policies this talks to, and README.md for setup.
 *
 * Privacy is enforced in Postgres, not just in this file: the anon key used
 * here has no direct SELECT/UPDATE grant on `guests` or `invitations` (see
 * the `revoke all` in schema.sql) — every read/write goes through a
 * SECURITY DEFINER RPC function that only ever returns the minimal fields a
 * guest needs. A name search returns no invitation details; a guest's full
 * invitations are only fetched by an unguessable uuid after an unambiguous
 * match.
 */

interface SearchRow {
  id: string;
  primary_guest_name: string;
  invitation_count: number;
}

interface InvitationJson {
  id: string;
  event_slug: EventSlug;
  allowed_guest_count: number;
  guest_names: string[] | null;
  rsvp_status: RsvpStatus;
  attending_count: number | null;
  notes: string | null;
  responded_at: string | null;
}

interface GuestWithInvitationsJson {
  id: string;
  primary_guest_name: string;
  side: GuestSide | null;
  invitations: InvitationJson[];
}

function mapInvitation(row: InvitationJson): Invitation {
  return {
    id: row.id,
    eventSlug: row.event_slug,
    allowedGuestCount: row.allowed_guest_count,
    guestNames: row.guest_names ?? [],
    rsvpStatus: row.rsvp_status,
    attendingCount: row.attending_count ?? undefined,
    notes: row.notes ?? undefined,
    respondedAt: row.responded_at ?? undefined,
  };
}

function mapGuest(json: GuestWithInvitationsJson): {
  guest: Guest;
  invitations: Invitation[];
} {
  return {
    guest: {
      id: json.id,
      primaryGuestName: json.primary_guest_name,
      side: json.side,
    },
    invitations: json.invitations.map(mapInvitation),
  };
}

function mapSearchRow(row: SearchRow): GuestSearchResult {
  return {
    id: row.id,
    primaryGuestName: row.primary_guest_name,
    invitationCount: row.invitation_count,
  };
}

export class RsvpValidationError extends Error {}

export async function searchGuestsByName(
  fullName: string,
): Promise<GuestLookupOutcome> {
  const trimmed = fullName.trim();
  if (trimmed.length < 2) return { kind: "none" };

  const { data, error } = await supabase.rpc("search_guests", {
    query: trimmed,
  });

  if (error) {
    throw new Error("Something went wrong searching for your invitation.");
  }

  const rows = (data ?? []) as SearchRow[];
  if (rows.length === 0) return { kind: "none" };

  if (rows.length === 1) {
    const result = await getGuestWithInvitations(rows[0].id);
    if (!result) return { kind: "none" };
    return { kind: "single", guest: result.guest, invitations: result.invitations };
  }

  return { kind: "multiple", candidates: rows.map(mapSearchRow) };
}

export async function getGuestWithInvitations(
  guestId: string,
): Promise<{ guest: Guest; invitations: Invitation[] } | null> {
  const { data, error } = await supabase.rpc("get_guest_with_invitations", {
    p_guest_id: guestId,
  });

  if (error || !data) return null;
  return mapGuest(data as GuestWithInvitationsJson);
}

export async function setGuestSide(
  guestId: string,
  side: GuestSide,
): Promise<Guest> {
  const { data, error } = await supabase.rpc("set_guest_side", {
    p_guest_id: guestId,
    p_side: side,
  });

  if (error || !data || data.length === 0) {
    throw new Error("Couldn't save that — please try again.");
  }

  const row = data[0] as { id: string; primary_guest_name: string; side: GuestSide | null };
  return { id: row.id, primaryGuestName: row.primary_guest_name, side: row.side };
}

export async function submitRsvp(submission: RsvpSubmission): Promise<Invitation> {
  if (submission.attending) {
    if (
      submission.attendeeNames.length < 1 ||
      submission.attendeeNames.some((n) => !n.trim())
    ) {
      throw new RsvpValidationError("Every guest needs a name.");
    }
  }

  const { data, error } = await supabase.rpc("submit_rsvp", {
    p_invitation_id: submission.invitationId,
    p_attending: submission.attending,
    p_attendee_names: submission.attending ? submission.attendeeNames : [],
    p_notes: submission.notes ?? "",
  });

  if (error) {
    throw new RsvpValidationError(
      error.message || "We couldn't submit your RSVP. Please try again.",
    );
  }

  if (!data || data.length === 0) {
    throw new RsvpValidationError("We couldn't submit your RSVP. Please try again.");
  }

  return mapInvitation(data[0] as InvitationJson);
}
