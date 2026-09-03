-- ============================================================================
--  Nikkah RSVP — Supabase schema (multi-event: Nikkah, Shaadi, Valima)
-- ============================================================================
-- Run this in your Supabase project's SQL Editor (Dashboard → SQL Editor →
-- New query → paste this whole file → Run). Safe to re-run: everything is
-- guarded with `if not exists` / `create or replace`, and it safely migrates
-- any data from the earlier single-event schema without losing it.
--
-- What this sets up:
--   - `guests`      one row per invitation-holding party (a family/household)
--   - `invitations` one row per guest × event — this is where seats, RSVP
--                    status, attendee names, and notes actually live, since
--                    a guest can be invited to a different number of seats
--                    per event (Nikkah / Shaadi / Valima)
--   - four RPC functions the public site calls (search, fetch, set side,
--     submit) — Row Level Security means the anon (public site) key can
--     ONLY reach guest data through those functions, never a raw SELECT
--     that could dump the whole guest list, while a signed-in
--     (authenticated) user, i.e. you, can read everything for the admin
--     dashboard.
--
-- Event details (names/dates/venues/notes) are NOT stored here — they live
-- in src/config/event.ts. This table only stores the `event_slug`
-- ("nikkah" | "shaadi" | "valima") linking an invitation to one of those.
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  primary_guest_name text not null
);

alter table guests add column if not exists side text check (side in ('groom', 'bride'));

create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  event_slug text not null check (event_slug in ('nikkah', 'shaadi', 'valima')),
  allowed_guest_count int not null check (allowed_guest_count > 0),
  guest_names text[] not null default '{}',
  rsvp_status text not null default 'pending'
    check (rsvp_status in ('pending', 'attending', 'declined')),
  attending_count int,
  notes text,
  responded_at timestamptz,
  unique (guest_id, event_slug)
);

-- ----------------------------------------------------------------------------
-- One-time migration from the earlier single-event schema, if present: move
-- any existing flat guest rows into an invitation against the Nikkah event,
-- then drop those now-redundant columns from `guests`. Skipped entirely (and
-- harmless to re-run) once already migrated.
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'guests' and column_name = 'allowed_guest_count'
  ) then
    insert into invitations (guest_id, event_slug, allowed_guest_count, guest_names, rsvp_status, attending_count, notes, responded_at)
    select g.id, 'nikkah', g.allowed_guest_count, g.guest_names, g.rsvp_status, g.attending_count, g.notes, g.responded_at
    from guests g
    where not exists (
      select 1 from invitations i where i.guest_id = g.id and i.event_slug = 'nikkah'
    );

    alter table guests
      drop column if exists allowed_guest_count,
      drop column if exists guest_names,
      drop column if exists rsvp_status,
      drop column if exists attending_count,
      drop column if exists notes,
      drop column if exists responded_at;
  end if;
end $$;

alter table guests enable row level security;
alter table invitations enable row level security;

-- No direct table access for anon or authenticated — everything goes
-- through the SECURITY DEFINER functions below (except admin SELECT,
-- granted explicitly further down).
revoke all on guests, invitations from anon, authenticated;

-- ----------------------------------------------------------------------------
-- Name matching helper
-- ----------------------------------------------------------------------------
create or replace function normalize_name(input text)
returns text
language sql
immutable
as $$
  select trim(
    regexp_replace(
      regexp_replace(lower(input), '[^a-z0-9 ]', '', 'g'),
      '\s+', ' ', 'g'
    )
  );
$$;

