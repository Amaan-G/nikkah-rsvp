import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { searchGuestsByName } from "../services/guestService";
import type { GuestLookupOutcome } from "../types/guest";
import { AlertIcon, ArrowRightIcon, SearchIcon } from "./decor/icons";

interface GuestLookupProps {
  onResult: (outcome: GuestLookupOutcome, query: string) => void;
}

export function GuestLookup({ onResult }: GuestLookupProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Please enter your first and last name.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const outcome = await searchGuestsByName(trimmed);
      onResult(outcome, trimmed);
    } catch {
      setError("Something went wrong on our end. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      key="lookup"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      <h3 className="font-display text-3xl text-emerald-deep sm:text-4xl">
        Find Your Invitation
      </h3>
      <p className="mx-auto mt-3 max-w-sm text-balance text-emerald-deep/70">
        Enter your full name below to view your invitation and RSVP.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        noValidate
      >
        <label htmlFor="guest-name" className="sr-only">
          Your first and last name
        </label>
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-deep/40" />
          <input
            id="guest-name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Amaan Ghoghawala"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "guest-name-error" : undefined}
            className="w-full rounded-full border border-emerald-deep/15 bg-white/80 py-3.5 pl-11 pr-4 text-emerald-deep placeholder:text-emerald-deep/35 shadow-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-deep px-7 py-3.5 text-sm font-medium tracking-wide text-ivory transition-colors hover:bg-emerald-light disabled:opacity-60"
        >
          {loading ? (
            "Searching…"
          ) : (
            <>
              Find Invitation
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {error && (
        <p
          id="guest-name-error"
          role="alert"
          className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 text-sm text-red-700"
        >
          <AlertIcon className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <p className="mx-auto mt-6 max-w-sm text-xs text-emerald-deep/45">
        Can&apos;t find your invitation? Please reach out to the family so we
        can help.
      </p>
    </motion.div>
  );
}
