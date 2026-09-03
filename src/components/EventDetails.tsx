import type { EventDetail } from "../config/event";
import { eventConfig } from "../config/event";
import { buildGoogleCalendarUrl, downloadIcsFile } from "../lib/calendar";
import { ArchDivider } from "./decor/ArchDivider";
import { Ornament } from "./decor/Ornament";
import { Reveal } from "./decor/Reveal";
import { CalendarIcon, ClockIcon, MapPinIcon } from "./decor/icons";

function EventDetailBlock({ event, index }: { event: EventDetail; index: number }) {
  const stats = [
    { icon: CalendarIcon, label: "Date", value: `${event.dayOfWeek}, ${event.dateLabel}` },
    { icon: ClockIcon, label: "Time", value: event.timeLabel },
    { icon: MapPinIcon, label: "Venue", value: event.venueName, sub: event.address },
  ];

  return (
    <Reveal delay={index * 0.1} className={index > 0 ? "mt-16" : ""}>
      <div className="text-center">
        <h3 className="font-display text-2xl text-gold-deep sm:text-3xl">{event.name}</h3>
        {event.notes && (
          <p className="mx-auto mt-3 max-w-md text-balance text-sm text-emerald-deep/70">
            {event.notes}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {stats.map(({ icon: Icon, label, value, sub }) => (
          <div
            key={label}
            className="group h-full rounded-2xl border border-gold/25 bg-ivory/70 p-8 text-center shadow-[0_1px_0_rgba(185,141,62,0.12)] backdrop-blur-sm transition-transform duration-500 hover:-translate-y-1"
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold-deep">
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-5 text-xs uppercase tracking-[0.25em] text-gold-deep">{label}</p>
            <p className="mt-2 font-display text-lg text-emerald-deep">{value}</p>
            {sub && <p className="mt-1 text-sm text-emerald-deep/65">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href={eventConfig.directionsUrl(event)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-deep/20 bg-emerald-deep px-6 py-2.5 text-sm font-medium tracking-wide text-ivory transition-colors hover:bg-emerald-light sm:w-auto"
        >
          <MapPinIcon className="h-4 w-4" />
          Get Directions
        </a>
        <div className="flex w-full gap-3 sm:w-auto">
          <a
            href={buildGoogleCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/40 bg-transparent px-5 py-2.5 text-sm font-medium tracking-wide text-gold-deep transition-colors hover:bg-gold/10 sm:flex-none"
          >
            <CalendarIcon className="h-4 w-4" />
            Google Calendar
          </a>
          <button
            type="button"
            onClick={() => downloadIcsFile(event)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/40 bg-transparent px-5 py-2.5 text-sm font-medium tracking-wide text-gold-deep transition-colors hover:bg-gold/10 sm:flex-none"
          >
            <CalendarIcon className="h-4 w-4" />
            .ics File
          </button>
        </div>
      </div>
    </Reveal>
  );
}

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
            Please join us across the following celebrations.
          </p>
        </Reveal>

        <div className="mt-16">
          {eventConfig.events.map((event, i) => (
            <EventDetailBlock key={event.slug} event={event} index={i} />
          ))}
        </div>

        <Reveal delay={0.5} className="mt-16 text-center">
          <p className="text-sm text-emerald-deep/70">
            <span className="font-medium text-emerald-deep">Attire:</span>{" "}
            {eventConfig.dressCode}
          </p>
          <p className="mt-2 text-sm text-emerald-deep/70">
            Kindly RSVP by{" "}
            <span className="font-medium text-emerald-deep">
              {eventConfig.rsvpDeadlineLabel}
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
