import { motion, useReducedMotion } from "framer-motion";
import { eventConfig } from "../config/event";
import { ArchDivider } from "./decor/ArchDivider";
import { ArchFrame } from "./decor/ArchFrame";
import { GeometricPattern } from "./decor/GeometricPattern";
import { Ornament } from "./decor/Ornament";
import { Reveal } from "./decor/Reveal";

export function Closing() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-deep via-emerald to-emerald-deep text-ivory">
      <div className="absolute inset-0 -translate-y-px">
        <ArchDivider fill="var(--color-emerald-deep)" height={64} count={8} />
      </div>

      <GeometricPattern
        color="#d9b876"
        opacity={0.06}
        size={90}
        className={shouldReduceMotion ? "" : "animate-drift"}
      />

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.4 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4 }}
        className="pointer-events-none absolute left-1/2 top-0 h-full w-[min(80vw,480px)] -translate-x-1/2 text-gold-light"
      >
        <ArchFrame className="h-full w-full" strokeWidth={1} />
      </motion.div>

      <div className="relative mx-auto max-w-xl px-6 py-28 text-center sm:py-36">
        <Reveal>
          <Ornament className="text-gold-light" />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-8 text-balance font-script text-2xl leading-relaxed text-ivory/90 sm:text-3xl">
            {eventConfig.closing.message}
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <h2 className="mt-10 font-display text-4xl text-gold-light sm:text-5xl">
            {eventConfig.couple.groomFirstName}
            <span className="mx-3">&amp;</span>
            {eventConfig.couple.brideFirstName}
          </h2>
        </Reveal>

        <Reveal delay={0.4}>
          <p className="mt-6 text-sm tracking-[0.25em] text-ivory/60">
            {eventConfig.event.dayOfWeek.toUpperCase()} · {eventConfig.event.dateLabel.toUpperCase()}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
