import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { getGuestWithInvitations } from "../services/guestService";
import type { Guest, GuestLookupOutcome, GuestSearchResult, Invitation } from "../types/guest";
import { ArchDivider } from "./decor/ArchDivider";
import { GeometricPattern } from "./decor/GeometricPattern";
import { Ornament } from "./decor/Ornament";
import { Reveal } from "./decor/Reveal";
import { GuestDisambiguation } from "./GuestDisambiguation";
import { GuestInvitations } from "./GuestInvitations";
import { GuestLookup } from "./GuestLookup";
import { AlertIcon } from "./decor/icons";

type FlowState =
  | { step: "search" }
  | { step: "multiple"; candidates: GuestSearchResult[] }
  | { step: "not-found" }
  | { step: "loading" }
  | { step: "guest"; guest: Guest; invitations: Invitation[] };

export function RSVPSection() {
  const [flow, setFlow] = useState<FlowState>({ step: "search" });

  function reset() {
    setFlow({ step: "search" });
  }

  async function openGuest(id: string) {
    setFlow({ step: "loading" });
    const result = await getGuestWithInvitations(id);
    if (!result) {
      setFlow({ step: "not-found" });
      return;
    }
    setFlow({ step: "guest", guest: result.guest, invitations: result.invitations });
  }

  function handleLookupResult(outcome: GuestLookupOutcome) {
    if (outcome.kind === "none") {
      setFlow({ step: "not-found" });
    } else if (outcome.kind === "multiple") {
      setFlow({ step: "multiple", candidates: outcome.candidates });
    } else {
      setFlow({ step: "guest", guest: outcome.guest, invitations: outcome.invitations });
    }
  }

  return (
    <section id="rsvp" className="relative bg-ivory text-emerald-deep">
      <div className="absolute inset-0 -translate-y-px">
        <ArchDivider fill="var(--color-ivory)" height={64} count={8} />
      </div>

      <div className="relative overflow-hidden py-28 sm:py-36">
        <GeometricPattern color="#b98d3e" opacity={0.05} size={80} />

        <div className="relative mx-auto max-w-2xl px-6">
          <Reveal className="text-center">
            <Ornament className="text-gold" />
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-gold-deep">
              RSVP
            </p>
          </Reveal>

          <div className="relative mt-8 rounded-t-[120px] rounded-b-[2rem] border border-gold/25 bg-gradient-to-b from-cream/60 to-white/70 px-6 py-14 shadow-[0_20px_60px_-25px_rgba(18,70,59,0.35)] backdrop-blur-sm sm:px-12 sm:py-16">
            <AnimatePresence mode="wait">
              {flow.step === "search" && (
                <GuestLookup key="lookup" onResult={handleLookupResult} />
              )}

              {flow.step === "multiple" && (
                <GuestDisambiguation
                  key="multi"
                  candidates={flow.candidates}
                  onSelect={openGuest}
                  onBack={reset}
                />
              )}

              {flow.step === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 text-center text-sm text-emerald-deep/60"
                >
                  Retrieving your invitation…
                </motion.div>
              )}

              {flow.step === "not-found" && (
                <motion.div
                  key="not-found"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center"
                >
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
                    <AlertIcon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-2xl text-emerald-deep sm:text-3xl">
                    We Couldn&apos;t Find That Invitation
                  </h3>
                  <p className="mx-auto mt-3 max-w-sm text-balance text-emerald-deep/70">
                    Please double-check the spelling of your first and last
                    name, exactly as it appears on your invitation. If the
                    issue continues, please reach out to the family directly.
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-deep px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-emerald-light"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}

              {flow.step === "guest" && (
                <GuestInvitations
                  key="guest"
                  guest={flow.guest}
                  invitations={flow.invitations}
                  onBack={reset}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
