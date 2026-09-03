import { eventConfig, type EventDetail } from "../config/event";

function toCalendarStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function getEventWindow(event: EventDetail): { start: Date; end: Date } {
  const start = new Date(event.dateISO);
  const end = new Date(start.getTime() + event.durationHours * 60 * 60 * 1000);
  return { start, end };
}

export function buildGoogleCalendarUrl(event: EventDetail): string {
  const { start, end } = getEventWindow(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${eventConfig.coupleNames}'s ${event.name}`,
    dates: `${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    details: event.notes ?? "",
    location: `${event.venueName}, ${event.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsFileContent(event: EventDetail): string {
  const { start, end } = getEventWindow(event);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nikkah RSVP//EN",
    "BEGIN:VEVENT",
    `UID:${event.slug}-${Date.now()}@nikkah-rsvp`,
    `DTSTAMP:${toCalendarStamp(new Date())}`,
    `DTSTART:${toCalendarStamp(start)}`,
    `DTEND:${toCalendarStamp(end)}`,
    `SUMMARY:${eventConfig.coupleNames}'s ${event.name}`,
    `DESCRIPTION:${event.notes ?? ""}`,
    `LOCATION:${event.venueName}, ${event.address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(event: EventDetail): void {
  const blob = new Blob([buildIcsFileContent(event)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${eventConfig.coupleNames.replace(/\s+/g, "-")}-${event.slug}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
