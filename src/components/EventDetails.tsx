import { eventConfig } from "../config/event";
import { buildGoogleCalendarUrl, downloadIcsFile } from "../lib/calendar";
import { ArchDivider } from "./decor/ArchDivider";
import { Ornament } from "./decor/Ornament";
import { Reveal } from "./decor/Reveal";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
} from "./decor/icons";

const details = [
  {
    icon: CalendarIcon,
    label: "Date",
    value: `${eventConfig.event.dayOfWeek}, ${eventConfig.event.dateLabel}`,
  },
  {
    icon: ClockIcon,
    label: "Time",
    value: eventConfig.event.timeLabel,
  },
  {
    icon: MapPinIcon,
    label: "Venue",
    value: eventConfig.event.venueName,
    sub: eventConfig.event.address,
  },
];

export function EventDetails() {
  return (
    <section id="details" className="relative bg-cream text-emerald-deep">
      <div className="absolute inset-0 -translate-y-px">
        <ArchDivider fill="var(--color-cream)" height={64} count={8} />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-28 sm:py-36">
        <Reveal className="text-center">
          <Ornament className="text-gold" />
          <h2 className="mt-6 font-display text-4xl text-emerald-deep sm:text-5xl">
            Event Details
          </h2>
          <p className="mx-auto mt-4 max-w-md text-balance text-emerald-deep/70">
            {eventConfig.event.additionalNotes}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          {details.map(({ icon: Icon, label, value, sub }, i) => (
            <Reveal key={label} delay={i * 0.12}>
              <div className="group h-full rounded-2xl border border-gold/25 bg-ivory/70 p-8 text-center shadow-[0_1px_0_rgba(185,141,62,0.12)] backdrop-blur-sm transition-transform duration-500 hover:-translate-y-1">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold-deep">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-5 text-xs uppercase tracking-[0.25em] text-gold-deep">
                  {label}
                </p>
                <p className="mt-2 font-display text-lg text-emerald-deep">
                  {value}
                </p>
                {sub && (
                  <p className="mt-1 text-sm text-emerald-deep/65">{sub}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.35} className="mt-12 text-center">
          <p className="text-sm text-emerald-deep/70">
            <span className="font-medium text-emerald-deep">Attire:</span>{" "}
            {eventConfig.event.dressCode}
          </p>
          <p className="mt-2 text-sm text-emerald-deep/70">
            Kindly RSVP by{" "}
            <span className="font-medium text-emerald-deep">
              {eventConfig.event.rsvpDeadlineLabel}
            </span>
          </p>
        </Reveal>

        <Reveal
          delay={0.45}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href={eventConfig.directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-deep/20 bg-emerald-deep px-7 py-3 text-sm font-medium tracking-wide text-ivory transition-colors hover:bg-emerald-light sm:w-auto"
          >
            <MapPinIcon className="h-4 w-4" />
            Get Directions
          </a>
          <div className="flex w-full gap-3 sm:w-auto">
            <a
              href={buildGoogleCalendarUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/40 bg-transparent px-6 py-3 text-sm font-medium tracking-wide text-gold-deep transition-colors hover:bg-gold/10 sm:flex-none"
            >
              <CalendarIcon className="h-4 w-4" />
              Google Calendar
            </a>
            <button
              type="button"
              onClick={downloadIcsFile}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/40 bg-transparent px-6 py-3 text-sm font-medium tracking-wide text-gold-deep transition-colors hover:bg-gold/10 sm:flex-none"
            >
              <CalendarIcon className="h-4 w-4" />
              .ics File
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
