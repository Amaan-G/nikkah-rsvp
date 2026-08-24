import type { Session } from "@supabase/supabase-js";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Guest, RsvpStatus } from "../types/guest";

interface GuestRow {
  id: string;
  primary_guest_name: string;
  allowed_guest_count: number;
  guest_names: string[] | null;
  rsvp_status: RsvpStatus;
  attending_count: number | null;
  notes: string | null;
  responded_at: string | null;
}

function mapRow(row: GuestRow): Guest {
  return {
    id: row.id,
    primaryGuestName: row.primary_guest_name,
    allowedGuestCount: row.allowed_guest_count,
    guestNames: row.guest_names ?? [],
    rsvpStatus: row.rsvp_status,
    attendingCount: row.attending_count ?? undefined,
    notes: row.notes ?? undefined,
    respondedAt: row.responded_at ?? undefined,
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

function AdminDashboard() {
  const [guests, setGuests] = useState<Guest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("primary_guest_name");

    if (error) {
      setError(error.message);
      return;
    }
    setGuests((data as GuestRow[]).map(mapRow));
  }

  useEffect(() => {
    load();
  }, []);

  const totalInvited = guests?.reduce((sum, g) => sum + g.allowedGuestCount, 0) ?? 0;
  const totalAttending = guests?.reduce((sum, g) => sum + (g.attendingCount ?? 0), 0) ?? 0;
  const pending = guests?.filter((g) => g.rsvpStatus === "pending").length ?? 0;
  const declined = guests?.filter((g) => g.rsvpStatus === "declined").length ?? 0;

  return (
    <div className="min-h-screen bg-ivory px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
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

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gold/25 bg-white/70 p-4 text-center">
            <p className="text-2xl font-semibold text-emerald-deep">{totalInvited}</p>
            <p className="text-xs uppercase tracking-wide text-emerald-deep/50">Seats Invited</p>
          </div>
          <div className="rounded-xl border border-gold/25 bg-white/70 p-4 text-center">
            <p className="text-2xl font-semibold text-emerald-deep">{totalAttending}</p>
            <p className="text-xs uppercase tracking-wide text-emerald-deep/50">Confirmed Attending</p>
          </div>
          <div className="rounded-xl border border-gold/25 bg-white/70 p-4 text-center">
            <p className="text-2xl font-semibold text-emerald-deep">{pending}</p>
            <p className="text-xs uppercase tracking-wide text-emerald-deep/50">Awaiting Response</p>
          </div>
          <div className="rounded-xl border border-gold/25 bg-white/70 p-4 text-center">
            <p className="text-2xl font-semibold text-emerald-deep">{declined}</p>
            <p className="text-xs uppercase tracking-wide text-emerald-deep/50">Declined</p>
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-red-700">{error}</p>}

        <div className="mt-8 overflow-x-auto rounded-2xl border border-gold/25 bg-white/70">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gold/20 text-xs uppercase tracking-wide text-emerald-deep/50">
                <th className="px-4 py-3">Invitation</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Attending</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Responded</th>
              </tr>
            </thead>
            <tbody>
              {guests === null ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-emerald-deep/50">
                    Loading…
                  </td>
                </tr>
              ) : guests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-emerald-deep/50">
                    No guests yet. Add rows in Supabase → Table Editor → guests.
                  </td>
                </tr>
              ) : (
                guests.map((g) => (
                  <tr key={g.id} className="border-b border-gold/10 align-top last:border-0">
                    <td className="px-4 py-3 font-medium text-emerald-deep">
                      {g.primaryGuestName}
                    </td>
                    <td className="px-4 py-3 text-emerald-deep/80">{g.allowedGuestCount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[g.rsvpStatus]}`}
                      >
                        {g.rsvpStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-deep/80">
                      {g.rsvpStatus === "pending" ? "—" : g.attendingCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-emerald-deep/80">
                      {g.guestNames.length > 0 ? g.guestNames.join(", ") : "—"}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-emerald-deep/70">
                      {g.notes || "—"}
                    </td>
                    <td className="px-4 py-3 text-emerald-deep/60">
                      {g.respondedAt ? new Date(g.respondedAt).toLocaleDateString() : "—"}
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
