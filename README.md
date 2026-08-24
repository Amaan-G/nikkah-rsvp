# Nikkah RSVP

A premium, single-page Nikkah invitation & RSVP site. Guests search for their
name, see exactly how many seats their invitation covers, and RSVP for
themselves and their party — all wrapped in an elegant, animated Islamic
wedding aesthetic (ivory, cream, muted gold, deep emerald).

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

## Customizing your event

Everything guest-facing lives in **`src/config/event.ts`** — couple names,
parents, date/time, venue, address, dress code, RSVP deadline, contact info,
the closing message, and the `allowRsvpEdits` flag (whether guests can revise
an RSVP after submitting). Edit that one file and the whole site updates.

Colors and fonts live in **`src/index.css`** under the `@theme` block
(`--color-ivory`, `--color-gold`, `--color-emerald`, etc.) if you want to
adjust the palette.

## Supabase setup

The guest list and RSVPs live in a Supabase Postgres database, not in the
codebase. One-time setup:

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste in the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `guests` table, the three functions the site calls, and the security
   policies described below. It's safe to re-run.
3. Copy your **Project URL** and **anon/public API key** from
   Project Settings → API, and put them in `.env.local` (locally) and in your
   Vercel project's Environment Variables (production) — see `.env.example`.
4. To view responses at `/admin` (see below), create yourself a login under
   **Authentication → Users → Add user** (email + password), and turn off
   public sign-ups under **Authentication → Sign In / Providers → Email**
   ("Allow new users to sign up") so nobody else can create an account.

## Managing the guest list

Add, edit, or remove guests directly in Supabase: **Table Editor → guests**.
Each row is one invitation (a party, not a person):

| column                | meaning                                              |
| ---------------------- | ----------------------------------------------------- |
| `primary_guest_name`   | full name, exactly as the guest will type it to search |
| `allowed_guest_count`  | the hard seat cap for that invitation                 |
| `guest_names`, `rsvp_status`, `attending_count`, `notes`, `responded_at` | leave blank — the site fills these in once the guest RSVPs |

You can also insert many at once with SQL in the SQL Editor, e.g.:

```sql
insert into guests (primary_guest_name, allowed_guest_count) values
  ('Jane Doe', 2),
  ('John Smith', 4);
```

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
sign in with the account you created above. You'll see every RSVP — status,
party size, guest names, notes — plus quick totals for seats invited vs.
confirmed attending. It's read-only and only reachable by an account you
create yourself (see Supabase setup, step 4); there's no public sign-up.

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
- Enforced in Postgres, not just in the frontend: the public (anon) API key
  has no direct read/write grant on the `guests` table at all (see the
  `revoke all` in `supabase/schema.sql`) — every request goes through a
  `security definer` function that only ever returns the minimal fields a
  guest needs. A name search returns no notes/guest names; a full invitation
  is only fetched by its (unguessable, random) id after an unambiguous match.
- The admin view at `/admin` is separate: it reads the table directly, but
  only for a signed-in user you created yourself (see Supabase setup above).

Every piece of UI talks only to the three functions exported from
`src/services/guestService.ts` (`searchGuestsByName`, `getGuestById`,
`submitRsvp`) — see that file's header comment and `supabase/schema.sql` for
the full implementation. Wanting to move off Supabase later (e.g. to
Firebase) means replacing the bodies of those three functions and nothing
else in the UI.

## Project structure

```text
src/
  components/        UI components (Hero, Invitation, EventDetails,
                      RSVPSection, GuestLookup, RSVPForm, RSVPConfirmation,
                      Closing, Footer)
  components/decor/   Decorative/shared pieces (arches, patterns, icons,
                      scroll-reveal wrapper)
  pages/AdminPage.tsx  /admin — sign in, view all RSVPs
  config/event.ts     All event content — the file you edit most
  services/
    guestService.ts    Data access layer (Supabase-backed)
  lib/
    supabaseClient.ts  Supabase client (reads the VITE_SUPABASE_* env vars)
    calendar.ts        Google Calendar / .ics helpers
  types/guest.ts       Shared TypeScript types
supabase/schema.sql    Database schema, functions, and RLS policies
```

## Accessibility & motion

Forms use semantic `fieldset`/`legend`/radio inputs and are fully
keyboard-operable. Decorative SVGs are `aria-hidden`. All scroll/entrance
animations respect `prefers-reduced-motion` (see the media query in
`src/index.css` and the `useReducedMotion` checks in `Hero.tsx`/`Closing.tsx`).

## Deployment

The app is a static Vite build (`npm run build` → `dist/`), so it deploys to
Vercel, Netlify, or any static host with zero configuration.
