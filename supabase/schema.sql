-- ============================================================================
--  Nikkah RSVP — Supabase schema
-- ============================================================================
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor
-- → New query → paste this whole file → Run). Safe to re-run: everything is
-- guarded with `if not exists` / `create or replace`.
--
-- What this sets up:
--   - a `guests` table (one row per invitation/party)
--   - three RPC functions the public site calls (search, fetch one, submit)
--   - Row Level Security so the anon (public site) key can ONLY reach the
--     guest list through those three functions — never a raw SELECT that
--     could dump the whole guest list — while a signed-in (authenticated)
--     user, i.e. you, can read every row for the admin dashboard.
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  primary_guest_name text not null,
  allowed_guest_count int not null check (allowed_guest_count > 0),
  guest_names text[] not null default '{}',
  rsvp_status text not null default 'pending'
    check (rsvp_status in ('pending', 'attending', 'declined')),
  attending_count int,
  notes text,
  responded_at timestamptz
);

alter table guests enable row level security;

-- No direct table access for anon or authenticated — everything goes
-- through the SECURITY DEFINER functions below (except admin SELECT, granted
-- explicitly further down).
revoke all on guests from anon, authenticated;

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
-- search_guests(query) — lightweight lookup, never returns notes/guest_names
-- ----------------------------------------------------------------------------
create or replace function search_guests(query text)
returns table (
  id uuid,
  primary_guest_name text,
  allowed_guest_count int,
  rsvp_status text
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
      select g.id, g.primary_guest_name, g.allowed_guest_count, g.rsvp_status
      from guests g
      where normalize_name(g.primary_guest_name) = norm_query;
    return;
  end if;

  return query
    select g.id, g.primary_guest_name, g.allowed_guest_count, g.rsvp_status
    from guests g
    where query_tokens <@ string_to_array(normalize_name(g.primary_guest_name), ' ');
end;
$$;

-- ----------------------------------------------------------------------------
-- get_guest_by_id(id) — full record, only ever called after an unambiguous
-- match from search_guests (a guessable/enumerable id would defeat the
-- point, which is why `id` is a random uuid rather than "guest-001").
-- ----------------------------------------------------------------------------
create or replace function get_guest_by_id(guest_id uuid)
returns setof guests
language sql
security definer
set search_path = public
as $$
  select * from guests where id = guest_id;
$$;

-- ----------------------------------------------------------------------------
-- submit_rsvp(...) — validates the seat cap server-side and writes the RSVP.
-- ----------------------------------------------------------------------------
create or replace function submit_rsvp(
  p_guest_id uuid,
  p_attending boolean,
  p_attendee_names text[],
  p_notes text
)
returns setof guests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allowed int;
  v_count int;
begin
  select allowed_guest_count into v_allowed from guests where id = p_guest_id;
  if v_allowed is null then
    raise exception 'We could not find that invitation.';
  end if;

  if p_attending then
    v_count := coalesce(array_length(p_attendee_names, 1), 0);
    if v_count < 1 or v_count > v_allowed then
      raise exception 'Please list between 1 and % guests.', v_allowed;
    end if;
  end if;

  update guests set
    rsvp_status = case when p_attending then 'attending' else 'declined' end,
    attending_count = case when p_attending then array_length(p_attendee_names, 1) else 0 end,
    guest_names = case when p_attending then p_attendee_names else '{}'::text[] end,
    notes = nullif(trim(coalesce(p_notes, '')), ''),
    responded_at = now()
  where id = p_guest_id;

  return query select * from guests where id = p_guest_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- Grants
-- ----------------------------------------------------------------------------
grant execute on function search_guests(text) to anon;
grant execute on function get_guest_by_id(uuid) to anon;
grant execute on function submit_rsvp(uuid, boolean, text[], text) to anon;

-- Admin dashboard: anyone you've created a login for (Authentication → Users)
-- can read every row directly. Nothing here grants write access, and nobody
-- can sign themselves up — see the setup notes for disabling public sign-ups.
grant select on guests to authenticated;
drop policy if exists "authenticated can read all guests" on guests;
create policy "authenticated can read all guests"
  on guests for select
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- One starter example row, so you can test the site immediately. Add your
-- real guest list afterwards via Table Editor → guests → Insert row (or more
-- INSERT statements here) — see README.md.
-- ----------------------------------------------------------------------------
insert into guests (primary_guest_name, allowed_guest_count)
select 'Amaan Ghoghawala', 4
where not exists (
  select 1 from guests where normalize_name(primary_guest_name) = normalize_name('Amaan Ghoghawala')
);
