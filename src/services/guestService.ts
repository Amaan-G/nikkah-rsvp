import { supabase } from "../lib/supabaseClient";
import type {
  Guest,
  GuestLookupOutcome,
  GuestSearchResult,
  RsvpStatus,
  RsvpSubmission,
} from "../types/guest";

/**
 * ============================================================================
 *  GUEST SERVICE — the only module the UI talks to for guest/RSVP data.
 * ============================================================================
 * Backed by Supabase. The three exported functions (searchGuestsByName,
 * getGuestById, submitRsvp) are the entire contract the UI depends on — see
 * supabase/schema.sql for the tables/RPC functions/RLS policies this talks
 * to, and README.md for setup instructions.
 *
 * Privacy is enforced in Postgres, not just in this file: the anon key used
 * here has no direct SELECT/UPDATE grant on the `guests` table (see the
 * `revoke all` in schema.sql) — every read/write goes through a
 * SECURITY DEFINER RPC function that only ever returns the minimal fields a
 * guest needs (a name search returns no notes/guest_names; a full record is
 * only fetched by an unguessable uuid after an unambiguous match).
 */

interface GuestRow {
  id: string;
  primary_guest_name: string;
  allowed_guest_count: number;
  guest_names: string[] | null;
  rsvp_status: RsvpStatus;
  attending_count: number | null;
  notes: string | null;
  responded_at: string | null;
}

interface SearchRow {
  id: string;
  primary_guest_name: string;
  allowed_guest_count: number;
  rsvp_status: RsvpStatus;
}

function mapGuestRow(row: GuestRow): Guest {
  return {
    id: row.id,
    primaryGuestName: row.primary_guest_name,
    allowedGuestCount: row.allowed_guest_count,
    guestNames: row.guest_names ?? [],
    rsvpStatus: row.rsvp_status,
    attendingCount: row.attending_count ?? undefined,
    notes: row.notes ?? undefined,
    respondedAt: row.responded_at ?? undefined,
  };
}

function mapSearchRow(row: SearchRow): GuestSearchResult {
  return {
    id: row.id,
    primaryGuestName: row.primary_guest_name,
    allowedGuestCount: row.allowed_guest_count,
    rsvpStatus: row.rsvp_status,
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
    const guest = await getGuestById(rows[0].id);
    if (!guest) return { kind: "none" };
    return { kind: "single", guest };
  }

  return { kind: "multiple", candidates: rows.map(mapSearchRow) };
}

export async function getGuestById(id: string): Promise<Guest | null> {
  const { data, error } = await supabase.rpc("get_guest_by_id", {
    guest_id: id,
  });

  if (error || !data || data.length === 0) return null;
  return mapGuestRow(data[0] as GuestRow);
}

export async function submitRsvp(submission: RsvpSubmission): Promise<Guest> {
  if (submission.attending) {
    const count = submission.attendeeNames.length;
    if (count < 1 || submission.attendeeNames.some((n) => !n.trim())) {
      throw new RsvpValidationError("Every guest needs a name.");
    }
  }

  const { data, error } = await supabase.rpc("submit_rsvp", {
    p_guest_id: submission.guestId,
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

  return mapGuestRow(data[0] as GuestRow);
}