-- ----------------------------------------------------------------------------
-- search_guests(query) — lightweight lookup, never returns invitation details
-- ----------------------------------------------------------------------------
create or replace function search_guests(query text)
returns table (
  id uuid,
  primary_guest_name text,
  invitation_count int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  norm_query text := normalize_name(query);
  query_tokens text[] := string_to_array(norm_query, ' ');
  exact_count int;
begin
  if norm_query = '' then
    return;
  end if;

  select count(*) into exact_count
  from guests g
  where normalize_name(g.primary_guest_name) = norm_query;

  if exact_count > 0 then
    return query
      select g.id, g.primary_guest_name,
             (select count(*)::int from invitations i where i.guest_id = g.id)
      from guests g
      where normalize_name(g.primary_guest_name) = norm_query;
    return;
  end if;

  return query
    select g.id, g.primary_guest_name,
           (select count(*)::int from invitations i where i.guest_id = g.id)
    from guests g
    where query_tokens <@ string_to_array(normalize_name(g.primary_guest_name), ' ');
end;
$$;

-- ----------------------------------------------------------------------------
-- get_guest_with_invitations(id) — full guest + all their event invitations,
-- as one JSON object. Only ever called after an unambiguous match from
-- search_guests (a guessable/enumerable id would defeat the point, which is
-- why `id` is a random uuid rather than "guest-001").
-- ----------------------------------------------------------------------------
create or replace function get_guest_with_invitations(p_guest_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', g.id,
    'primary_guest_name', g.primary_guest_name,
    'side', g.side,
    'invitations', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', i.id,
            'event_slug', i.event_slug,
            'allowed_guest_count', i.allowed_guest_count,
            'guest_names', i.guest_names,
            'rsvp_status', i.rsvp_status,
            'attending_count', i.attending_count,
            'notes', i.notes,
            'responded_at', i.responded_at
          )
        )
        from invitations i
        where i.guest_id = g.id
      ),
      '[]'::jsonb
    )
  )
  from guests g
  where g.id = p_guest_id;
$$;

-- ----------------------------------------------------------------------------
-- set_guest_side(id, side) — "Groom's Side" / "Bride's Side", set once by the
-- guest (or by you, directly in Table Editor) and editable later.
-- ----------------------------------------------------------------------------
create or replace function set_guest_side(p_guest_id uuid, p_side text)
returns setof guests
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_side not in ('groom', 'bride') then
    raise exception 'Invalid side.';
  end if;

  update guests set side = p_side where id = p_guest_id;
  return query select * from guests where id = p_guest_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- submit_rsvp(...) — validates the seat cap for THIS invitation server-side
-- and writes the RSVP.
-- ----------------------------------------------------------------------------
create or replace function submit_rsvp(
  p_invitation_id uuid,
  p_attending boolean,
  p_attendee_names text[],
  p_notes text
)
returns setof invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allowed int;
  v_count int;
begin
  select allowed_guest_count into v_allowed from invitations where id = p_invitation_id;
  if v_allowed is null then
    raise exception 'We could not find that invitation.';
  end if;

  if p_attending then
    v_count := coalesce(array_length(p_attendee_names, 1), 0);
    if v_count < 1 or v_count > v_allowed then
      raise exception 'Please list between 1 and % guests.', v_allowed;
    end if;
  end if;

  update invitations set
    rsvp_status = case when p_attending then 'attending' else 'declined' end,
    attending_count = case when p_attending then array_length(p_attendee_names, 1) else 0 end,
    guest_names = case when p_attending then p_attendee_names else '{}'::text[] end,
    notes = nullif(trim(coalesce(p_notes, '')), ''),
    responded_at = now()
  where id = p_invitation_id;

  return query select * from invitations where id = p_invitation_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- Grants
-- ----------------------------------------------------------------------------
grant execute on function search_guests(text) to anon;
grant execute on function get_guest_with_invitations(uuid) to anon;
grant execute on function set_guest_side(uuid, text) to anon;
grant execute on function submit_rsvp(uuid, boolean, text[], text) to anon;

-- Admin dashboard: anyone you've created a login for (Authentication → Users)
-- can read every row directly. Nothing here grants write access, and nobody
-- can sign themselves up — see README.md for disabling public sign-ups.
grant select on guests, invitations to authenticated;

drop policy if exists "authenticated can read all guests" on guests;
create policy "authenticated can read all guests"
  on guests for select
  to authenticated
  using (true);

drop policy if exists "authenticated can read all invitations" on invitations;
create policy "authenticated can read all invitations"
  on invitations for select
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- Adding your guest list: Table Editor is easiest for one-off entries
-- (Table Editor → guests → Insert row, then invitations → Insert row with
-- the matching guest_id and event_slug), but for a batch it's faster here.
-- Uncomment and edit, or run separately in the SQL Editor:
--
-- with new_guest as (
--   insert into guests (primary_guest_name, side) values ('Jane Doe', 'bride')
--   returning id
-- )
-- insert into invitations (guest_id, event_slug, allowed_guest_count)
-- select id, slug, count from new_guest, (values
--   ('nikkah', 2),
--   ('shaadi', 2),
--   ('valima', 4)
-- ) as seats(slug, count);
-- ----------------------------------------------------------------------------
