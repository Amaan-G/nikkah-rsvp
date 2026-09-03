import { motion } from "framer-motion";
import { useState } from "react";
import { eventConfig } from "../config/event";
import { EventInvitationCard } from "./EventInvitationCard";
import { GuestSideSelector } from "./GuestSideSelector";
import type { Guest, Invitation } from "../types/guest";

interface GuestInvitationsProps {
  guest: Guest;
  invitations: Invitation[];
  onBack: () => void;
}

export function GuestInvitations({
  guest: initialGuest,
  invitations: initialInvitations,
  onBack,
}: GuestInvitationsProps) {
  const [guest, setGuest] = useState(initialGuest);
  const [invitations, setInvitations] = useState(initialInvitations);

  const firstName = guest.primaryGuestName.split(" ")[0];

  function handleInvitationUpdated(updated: Invitation) {
    setInvitations((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  return (
    <motion.div
      key="guest-invitations"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center">
        <p className="font-script text-2xl text-gold-deep">
          Assalamu Alaikum, {firstName}!
        </p>
        <p className="mx-auto mt-2 max-w-sm text-balance text-sm text-emerald-deep/70">
          We are honored to have you celebrate this special occasion with us.
          Please RSVP below for each event you&apos;re invited to.
        </p>

        <GuestSideSelector
          guestId={guest.id}
          side={guest.side}
          onChange={(side) => setGuest((prev) => ({ ...prev, side }))}
        />
      </div>

      <div className="mt-8 flex flex-col gap-5">
        {invitations.map((invitation) => (
          <EventInvitationCard
            key={invitation.id}
            invitation={invitation}
            primaryGuestName={guest.primaryGuestName}
            allowEdits={eventConfig.allowRsvpEdits}
            onUpdated={handleInvitationUpdated}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-emerald-deep/60 underline-offset-4 hover:underline"
        >
          Not {firstName}? Search another invitation
        </button>
      </div>
    </motion.div>
  );
}
