import { motion } from "framer-motion";
import type { GuestSearchResult } from "../types/guest";
import { UsersIcon } from "./decor/icons";

interface GuestDisambiguationProps {
  candidates: GuestSearchResult[];
  onSelect: (id: string) => void;
  onBack: () => void;
}

export function GuestDisambiguation({
  candidates,
  onSelect,
  onBack,
}: GuestDisambiguationProps) {
  return (
    <motion.div
      key="disambiguation"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      <h3 className="font-display text-3xl text-emerald-deep sm:text-4xl">
        We Found a Few Matches
      </h3>
      <p className="mx-auto mt-3 max-w-sm text-balance text-emerald-deep/70">
        A couple of invitations share that name. Please select yours below.
      </p>

      <ul className="mx-auto mt-8 flex max-w-sm flex-col gap-3" role="list">
        {candidates.map((candidate) => (
          <li key={candidate.id}>
            <button
              type="button"
              onClick={() => onSelect(candidate.id)}
              className="flex w-full items-center gap-4 rounded-2xl border border-gold/25 bg-white/70 px-5 py-4 text-left transition hover:border-gold hover:bg-white"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-deep/10 text-emerald-deep">
                <UsersIcon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-medium text-emerald-deep">
                  {candidate.primaryGuestName}
                </span>
                <span className="block text-xs text-emerald-deep/55">
                  Invited to {candidate.invitationCount}{" "}
                  {candidate.invitationCount === 1 ? "event" : "events"}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mx-auto mt-6 max-w-sm text-xs text-emerald-deep/45">
        Don&apos;t see your invitation? Double-check the spelling or contact
        the family directly.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 text-sm font-medium text-gold-deep underline-offset-4 hover:underline"
      >
        ← Search again
      </button>
    </motion.div>
  );
}
