# Nikkah RSVP

A premium, single-page wedding invitation & RSVP site covering three events
— Nikkah, Shaadi, and Valima. Guests search for their name, see exactly which
of the three events they're invited to and how many seats they have for
each, and RSVP to each independently — all wrapped in an elegant, animated
Islamic wedding aesthetic (ivory, cream, muted gold, deep emerald).

Built with React + TypeScript + Vite, Tailwind CSS v4, Framer Motion, and
Supabase (guest data + RSVPs).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL + anon key
npm run dev       # start the dev server
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build locally
npm run lint        # oxlint
```

The site needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to run (see
"Supabase setup" below) — both locally in `.env.local` and in Vercel under
Project Settings → Environment Variables.

## Customizing your events

Everything guest-facing lives in **`src/config/event.ts`** — couple names,
parents, contact info, the closing message, and the `allowRsvpEdits` flag
(whether guests can revise an RSVP after submitting). The `events` array
holds one entry per event (Nikkah / Shaadi / Valima) — its date, time,
venue, address, and an optional note (e.g. the Jummah reminder). Edit that
one file and the whole site updates; event *dates/venues* are display-only
config here, not stored in Supabase (Supabase only tracks who's invited to
which event and their RSVP — see below).

Colors and fonts live in **`src/index.css`** under the `@theme` block
(`--color-ivory`, `--color-gold`, `--color-emerald`, etc.) if you want to
adjust the palette.

## Supabase setup

The guest list and RSVPs live in a Supabase Postgres database, not in the
codebase. One-time setup:

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste in the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `guests` and `invitations` tables, the four functions the site calls, and
   the security policies described below. It's safe to re-run, and it will
   safely migrate any data from an earlier single-event version of this
   schema rather than losing it.
3. Copy your **Project URL** and **anon/public API key** from
   Project Settings → API, and put them in `.env.local` (locally) and in your
   Vercel project's Environment Variables (production) — see `.env.example`.
4. To view responses at `/admin` (see below), create yourself a login under
   **Authentication → Users → Add user** (email + password), and turn off
   public sign-ups under **Authentication → Sign In / Providers → Email**
   ("Allow new users to sign up") so nobody else can create an account.

## Managing the guest list

There are two tables in Supabase: **`guests`** (one row per party/household)
and **`invitations`** (one row per party × event — this is where seats and
RSVP status live, since someone can have a different seat count for Nikkah
vs. Shaadi vs. Valima, or only be invited to some of the three).

**Table Editor** (easiest for one-off additions):
1. `guests` → Insert row → fill in `primary_guest_name` (and `side`,
   `groom`/`bride`, if you already know it — guests can also set this
   themselves when they RSVP). Save, then copy the new row's `id`.
2. `invitations` → Insert row, once per event that guest is invited to:
   `guest_id` = the id you just copied, `event_slug` = `nikkah` / `shaadi` /
   `valima`, `allowed_guest_count` = their seat cap for that event. Leave
   `guest_names`, `rsvp_status`, `attending_count`, `notes`, `responded_at`
   blank — the site fills those in once they RSVP.

**SQL Editor** (faster for a batch — this pattern is also at the bottom of
`supabase/schema.sql`):

```sql
with new_guest as (
  insert into guests (primary_guest_name, side) values ('Jane Doe', 'bride')
  returning id
)
insert into invitations (guest_id, event_slug, allowed_guest_count)
select id, slug, count from new_guest, (values
  ('nikkah', 2),
  ('shaadi', 2),
  ('valima', 4)
) as seats(slug, count);
```
Adjust or drop rows from that `values(...)` list for guests who aren't
invited to all three events.

## Keeping Supabase awake

Supabase's free tier auto-pauses a project after 7 days with no API
activity. `.github/workflows/keep-supabase-active.yml` pings it every 3
days via GitHub Actions so this never happens between guest visits. It
needs two repo secrets (**GitHub repo → Settings → Secrets and variables →
Actions → New repository secret**):

- `SUPABASE_URL` — same value as `VITE_SUPABASE_URL`
- `SUPABASE_ANON_KEY` — same value as `VITE_SUPABASE_ANON_KEY`

## Viewing responses

Go to `/admin` on your deployed site (e.g. `your-site.vercel.app/admin`) and
sign in with the account you created above. You'll see:
- **By Event** — seats invited / attending / pending / declined, per event.
- **By Side** — invited guests and confirmed attending, grouped by Ladke
  Wale (groom's side) / Ladki Wale (bride's side) / not yet set.
- **All Responses** — every invitation row (guest, side, event, seats,
  status, attendee names, notes, responded date), filterable by event.

It's read-only and only reachable by an account you create yourself (see
Supabase setup, step 4 above); there's no public sign-up.

## How the RSVP flow works

1. **Find Your Invitation** (`GuestLookup.tsx`) — guest types their first and
   last name. `searchGuestsByName` in `src/services/guestService.ts` looks
   for an exact match on `guests.primary_guest_name` first, then falls back
   to a token-based match (handles reordering, e.g. "Ali Ahmed" still finds
   "Ahmed Ali").
2. **Disambiguation** (`GuestDisambiguation.tsx`) — if more than one guest
   shares a name, they're shown a short list (name only) and pick theirs
   rather than the app guessing.
3. **Guest identified** (`GuestInvitations.tsx`) — a welcome header, a
   Ladke Wale / Ladki Wale side selector (saved immediately, editable
   anytime), and one card per event that guest is invited to.
4. **Per-event RSVP** (`EventInvitationCard.tsx`) — each card is
   independent: attendance choice, guest count capped at that event's own
   `allowedGuestCount`, a name field per attendee (primary guest pre-filled),
   and notes. Submitting settles the card into a compact summary with an
   **Edit RSVP** option gated by `eventConfig.allowRsvpEdits` — someone can
   attend Shaadi but decline Nikkah, for example, all in one visit.

All state transitions are orchestrated in `RSVPSection.tsx`.

### Privacy notes

- A name search only ever returns the minimal fields needed to disambiguate
  (`id`, name, how many events they're invited to) — never RSVP status,
  notes, or seat counts for any invitation.
- A guest's full invitations are only ever fetched by `id` **after** they've
  been unambiguously identified (a single match, or an explicit pick from
  the disambiguation list) — never from a URL parameter or guessable input.
- Enforced in Postgres, not just in the frontend: the public (anon) API key
  has no direct read/write grant on `guests` or `invitations` at all (see
  the `revoke all` in `supabase/schema.sql`) — every request goes through a
  `security definer` function that only ever returns the minimal fields a
  guest needs.
- The admin view at `/admin` is separate: it reads both tables directly, but
  only for a signed-in user you created yourself (see Supabase setup above).

Every piece of UI talks only to the four functions exported from
`src/services/guestService.ts` (`searchGuestsByName`,
`getGuestWithInvitations`, `setGuestSide`, `submitRsvp`) — see that file's
header comment and `supabase/schema.sql` for the full implementation.
Wanting to move off Supabase later (e.g. to Firebase) means replacing the
bodies of those four functions and nothing else in the UI.

## Project structure

```text
src/
  components/          UI components (Hero, Invitation, EventDetails,
                        RSVPSection, GuestLookup, GuestDisambiguation,
                        GuestSideSelector, GuestInvitations,
                        EventInvitationCard, Closing, Footer)
  components/decor/     Decorative/shared pieces (arches, patterns, icons,
                        scroll-reveal wrapper)
  pages/AdminPage.tsx    /admin — sign in, view all RSVPs by event/side
  config/event.ts        Couple + per-event content — the file you edit most
  services/
    guestService.ts      Data access layer (Supabase-backed)
  lib/
    supabaseClient.ts    Supabase client (reads the VITE_SUPABASE_* env vars)
    calendar.ts          Google Calendar / .ics helpers, per event
  types/guest.ts         Shared TypeScript types
supabase/schema.sql      Database schema, functions, and RLS policies
```

## Accessibility & motion

Forms use semantic `fieldset`/`legend`/radio inputs and are fully
keyboard-operable. Decorative SVGs are `aria-hidden`. All scroll/entrance
animations respect `prefers-reduced-motion` (see the media query in
`src/index.css` and the `useReducedMotion` checks in `Hero.tsx`/`Closing.tsx`).

## Deployment

The app is a static Vite build (`npm run build` → `dist/`), so it deploys to
Vercel, Netlify, or any static host with zero configuration.
