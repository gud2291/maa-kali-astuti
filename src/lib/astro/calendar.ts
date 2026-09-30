/* Calendar exports for a booked session, ported from mka-astro.js 323–325 (icsT, A.ics, A.gcal).
   `now` is the DTSTAMP; callers pass it explicitly (INV gotcha 14). */

export type CalEvent = {
  /** Booking id (MKA-B…), used for the event UID. */
  id: string;
  start: Date;
  mins: number;
  title: string;
  desc: string;
  loc: string;
};

/** 2026-10-02T08:30:00.000Z → 20261002T083000Z */
const icsT = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const end = (o: CalEvent) => new Date(o.start.getTime() + o.mins * 60000);

/** An iCalendar file (Apple Calendar, Outlook). CRLF line endings, as in the prototype. */
export function ics(o: CalEvent, now: Date = new Date()): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maa Kali Astuti//Booking//EN",
    "BEGIN:VEVENT",
    "UID:" + o.id + "@sadhakpawanpandey.com",
    "DTSTAMP:" + icsT(now),
    "DTSTART:" + icsT(o.start),
    "DTEND:" + icsT(end(o)),
    "SUMMARY:" + o.title,
    "DESCRIPTION:" + o.desc,
    "LOCATION:" + o.loc,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Google Calendar "create event" URL. */
export function gcal(o: CalEvent): string {
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
    encodeURIComponent(o.title) +
    "&dates=" +
    icsT(o.start) +
    "/" +
    icsT(end(o)) +
    "&details=" +
    encodeURIComponent(o.desc) +
    "&location=" +
    encodeURIComponent(o.loc)
  );
}

/** Saves the .ics through a temporary object-URL link. Client-only. */
export function downloadIcs(o: CalEvent, filename: string) {
  const url = URL.createObjectURL(new Blob([ics(o)], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
