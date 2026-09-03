import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type FormEvent } from "react";
import { getEventBySlug } from "../config/event";
import { RsvpValidationError, submitRsvp } from "../services/guestService";
import type { Invitation } from "../types/guest";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  EditIcon,
  XCircleIcon,
} from "./decor/icons";

interface EventInvitationCardProps {
  invitation: Invitation;
  primaryGuestName: string;
  allowEdits: boolean;
  onUpdated: (invitation: Invitation) => void;
}

type Attending = "yes" | "no" | null;

export function EventInvitationCard({
  invitation,
  primaryGuestName,
  allowEdits,
  onUpdated,
}: EventInvitationCardProps) {
  const event = getEventBySlug(invitation.eventSlug);
  const firstName = primaryGuestName.split(" ")[0];

  const [editing, setEditing] = useState(invitation.rsvpStatus === "pending");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const initialAttending: Attending =
    invitation.rsvpStatus === "attending"
      ? "yes"
      : invitation.rsvpStatus === "declined"
        ? "no"
        : null;

  const [attending, setAttending] = useState<Attending>(initialAttending);
  const [guestCount, setGuestCount] = useState<number>(
    invitation.attendingCount && invitation.attendingCount > 0
      ? invitation.attendingCount
      : 1,
  );
  const [names, setNames] = useState<string[]>(() => {
    const base = invitation.guestNames.length > 0 ? invitation.guestNames : [primaryGuestName];
    const count =
      invitation.attendingCount && invitation.attendingCount > 0
        ? invitation.attendingCount
        : 1;
    return Array.from({ length: count }, (_, i) => base[i] ?? "");
  });
  const [notes, setNotes] = useState(invitation.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seatOptions = useMemo(
    () => Array.from({ length: invitation.allowedGuestCount }, (_, i) => i + 1),
    [invitation.allowedGuestCount],
  );

  function handleGuestCountChange(count: number) {
    setGuestCount(count);
    setNames((prev) =>
      Array.from({ length: count }, (_, i) => (i === 0 ? primaryGuestName : prev[i] ?? "")),
    );
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
        invitationId: invitation.id,
        attending: attending === "yes",
        attendeeNames: names.map((n) => n.trim()),
        notes,
      });
      setJustSubmitted(true);
      setEditing(false);
      onUpdated(updated);
    } catch (err) {
      setError(
        err instanceof RsvpValidationError
          ? err.message
          : "We couldn't submit your RSVP. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isAttending = invitation.rsvpStatus === "attending";

  return (
    <div className="overflow-hidden rounded-2xl border border-gold/25 bg-white/70 text-left">
      <div className="border-b border-gold/15 bg-gold/5 px-6 py-4">
        <p className="font-display text-xl text-emerald-deep">{event.name}</p>
        <p className="mt-0.5 text-xs text-emerald-deep/60">
          {event.dayOfWeek}, {event.dateLabel} · {event.timeLabel} · {event.venueName}
        </p>
      </div>

      <div className="px-6 py-6">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-deep">
                Reserved for up to {invitation.allowedGuestCount}{" "}
                {invitation.allowedGuestCount === 1 ? "guest" : "guests"}
              </div>

              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-emerald-deep">
                  Will you be joyfully attending {event.name}?
                </legend>
                <div
                  role="radiogroup"
                  aria-label={`Attendance for ${event.name}`}
                  className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  {(
                    [
                      { value: "yes", label: "Joyfully attending" },
                      { value: "no", label: "Regretfully unable to attend" },
                    ] as const
                  ).map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border px-4 py-2.5 text-center text-sm font-medium transition ${
                        attending === option.value
                          ? "border-gold bg-gold/15 text-emerald-deep"
                          : "border-emerald-deep/15 bg-white/60 text-emerald-deep/70 hover:border-gold/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`attending-${invitation.id}`}
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
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <fieldset className="mt-5">
                      <legend className="text-sm font-medium text-emerald-deep">
                        How many guests will be attending?
                      </legend>
                      <div
                        role="radiogroup"
                        aria-label={`Number attending ${event.name}`}
                        className="mt-3 flex flex-wrap gap-2"
                      >
                        {seatOptions.map((n) => (
                          <label
                            key={n}
                            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border text-sm font-medium transition ${
                              guestCount === n
                                ? "border-gold bg-emerald-deep text-ivory"
                                : "border-emerald-deep/20 bg-white/60 text-emerald-deep hover:border-gold/60"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`guestCount-${invitation.id}`}
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

                    <div className="mt-4 flex flex-col gap-3">
                      <p className="text-xs text-emerald-deep/55">
                        Total includes {firstName} (Guest 1).
                      </p>
                      {names.map((value, i) => (
                        <div key={i}>
                          <label
                            htmlFor={`guest-${invitation.id}-${i}`}
                            className="mb-1 block text-xs font-medium uppercase tracking-wide text-emerald-deep/60"
                          >
                            Guest {i + 1}
                            {i === 0 ? " (you)" : ""}
                          </label>
                          <input
                            id={`guest-${invitation.id}-${i}`}
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

              <div className="mt-5">
                <label
                  htmlFor={`notes-${invitation.id}`}
                  className="mb-1 block text-xs font-medium uppercase tracking-wide text-emerald-deep/60"
                >
                  Special notes{" "}
                  <span className="normal-case text-emerald-deep/40">(optional)</span>
                </label>
                <textarea
                  id={`notes-${invitation.id}`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Well-wishes or anything else you'd like us to know"
                  className="w-full resize-none rounded-xl border border-emerald-deep/15 bg-white/80 px-4 py-2.5 text-sm text-emerald-deep outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </div>

              {error && (
                <p role="alert" className="mt-4 flex items-center gap-2 text-sm text-red-700">
                  <AlertIcon className="h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-deep px-6 py-2.5 text-sm font-medium tracking-wide text-ivory transition-colors hover:bg-emerald-light disabled:opacity-60"
                >
                  {submitting
                    ? "Submitting…"
                    : invitation.rsvpStatus === "pending"
                      ? "Submit RSVP"
                      : "Update RSVP"}
                  {!submitting && <ArrowRightIcon className="h-4 w-4" />}
                </button>
                {invitation.rsvpStatus !== "pending" && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="text-sm font-medium text-emerald-deep/60 underline-offset-4 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isAttending
                      ? "bg-emerald-deep/10 text-emerald-deep"
                      : "bg-gold/15 text-gold-deep"
                  }`}
                >
                  {isAttending ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <XCircleIcon className="h-5 w-5" />
                  )}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-emerald-deep">
                    {justSubmitted
                      ? isAttending
                        ? "JazakAllahu Khair for your RSVP!"
                        : "Thank you for letting us know"
                      : isAttending
                        ? "You're attending"
                        : "Unable to attend"}
                  </p>
                  {isAttending && (
                    <p className="mt-1 text-sm text-emerald-deep/70">
                      {invitation.attendingCount}{" "}
                      {invitation.attendingCount === 1 ? "guest" : "guests"}:{" "}
                      {invitation.guestNames.join(", ")}
                    </p>
                  )}
                  {invitation.notes && (
                    <p className="mt-1 text-sm italic text-emerald-deep/60">
                      &ldquo;{invitation.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {allowEdits && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-1.5 text-xs font-medium text-gold-deep transition hover:bg-gold/10"
                >
                  <EditIcon className="h-3.5 w-3.5" />
                  Edit RSVP
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
