# Nikkah RSVP

A premium, single-page Nikkah invitation & RSVP site. Guests search for their
name, see exactly how many seats their invitation covers, and RSVP for
themselves and their party — all wrapped in an elegant, animated Islamic
wedding aesthetic (ivory, cream, muted gold, deep emerald).

Built with React + TypeScript + Vite, Tailwind CSS v4, and Framer Motion.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build locally
npm run lint        # oxlint
```

## Customizing your event

Everything guest-facing lives in **`src/config/event.ts`** — couple names,
parents, date/time, venue, address, dress code, RSVP deadline, contact info,
the closing message, and the `allowRsvpEdits` flag (whether guests can revise
an RSVP after submitting). Edit that one file and the whole site updates.

Colors and fonts live in **`src/index.css`** under the `@theme` block
(`--color-ivory`, `--color-gold`, `--color-emerald`, etc.) if you want to
adjust the palette.

## Managing the guest list

Guests are defined in **`src/data/guests.ts`** as a plain array — one entry
per invitation (a party, not a person):

```ts
{
  id: "guest-009",
  primaryGuestName: "Jane Doe",
  allowedGuestCount: 2,
  guestNames: [],
  rsvpStatus: "pending",
}
```

Add, remove, or edit entries directly. `id` should be unique and stable;
`allowedGuestCount` is the hard cap on how many seats that invitation covers
— the RSVP form will not let a guest select more than that.

## How the RSVP flow works

1. **Find Your Invitation** (`GuestLookup.tsx`) — guest types their first and
   last name. `searchGuestsByName` in `src/services/guestService.ts` looks
   for an exact match first, then falls back to a token-based match (handles
   reordering, e.g. "Ali Ahmed" still finds "Ahmed Ali").
2. **Disambiguation** (`GuestDisambiguation.tsx`) — if more than one
   invitation shares a name, the guest is shown a short list (name + party
   size only) and picks theirs rather than the app guessing.
3. **RSVP** (`RSVPForm.tsx`) — attendance choice, guest count capped at
   `allowedGuestCount`, and a name field per attendee (the primary guest is
   pre-filled).
4. **Confirmation** (`RSVPConfirmation.tsx`) — doubles as the "already
   responded" screen. If a guest searches again after submitting, they see
   their existing RSVP instead of a blank form, with an **Edit RSVP** option
   gated by `eventConfig.allowRsvpEdits`.

All state transitions are orchestrated in `RSVPSection.tsx`.

### Privacy notes

- A name search only ever returns the minimal fields needed to disambiguate
  (`id`, name, party size) — never another guest's RSVP status or notes.
- A guest's full invitation is only ever fetched by `id` **after** they've
  been unambiguously identified (a single match, or an explicit pick from
  the disambiguation list) — never from a URL parameter or guessable input.
- The current implementation is a local mock (see below) and, like any
  client-only app, ships the guest list in the JS bundle. This is fine for
  development; the "moving to a real backend" section below explains how to
  close that gap for production.

## Replacing the mock data with a real backend

Every piece of UI talks only to the three functions exported from
`src/services/guestService.ts` (`searchGuestsByName`, `getGuestById`,
`submitRsvp`). Swap their implementation and nothing else needs to change.

**Supabase**
1. Create a `guests` table matching the `Guest` type in `src/types/guest.ts`.
2. Add `search_guests(query text)` and `submit_rsvp(...)` Postgres functions
   (RPCs) that do the matching/writes server-side.
3. Enable Row Level Security; only expose the RPCs to the anon key, not the
   raw table — this is what actually prevents guests from ever pulling the
   full guest list.
4. Replace the bodies of the three service functions with `supabase.rpc(...)`
   calls, keeping their signatures the same.

**Firebase**
1. Store guests as documents in a `guests` Firestore collection.
2. Do the name-matching inside a callable Cloud Function rather than
   querying the collection from the browser, for the same reason as above.
3. Call that function from `searchGuestsByName` / `submitRsvp`.

The full reasoning is also documented inline at the top of
`guestService.ts`.

## Project structure

```text
src/
  components/        UI components (Hero, Invitation, EventDetails,
                      RSVPSection, GuestLookup, RSVPForm, RSVPConfirmation,
                      Closing, Footer)
  components/decor/   Decorative/shared pieces (arches, patterns, icons,
                      scroll-reveal wrapper)
  config/event.ts     All event content — the file you edit most
  data/guests.ts       Mock guest list
  services/
    guestService.ts    Data access layer — swap this for a real backend
  types/guest.ts       Shared TypeScript types
  lib/calendar.ts       Google Calendar / .ics helpers
```

## Accessibility & motion

Forms use semantic `fieldset`/`legend`/radio inputs and are fully
keyboard-operable. Decorative SVGs are `aria-hidden`. All scroll/entrance
animations respect `prefers-reduced-motion` (see the media query in
`src/index.css` and the `useReducedMotion` checks in `Hero.tsx`/`Closing.tsx`).

## Deployment

The app is a static Vite build (`npm run build` → `dist/`), so it deploys to
Vercel, Netlify, or any static host with zero configuration.
