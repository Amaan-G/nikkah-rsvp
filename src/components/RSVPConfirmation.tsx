import { motion } from "framer-motion";
import { eventConfig } from "../config/event";
import type { Guest } from "../types/guest";
import { CheckCircleIcon, EditIcon, XCircleIcon } from "./decor/icons";

interface RSVPConfirmationProps {
  guest: Guest;
  justSubmitted: boolean;
  onEdit: () => void;
  onSearchAgain: () => void;
}

export function RSVPConfirmation({
  guest,
  justSubmitted,
  onEdit,
  onSearchAgain,
}: RSVPConfirmationProps) {
  const attending = guest.rsvpStatus === "attending";
  const firstName = guest.primaryGuestName.split(" ")[0];

  return (
    <motion.div
      key="confirmation"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
          attending
            ? "bg-emerald-deep/10 text-emerald-deep"
            : "bg-gold/15 text-gold-deep"
        }`}
      >
        {attending ? (
          <CheckCircleIcon className="h-7 w-7" />
        ) : (
          <XCircleIcon className="h-7 w-7" />
        )}
      </motion.span>

      {justSubmitted ? (
        <>
          <h3 className="mt-6 font-display text-3xl text-emerald-deep sm:text-4xl">
            {attending
              ? "JazakAllahu Khair for your RSVP!"
              : "Thank You for Letting Us Know"}
          </h3>
          <p className="mx-auto mt-3 max-w-sm text-balance text-emerald-deep/70">
            {attending
              ? "We look forward to celebrating this blessed occasion with you, Insha'Allah."
              : "You will be missed dearly — please keep us in your duas, Insha'Allah."}
          </p>
        </>
      ) : (
        <>
          <h3 className="mt-6 font-display text-3xl text-emerald-deep sm:text-4xl">
            Welcome Back, {firstName}
          </h3>
          <p className="mx-auto mt-3 max-w-sm text-balance text-emerald-deep/70">
            Here is the RSVP we have on file for you.
          </p>
        </>
      )}

      <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-gold/25 bg-white/70 p-6 text-left">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between border-b border-emerald-deep/10 pb-3">
            <dt className="text-emerald-deep/60">Primary Guest</dt>
            <dd className="font-medium text-emerald-deep">
              {guest.primaryGuestName}
            </dd>
          </div>
          <div className="flex items-center justify-between border-b border-emerald-deep/10 pb-3">
            <dt className="text-emerald-deep/60">Status</dt>
            <dd>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  attending
                    ? "bg-emerald-deep/10 text-emerald-deep"
                    : "bg-gold/15 text-gold-deep"
                }`}
              >
                {attending ? "Attending" : "Unable to Attend"}
              </span>
            </dd>
          </div>
          {attending && (
            <>
              <div className="flex items-center justify-between border-b border-emerald-deep/10 pb-3">
                <dt className="text-emerald-deep/60">Party Size</dt>
                <dd className="font-medium text-emerald-deep">
                  {guest.attendingCount}{" "}
                  {guest.attendingCount === 1 ? "guest" : "guests"}
                </dd>
              </div>
              <div>
                <dt className="mb-1.5 text-emerald-deep/60">Guests</dt>
                <dd className="flex flex-col gap-1">
                  {guest.guestNames.map((n, i) => (
                    <span key={i} className="font-medium text-emerald-deep">
                      {n}
                    </span>
                  ))}
                </dd>
              </div>
            </>
          )}
          {guest.notes && (
            <div className="border-t border-emerald-deep/10 pt-3">
              <dt className="mb-1 text-emerald-deep/60">Notes</dt>
              <dd className="text-emerald-deep/80">{guest.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        {eventConfig.allowRsvpEdits && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-6 py-2.5 text-sm font-medium text-gold-deep transition hover:bg-gold/10"
          >
            <EditIcon className="h-4 w-4" />
            Edit RSVP
          </button>
        )}
        <button
          type="button"
          onClick={onSearchAgain}
          className="text-sm font-medium text-emerald-deep/60 underline-offset-4 hover:underline"
        >
          Not {firstName}? Search another invitation
        </button>
      </div>
    </motion.div>
  );
}
