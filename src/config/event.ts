/**
 * ============================================================================
 *  EVENT CONFIGURATION — edit everything in this file to customize the site.
 * ============================================================================
 * This is the single place you should need to touch to update names, dates,
 * venue details, contact info, and a couple of behavior flags. Nothing else
 * in the codebase should hardcode this kind of content.
 */

export const eventConfig = {
  couple: {
    groomFirstName: "Amaan",
    groomFullName: "Amaan Ghoghawala",
    groomParents: "Son of Imtiyaz and Afsari Ghoghawala",

    brideFirstName: "Ifrah",
    brideFullName: "Ifrah Fatima",
    brideParents: "Daughter of Mohammed and Juweria Qayyum",
  },

  /** Shown throughout the site as the couple's combined names. */
  get coupleNames() {
    return `${this.couple.groomFirstName} & ${this.couple.brideFirstName}`;
  },

  hero: {
    eyebrow: "Bismillah",
    inviteLine: "We cordially invite you to the Nikkah of",
    subtitle:
      "Together with their families, joyfully invite you to celebrate their Nikkah",
  },

  invitation: {
    heading: "You Are Warmly Invited",
    body:
      "With hearts full of gratitude, we invite you to witness the beginning of our journey together. " +
      "Your presence, prayers, and blessings would mean the world to us as we begin this new chapter, " +
      "united in faith and love before Allah (SWT). Please join our families for an evening of joy, " +
      "gratitude, and celebration.",
  },

  event: {
    // Update the ISO datetime below — it drives both the displayed date/time
    // and the "Add to Calendar" links, so keep it in sync with the labels.
    dateISO: "2026-11-06T16:00:00-06:00",
    dateLabel: "November 6th, 2026",
    dayOfWeek: "Friday",
    timeLabel: "4:00 PM CST",
    durationHours: 3,

    venueName: "Islamic Center of Naperville, Al Noor",
    address: "3540 248th Ave, Naperville, IL 60564",

    dressCode: "Modest formal attire or Islamic wear.",
    additionalNotes:
      "A brief Nikkah ceremony will be followed by dinner and celebration. Separate prayer facilities are available on-site.",

    rsvpDeadlineISO: "2026-10-09T23:59:59-05:00",
    rsvpDeadlineLabel: "October 9th, 2026",
  },

  contact: {
    name: "Ghoghawala & Qayyum Family",
    email: "ifrahf5616@gmail.com",
    phone: "+1 (630) 720-1926",
  },

  /** Google Maps directions link — swap for a custom link if you prefer. */
  get directionsUrl() {
    const query = encodeURIComponent(this.event.address);
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
