import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { eventConfig, getEventBySlug } from "../config/event";
import { supabase } from "../lib/supabaseClient";
import type { EventSlug, GuestSide, RsvpStatus } from "../types/guest";

interface InvitationRow {
  id: string;
  guest_id: string;
  event_slug: EventSlug;
  allowed_guest_count: number;
  guest_names: string[] | null;
  rsvp_status: RsvpStatus;
  attending_count: number | null;
  notes: string | null;
  responded_at: string | null;
  guests: { primary_guest_name: string; side: GuestSide | null } | null;
}

interface AdminRow {
  invitationId: string;
  guestId: string;
  guestName: string;
  side: GuestSide | null;
  eventSlug: EventSlug;
  allowedGuestCount: number;
  rsvpStatus: RsvpStatus;
  attendingCount: number;
  guestNames: string[];
  notes: string | null;
  respondedAt: string | null;
}

function mapRow(row: InvitationRow): AdminRow {
  return {
    invitationId: row.id,
    guestId: row.guest_id,
    guestName: row.guests?.primary_guest_name ?? "Unknown",
    side: row.guests?.side ?? null,
    eventSlug: row.event_slug,
    allowedGuestCount: row.allowed_guest_count,
    rsvpStatus: row.rsvp_status,
    attendingCount: row.attending_count ?? 0,
    guestNames: row.guest_names ?? [],
    notes: row.notes,
    respondedAt: row.responded_at,
  };
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-gold/25 bg-white/70 p-8 shadow-sm"
      >
        <h1 className="text-center font-display text-2xl text-emerald-deep">
          RSVP Responses
        </h1>
        <p className="mt-2 text-center text-sm text-emerald-deep/60">
          Sign in to view your guest list.
        </p>

        <label className="mt-6 block text-xs font-medium uppercase tracking-wide text-emerald-deep/60">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-emerald-deep/15 bg-white px-3 py-2 text-sm text-emerald-deep outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
        </label>

        <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-emerald-deep/60">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-emerald-deep/15 bg-white px-3 py-2 text-sm text-emerald-deep outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
        </label>

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-emerald-deep px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-emerald-light disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

const STATUS_STYLES: Record<RsvpStatus, string> = {
  pending: "bg-ivory-dim text-emerald-deep/60",
  attending: "bg-emerald-deep/10 text-emerald-deep",
  declined: "bg-gold/15 text-gold-deep",
};

const SIDE_LABELS: Record<string, string> = {
  groom: "Ladke Wale (Groom's Side)",
  bride: "Ladki Wale (Bride's Side)",
  unset: "Not Set",
};

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gold/25 bg-white/70 p-4 text-center">
      <p className="text-2xl font-semibold text-emerald-deep">{value}</p>
      <p className="text-xs uppercase tracking-wide text-emerald-deep/50">{label}</p>
    </div>
  );
}

