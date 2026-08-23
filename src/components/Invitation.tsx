import { eventConfig } from "../config/event";
import { ArchDivider } from "./decor/ArchDivider";
import { GeometricPattern } from "./decor/GeometricPattern";
import { Ornament } from "./decor/Ornament";
import { Reveal } from "./decor/Reveal";

export function Invitation() {
  return (
    <section
      id="invitation"
      className="relative bg-ivory text-emerald-deep"
    >
      <div className="absolute inset-0 -translate-y-px">
        <ArchDivider fill="var(--color-ivory)" height={64} count={8} />
      </div>

      <div className="relative overflow-hidden py-28 sm:py-36">
        <GeometricPattern color="#12463b" opacity={0.045} size={80} />

        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <Reveal>
            <Ornament className="text-gold" />
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="mt-6 text-balance font-display text-4xl text-emerald-deep sm:text-5xl">
              {eventConfig.invitation.heading}
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-8 text-balance font-body text-base leading-loose text-emerald-deep/75 sm:text-lg">
              {eventConfig.invitation.body}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="mt-10 font-script text-2xl text-gold-deep">
              {eventConfig.coupleNames}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
