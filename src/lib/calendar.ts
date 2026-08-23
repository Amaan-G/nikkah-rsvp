import { eventConfig } from "../config/event";

function toCalendarStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function getEventWindow(): { start: Date; end: Date } {
  const start = new Date(eventConfig.event.dateISO);
  const end = new Date(
    start.getTime() + eventConfig.event.durationHours * 60 * 60 * 1000,
  );
  return { start, end };
}

export function buildGoogleCalendarUrl(): string {
  const { start, end } = getEventWindow();
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${eventConfig.coupleNames}'s Nikkah`,
    dates: `${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    details: eventConfig.event.additionalNotes,
    location: `${eventConfig.event.venueName}, ${eventConfig.event.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsFileContent(): string {
  const { start, end } = getEventWindow();
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nikkah RSVP//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@nikkah-rsvp`,
    `DTSTAMP:${toCalendarStamp(new Date())}`,
    `DTSTART:${toCalendarStamp(start)}`,
    `DTEND:${toCalendarStamp(end)}`,
    `SUMMARY:${eventConfig.coupleNames}'s Nikkah`,
    `DESCRIPTION:${eventConfig.event.additionalNotes}`,
    `LOCATION:${eventConfig.event.venueName}, ${eventConfig.event.address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(): void {
  const blob = new Blob([buildIcsFileContent()], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${eventConfig.coupleNames.replace(/\s+/g, "-")}-nikkah.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
