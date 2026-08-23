import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type FormEvent } from "react";
import { RsvpValidationError, submitRsvp } from "../services/guestService";
import type { Guest } from "../types/guest";
import { AlertIcon, ArrowRightIcon, UsersIcon } from "./decor/icons";

interface RSVPFormProps {
  guest: Guest;
  isEdit: boolean;
  onSubmitted: (guest: Guest) => void;
  onBack: () => void;
}

type Attending = "yes" | "no" | null;

export function RSVPForm({ guest, isEdit, onSubmitted, onBack }: RSVPFormProps) {
  const firstName = guest.primaryGuestName.split(" ")[0];

  const initialAttending: Attending =
    guest.rsvpStatus === "attending"
      ? "yes"
      : guest.rsvpStatus === "declined"
        ? "no"
        : null;

  const [attending, setAttending] = useState<Attending>(initialAttending);
  const [guestCount, setGuestCount] = useState<number>(
    guest.attendingCount && guest.attendingCount > 0 ? guest.attendingCount : 1,
  );
  const [names, setNames] = useState<string[]>(() => {
    const base =
      guest.guestNames.length > 0
        ? guest.guestNames
        : [guest.primaryGuestName];
    const count = guest.attendingCount && guest.attendingCount > 0 ? guest.attendingCount : 1;
    return Array.from({ length: count }, (_, i) => base[i] ?? "");
  });
  const [notes, setNotes] = useState(guest.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seatOptions = useMemo(
    () => Array.from({ length: guest.allowedGuestCount }, (_, i) => i + 1),
    [guest.allowedGuestCount],
  );

  function handleGuestCountChange(count: number) {
    setGuestCount(count);
    setNames((prev) => {
      const next = Array.from({ length: count }, (_, i) => {
        if (i === 0) return guest.primaryGuestName;
        return prev[i] ?? "";
      });
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (attending === null) {
      setError("Please let us know if you'll be joyfully attending.");
      return;
    }

    if (attending === "yes" && names.some((n) => !n.trim())) {
      setError("Please add a name for every guest attending.");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await submitRsvp({
        guestId: guest.id,
        attending: attending === "yes",
        attendeeNames: names.map((n) => n.trim()),
        notes,
      });
      onSubmitted(updated);
    } catch (err) {
      if (err instanceof RsvpValidationError) {
        setError(err.message);
      } else {
        setError("We couldn't submit your RSVP. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center">
        <p className="font-script text-2xl text-gold-deep">
          Assalamu Alaikum, {firstName}!
        </p>
        <p className="mx-auto mt-2 max-w-sm text-balance text-sm text-emerald-deep/70">
          We are honored to have you celebrate this special occasion with us.
        </p>

        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wide text-gold-deep">
          <UsersIcon className="h-3.5 w-3.5" />
          Your invitation is reserved for up to {guest.allowedGuestCount}{" "}
          {guest.allowedGuestCount === 1 ? "guest" : "guests"}
        </div>

        {isEdit && (
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gold-deep/70">
            Editing your existing RSVP
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-10" noValidate>
        <fieldset>
          <legend className="text-center text-sm font-medium text-emerald-deep">
            Will you be joyfully attending?
          </legend>
          <div
            role="radiogroup"
            aria-label="Attendance"
            className="mx-auto mt-4 grid max-w-sm grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {(
              [
                { value: "yes", label: "Joyfully attending" },
                { value: "no", label: "Regretfully unable to attend" },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-xl border px-4 py-3.5 text-center text-sm font-medium transition ${
                  attending === option.value
                    ? "border-gold bg-gold/15 text-emerald-deep"
                    : "border-emerald-deep/15 bg-white/60 text-emerald-deep/70 hover:border-gold/50"
                }`}
              >
                <input
                  type="radio"
                  name="attending"
                  value={option.value}
                  checked={attending === option.value}
                  onChange={() => setAttending(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <AnimatePresence mode="wait">
          {attending === "yes" && (
            <motion.div
              key="attending-yes"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <fieldset className="mt-8">
                <legend className="text-center text-sm font-medium text-emerald-deep">
                  You have {guest.allowedGuestCount}{" "}
                  {guest.allowedGuestCount === 1 ? "seat" : "seats"} reserved.
                  How many guests will be attending?
                </legend>
                <div
                  role="radiogroup"
                  aria-label="Number attending"
                  className="mx-auto mt-4 flex max-w-sm flex-wrap justify-center gap-2"
                >
                  {seatOptions.map((n) => (
                    <label
                      key={n}
                      className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border text-sm font-medium transition ${
                        guestCount === n
                          ? "border-gold bg-emerald-deep text-ivory"
                          : "border-emerald-deep/20 bg-white/60 text-emerald-deep hover:border-gold/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="guestCount"
                        value={n}
                        checked={guestCount === n}
                        onChange={() => handleGuestCountChange(n)}
                        className="sr-only"
                      />
                      {n}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
                <p className="text-center text-xs text-emerald-deep/55">
                  Total includes {firstName} (Guest 1).
                </p>
                {names.map((value, i) => (
                  <div key={i}>
                    <label
                      htmlFor={`guest-${i}`}
                      className="mb-1 block text-xs font-medium uppercase tracking-wide text-emerald-deep/60"
                    >
                      Guest {i + 1}
                      {i === 0 ? " (you)" : ""}
                    </label>
                    <input
                      id={`guest-${i}`}
                      type="text"
                      value={value}
                      autoComplete={i === 0 ? "name" : "off"}
                      onChange={(e) =>
                        setNames((prev) =>
                          prev.map((n, idx) => (idx === i ? e.target.value : n)),
                        )
                      }
                      placeholder="Full name"
                      className="w-full rounded-xl border border-emerald-deep/15 bg-white/80 px-4 py-2.5 text-sm text-emerald-deep outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto mt-8 max-w-sm">
          <label
            htmlFor="notes"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-emerald-deep/60"
          >
            Special notes <span className="normal-case text-emerald-deep/40">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Dietary needs, well-wishes, or anything else you'd like us to know"
            className="w-full resize-none rounded-xl border border-emerald-deep/15 bg-white/80 px-4 py-2.5 text-sm text-emerald-deep outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-2 text-center text-sm text-red-700"
          >
            <AlertIcon className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-9 flex flex-col items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-emerald-deep px-7 py-3.5 text-sm font-medium tracking-wide text-ivory transition-colors hover:bg-emerald-light disabled:opacity-60"
          >
            {submitting ? "Submitting…" : isEdit ? "Update RSVP" : "Submit RSVP"}
            {!submitting && <ArrowRightIcon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-gold-deep underline-offset-4 hover:underline"
          >
            ← Not {firstName}? Search again
          </button>
        </div>
      </form>
    </motion.div>
  );
}
