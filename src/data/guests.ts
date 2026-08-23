import type { Guest } from "../types/guest";

/**
 * ============================================================================
 *  MOCK GUEST LIST — replace/extend this array to manage your guest list.
 * ============================================================================
 * This file stands in for a real database during development. Add one entry
 * per invitation (a party, not a person) with the seats it covers.
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
  {
    id: "guest-002",
    primaryGuestName: "Sarah Khan",
    allowedGuestCount: 1,
    guestNames: [],
    rsvpStatus: "pending",
  },
  {
    id: "guest-003",
    primaryGuestName: "Bilal Ahmed",
    allowedGuestCount: 2,
    guestNames: [],
    rsvpStatus: "pending",
  },
  {
    id: "guest-004",
    primaryGuestName: "Yusuf Rahman",
    allowedGuestCount: 6,
    guestNames: [],
    rsvpStatus: "pending",
  },
  {
    id: "guest-005",
    primaryGuestName: "Fatima Siddiqui",
    allowedGuestCount: 2,
    guestNames: ["Fatima Siddiqui", "Zainab Siddiqui"],
    rsvpStatus: "attending",
    attendingCount: 2,
    notes: "So excited to celebrate with you both!",
    respondedAt: "2026-08-01T14:32:00-05:00",
  },
  {
    id: "guest-006",
    primaryGuestName: "Omar Farooq",
    allowedGuestCount: 3,
    guestNames: [],
    rsvpStatus: "declined",
    attendingCount: 0,
    notes: "Wishing you both a lifetime of happiness — so sorry to miss it.",
    respondedAt: "2026-07-28T09:15:00-05:00",
  },
  // Two guests sharing the same name, used to exercise the disambiguation flow.
  {
    id: "guest-007",
    primaryGuestName: "Ahmed Ali",
    allowedGuestCount: 2,
    guestNames: [],
    rsvpStatus: "pending",
  },
  {
    id: "guest-008",
    primaryGuestName: "Ahmed Ali",
    allowedGuestCount: 4,
    guestNames: [],
    rsvpStatus: "pending",
  },
];