function AdminDashboard() {
  const [rows, setRows] = useState<AdminRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<EventSlug | "all">("all");

  async function load() {
    setError(null);
    const { data, error } = await supabase
      .from("invitations")
      .select("*, guests(primary_guest_name, side)")
      .order("event_slug");

    if (error) {
      setError(error.message);
      return;
    }
    setRows((data as InvitationRow[]).map(mapRow));
  }

  useEffect(() => {
    load();
  }, []);

  const byEvent = useMemo(() => {
    if (!rows) return [];
    return eventConfig.events.map((event) => {
      const eventRows = rows.filter((r) => r.eventSlug === event.slug);
      return {
        event,
        seatsInvited: eventRows.reduce((sum, r) => sum + r.allowedGuestCount, 0),
        attending: eventRows.reduce(
          (sum, r) => sum + (r.rsvpStatus === "attending" ? r.attendingCount : 0),
          0,
        ),
        pending: eventRows.filter((r) => r.rsvpStatus === "pending").length,
        declined: eventRows.filter((r) => r.rsvpStatus === "declined").length,
      };
    });
  }, [rows]);

  const bySide = useMemo(() => {
    if (!rows) return [];
    const buckets: Record<string, AdminRow[]> = { groom: [], bride: [], unset: [] };
    for (const row of rows) {
      buckets[row.side ?? "unset"].push(row);
    }
    return (["groom", "bride", "unset"] as const).map((key) => {
      const bucketRows = buckets[key];
      const guestIds = new Set(bucketRows.map((r) => r.guestId));
      return {
        key,
        guests: guestIds.size,
        attending: bucketRows.reduce(
          (sum, r) => sum + (r.rsvpStatus === "attending" ? r.attendingCount : 0),
          0,
        ),
      };
    });
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!rows) return [];
    const sorted = [...rows].sort((a, b) => a.guestName.localeCompare(b.guestName));
    return eventFilter === "all" ? sorted : sorted.filter((r) => r.eventSlug === eventFilter);
  }, [rows, eventFilter]);

  return (
    <div className="min-h-screen bg-ivory px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl text-emerald-deep">RSVP Responses</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              className="rounded-full border border-gold/40 px-4 py-2 text-sm font-medium text-gold-deep transition hover:bg-gold/10"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="rounded-full border border-emerald-deep/20 px-4 py-2 text-sm font-medium text-emerald-deep/70 transition hover:bg-emerald-deep/5"
            >
              Sign Out
            </button>
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-red-700">{error}</p>}

        <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-emerald-deep/50">
          By Event
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {byEvent.map(({ event, seatsInvited, attending, pending, declined }) => (
            <div key={event.slug} className="rounded-2xl border border-gold/25 bg-white/50 p-4">
              <p className="font-display text-lg text-emerald-deep">{event.name}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <StatTile label="Seats Invited" value={seatsInvited} />
                <StatTile label="Attending" value={attending} />
                <StatTile label="Pending" value={pending} />
                <StatTile label="Declined" value={declined} />
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-emerald-deep/50">
          By Side
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {bySide.map(({ key, guests, attending }) => (
            <div key={key} className="rounded-2xl border border-gold/25 bg-white/50 p-4 text-center">
              <p className="font-medium text-emerald-deep">{SIDE_LABELS[key]}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <StatTile label="Invited Guests" value={guests} />
                <StatTile label="Attending" value={attending} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-deep/50">
            All Responses
          </h2>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value as EventSlug | "all")}
            className="rounded-lg border border-emerald-deep/15 bg-white px-3 py-1.5 text-sm text-emerald-deep outline-none focus:border-gold"
          >
            <option value="all">All events</option>
            {eventConfig.events.map((event) => (
              <option key={event.slug} value={event.slug}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 overflow-x-auto rounded-2xl border border-gold/25 bg-white/70">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-gold/20 text-xs uppercase tracking-wide text-emerald-deep/50">
                <th className="px-4 py-3">Invitation</th>
                <th className="px-4 py-3">Side</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Attending</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Responded</th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-emerald-deep/50">
                    Loading…
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-emerald-deep/50">
                    No guests yet. Add rows in Supabase → Table Editor.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr
                    key={r.invitationId}
                    className="border-b border-gold/10 align-top last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-emerald-deep">{r.guestName}</td>
                    <td className="px-4 py-3 text-emerald-deep/70">
                      {r.side ? SIDE_LABELS[r.side] : "—"}
                    </td>
                    <td className="px-4 py-3 text-emerald-deep/80">
                      {getEventBySlug(r.eventSlug).name}
                    </td>
                    <td className="px-4 py-3 text-emerald-deep/80">{r.allowedGuestCount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[r.rsvpStatus]}`}
                      >
                        {r.rsvpStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-deep/80">
                      {r.rsvpStatus === "pending" ? "—" : r.attendingCount}
                    </td>
                    <td className="px-4 py-3 text-emerald-deep/80">
                      {r.guestNames.length > 0 ? r.guestNames.join(", ") : "—"}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-emerald-deep/70">
                      {r.notes || "—"}
                    </td>
                    <td className="px-4 py-3 text-emerald-deep/60">
                      {r.respondedAt ? new Date(r.respondedAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;
  return session ? <AdminDashboard /> : <AdminLogin />;
}
