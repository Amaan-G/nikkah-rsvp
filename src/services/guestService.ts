import { guests as seedGuests } from "../data/guests";
import type {
  Guest,
  GuestLookupOutcome,
  GuestSearchResult,
  RsvpSubmission,
} from "../types/guest";

/**
 * ============================================================================
 *  GUEST SERVICE — the only module the UI talks to for guest/RSVP data.
 * ============================================================================
 * Everything below is written against the mock data in `src/data/guests.ts`,
 * but the public functions (searchGuestsByName, getGuestById, submitRsvp)
 * are the entire contract the UI depends on. Swap the implementation for a
 * real backend without touching a single component.
 *
 * ---- Moving to Supabase ------------------------------------------------
 * 1. Create a `guests` table with columns matching `Guest` in
 *    src/types/guest.ts (id uuid pk, primary_guest_name text,
 *    allowed_guest_count int, guest_names text[], rsvp_status text,
 *    attending_count int, notes text, responded_at timestamptz).
 * 2. Add a Postgres function (RPC) like `search_guests(query text)` that
 *    does the name matching server-side and returns only the lightweight
 *    GuestSearchResult columns — never `select *` from the client, so a
 *    guest can never enumerate the full table.
 * 3. Enable Row Level Security and only allow the RPC + a `submit_rsvp`
 *    RPC to be called from the anon key; block direct table access.
 * 4. Replace the bodies of the three exported functions here with calls to
 *    `supabase.rpc(...)`, keeping the same signatures.
 *
 * ---- Moving to Firebase --------------------------------------------------
 * 1. Store guests as documents in a `guests` Firestore collection.
 * 2. Because Firestore queries are client-visible, do name matching inside
 *    a Cloud Function (callable function) rather than querying the
 *    collection directly from the browser — same reasoning as the RLS note
 *    above: never let the client pull the whole guest list.
 * 3. Call that callable function from `searchGuestsByName` /
 *    `submitRsvp` below.
 * ---------------------------------------------------------------------------
 */

const STORAGE_KEY = "nikkah-rsvp:guest-store:v1";
const SIMULATED_LATENCY_MS = 450;

function delay<T>(value: T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function loadStore(): Guest[] {
  if (typeof window === "undefined") return structuredClone(seedGuests);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(seedGuests);
    const parsed = JSON.parse(raw) as Guest[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return structuredClone(seedGuests);
    }
    return parsed;
  } catch {
    return structuredClone(seedGuests);
  }
}

function persistStore(store: Guest[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Best-effort only — an in-memory-only fallback is fine for a demo.
  }
}

// Module-level "database" for this mock implementation.
let store = loadStore();

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N} ]/gu, "");
}

function toSearchResult(guest: Guest): GuestSearchResult {
  return {
    id: guest.id,
    primaryGuestName: guest.primaryGuestName,
    allowedGuestCount: guest.allowedGuestCount,
    rsvpStatus: guest.rsvpStatus,
  };
}

/**
 * Looks up an invitation by the guest's full name. Only returns the minimal
 * fields needed to disambiguate — never another guest's RSVP details.
 */
export async function searchGuestsByName(
  fullName: string,
): Promise<GuestLookupOutcome> {
  const query = normalize(fullName);
  if (!query) return delay({ kind: "none" });

  const queryTokens = query.split(" ").filter(Boolean);

  // Prefer exact normalized full-name matches.
  const exact = store.filter((g) => normalize(g.primaryGuestName) === query);
  if (exact.length === 1) return delay({ kind: "single", guest: exact[0] });
  if (exact.length > 1) {
    return delay({ kind: "multiple", candidates: exact.map(toSearchResult) });
  }

  // Fall back to a token-subset match (handles reordering, e.g. "Ali Ahmed").
  const fuzzy = store.filter((g) => {
    const nameTokens = normalize(g.primaryGuestName).split(" ").filter(Boolean);
    return queryTokens.every((t) => nameTokens.includes(t));
  });

  if (fuzzy.length === 1) return delay({ kind: "single", guest: fuzzy[0] });
  if (fuzzy.length > 1) {
    return delay({ kind: "multiple", candidates: fuzzy.map(toSearchResult) });
  }

  return delay({ kind: "none" });
}

/**
 * Fetches a single guest's full invitation by id. Only ever called after a
 * guest has been unambiguously identified via searchGuestsByName (either a
 * single match, or an explicit selection from a disambiguation list) — the
 * id is never derived from user input or exposed in the URL.
 */
export async function getGuestById(id: string): Promise<Guest | null> {
  const guest = store.find((g) => g.id === id) ?? null;
  return delay(guest);
}

export class RsvpValidationError extends Error {}

export async function submitRsvp(submission: RsvpSubmission): Promise<Guest> {
  const guest = store.find((g) => g.id === submission.guestId);
  if (!guest) {
    throw new RsvpValidationError("We couldn't find that invitation.");
  }

  if (submission.attending) {
    const count = submission.attendeeNames.length;
    if (count < 1 || count > guest.allowedGuestCount) {
      throw new RsvpValidationError(
        `Please list between 1 and ${guest.allowedGuestCount} guests.`,
      );
    }
    if (submission.attendeeNames.some((n) => !n.trim())) {
      throw new RsvpValidationError("Every guest needs a name.");
    }
  }

  const updated: Guest = {
    ...guest,
    rsvpStatus: submission.attending ? "attending" : "declined",
    attendingCount: submission.attending ? submission.attendeeNames.length : 0,
    guestNames: submission.attending ? submission.attendeeNames : [],
    notes: submission.notes?.trim() || undefined,
    respondedAt: new Date().toISOString(),
  };

  store = store.map((g) => (g.id === guest.id ? updated : g));
  persistStore(store);

  return delay(updated);
}
