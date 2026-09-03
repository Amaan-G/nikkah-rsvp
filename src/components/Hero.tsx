import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { eventConfig } from "../config/event";
import { ArchFrame } from "./decor/ArchFrame";
import { GeometricPattern } from "./decor/GeometricPattern";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const archScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const archOpacity = useTransform(scrollYProgress, [0, 0.8], [0.5, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-deep via-emerald to-emerald-deep py-28 text-ivory sm:py-24"
    >
      <GeometricPattern
        color="#d9b876"
        opacity={0.07}
        size={90}
        className={shouldReduceMotion ? "" : "animate-drift"}
      />

      {/* Radial glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(217,184,118,0.16),transparent_60%)]"
      />

      <motion.div
        aria-hidden="true"
        style={
          shouldReduceMotion
            ? { opacity: 0.45 }
            : { scale: archScale, opacity: archOpacity }
        }
        className="pointer-events-none absolute inset-y-0 left-1/2 w-[min(85vw,520px)] -translate-x-1/2 text-gold-light"
      >
        <ArchFrame
          className="h-full w-full"
          strokeWidth={1.25}
          preserveAspectRatio="xMidYMax meet"
        />
      </motion.div>

      <motion.div
        style={
          shouldReduceMotion
            ? undefined
            : { y: contentY, opacity: contentOpacity }
        }
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="font-script text-2xl tracking-wide text-gold-light sm:text-3xl"
        >
          <span className="mb-1 block text-lg not-italic text-gold-light/80 sm:text-xl" dir="rtl" lang="ar">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </span>
          {eventConfig.hero.eyebrow}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 font-script text-2xl tracking-wide text-gold-light sm:text-3xl"
        >
          {eventConfig.hero.inviteLine}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex flex-col items-center text-balance font-display text-ivory"
        >
          <span className="block text-4xl leading-tight sm:text-5xl md:text-6xl">
            {eventConfig.couple.groomFullName}
          </span>
          <span className="mt-2 block font-body text-sm font-normal tracking-wide text-ivory/70 sm:text-base">
            {eventConfig.couple.groomParents}
          </span>

          <span className="my-5 block text-2xl text-gold-light sm:text-3xl">
            &amp;
          </span>

          <span className="block text-4xl leading-tight sm:text-5xl md:text-6xl">
            {eventConfig.couple.brideFullName}
          </span>
          <span className="mt-2 block font-body text-sm font-normal tracking-wide text-ivory/70 sm:text-base">
            {eventConfig.couple.brideParents}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-md text-balance font-body text-base leading-relaxed text-ivory/85 sm:text-lg"
        >
          {eventConfig.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-10 flex items-center gap-4 font-display text-lg tracking-[0.2em] text-gold-light sm:text-xl"
        >
          <span className="h-px w-8 bg-gold-light/50" />
          {eventConfig.hero.dateLabel}
          <span className="h-px w-8 bg-gold-light/50" />
        </motion.div>
      </motion.div>

      <motion.a
        href="#invitation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="group absolute bottom-8 z-10 flex flex-col items-center gap-2 text-ivory/70 transition-colors hover:text-gold-light"
        aria-label="Scroll to learn more"
      >
        <span className="text-[0.65rem] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-9 w-5 items-start justify-center rounded-full border border-current p-1"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        </motion.span>
      </motion.a>
    </section>
  );
}
