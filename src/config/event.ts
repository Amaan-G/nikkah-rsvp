import type { EventSlug } from "../types/guest";

/**
 * ============================================================================
 *  EVENT CONFIGURATION — edit everything in this file to customize the site.
 * ============================================================================
 * This is the single place you should need to touch to update names, dates,
 * venue details, contact info, and a couple of behavior flags. Guest data
 * and RSVPs live in Supabase (see supabase/schema.sql) — this file only
 * controls display content.
 */

export interface EventDetail {
  slug: EventSlug;
  name: string;
  /** Drives both the displayed date/time and the "Add to Calendar" links — keep in sync with the labels. */
  dateISO: string;
  dateLabel: string;
  dayOfWeek: string;
  timeLabel: string;
  durationHours: number;
  venueName: string;
  address: string;
  /** Optional short note shown under this event's details (e.g. a Jummah reminder). */
  notes?: string;
  /** Shows a "Ladies Only" badge on this event's RSVP card when true. */
  ladiesOnly?: boolean;
}

export const eventConfig = {
  couple: {
    groomFirstName: "Amaan",
    groomFullName: "Amaan Ghoghawala",
    groomParents: "Son of Imtiyaz and Afsari Ghoghawala",

    brideFirstName: "Ifrah",
    brideFullName: "Ifrah Fatima",
    brideParents: "Daughter of Mohammed and Juwaria Qayyum",
  },

  /** Shown throughout the site as the couple's combined names. */
  get coupleNames() {
    return `${this.couple.groomFirstName} & ${this.couple.brideFirstName}`;
  },

  hero: {
    eyebrow: "Bismillah",
    inviteLine: "We cordially invite you to the wedding of",
    subtitle:
      "With hearts full of joy, we begin this blessed journey together, Insha'Allah",
    /** Compact date range shown in the hero — edit directly since it spans multiple events. */
    dateLabel: "November 13 & 15, 2026",
  },

  /** One entry per event — the site will show a card for each and RSVP is per-event. */
  events: [
    {
      slug: "dua",
      name: "Dua",
      dateISO: "2026-11-11T18:00:00-06:00",
      dateLabel: "November 11th, 2026",
      dayOfWeek: "Wednesday",
      timeLabel: "6:00 PM CST",
      durationHours: 2,
      venueName: "Islamic Foundation North",
      address: "1751 O'Plaine Rd, Libertyville, IL 60048",
    },
    {
      slug: "mehndi",
      name: "Mehndi",
      dateISO: "2026-11-12T17:00:00-06:00",
      dateLabel: "November 12th, 2026",
      dayOfWeek: "Thursday",
      timeLabel: "5:00 PM CST",
      durationHours: 4,
      venueName: "Ghoghawala Residence",
      address: "2598 Hastings Ln, Gurnee, IL 60031",
      ladiesOnly: true,
    },
    {
      slug: "nikkah",
      name: "Nikkah",
      dateISO: "2026-11-13T15:30:00-06:00",
      dateLabel: "November 13th, 2026",
      dayOfWeek: "Friday",
      timeLabel: "3:30 PM CST",
      durationHours: 3,
      venueName: "Islamic Center of Naperville, Al Noor",
      address: "3540 248th Ave, Naperville, IL 60564",
      notes:
        "As the ceremony falls on Jummah, we encourage guests to pray Jummah at ICN Al Noor beforehand so we can begin right on time.",
    },
    {
      slug: "shaadi",
      name: "Shaadi",
      dateISO: "2026-11-13T18:00:00-06:00",
      dateLabel: "November 13th, 2026",
      dayOfWeek: "Friday",
      timeLabel: "6:00 PM CST",
      durationHours: 4,
      venueName: "Monty's Elegant Banquets",
      address: "703 S York Rd, Bensenville, IL 60106",
      notes: "Dinner and celebration the same evening as the Nikkah.",
    },
    {
      slug: "valima",
      name: "Valima",
      dateISO: "2026-11-15T18:00:00-06:00",
      dateLabel: "November 15th, 2026",
      dayOfWeek: "Sunday",
      timeLabel: "6:00 PM CST",
      durationHours: 4,
      venueName: "Drury Lane Theatre & Events",
      address: "100 Drury Lane, Oakbrook Terrace, IL 60181",
    },
  ] satisfies EventDetail[],

  dressCode: "Modest cultural attire or Islamic wear.",
  rsvpDeadlineISO: "2026-10-31T23:59:59-05:00",
  rsvpDeadlineLabel: "October 31st, 2026",
  giftNote: "With love and gratitude, no boxed gifts please.",

  contact: {
    name: "Ghoghawala & Qayyum Family",
    email: "ifrahf5616@gmail.com",
    phone: "+1 (630) 720-1926",
  },

  /** Google Maps directions link for a given event's address. */
  directionsUrl(event: EventDetail): string {
    const query = encodeURIComponent(event.address);
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  },

  /**
   * Whether a guest who already submitted an RSVP is allowed to come back
   * and edit their response. When false, they'll see a read-only summary
   * of what they submitted instead of an editable form.
   */
  allowRsvpEdits: true,

  closing: {
    message: "We look forward to celebrating this blessed occasion with you, Insha'Allah.",
  },
} as const;

export type EventConfig = typeof eventConfig;

export function getEventBySlug(slug: EventSlug): EventDetail {
  const event = eventConfig.events.find((e) => e.slug === slug);
  if (!event) throw new Error(`Unknown event slug: ${slug}`);
  return event;
}
