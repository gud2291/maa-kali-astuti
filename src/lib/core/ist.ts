export const IST_TZ = "Asia/Kolkata";

/** yyyy-mm-dd of the IST calendar day for the given instant. */
export function istDayKey(d: Date | number): string {
  const dt = typeof d === "number" ? new Date(d) : d;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(dt);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${day}`;
}

/** Convert an IST wall-clock time to a UTC Date. IST is fixed UTC+05:30. */
export function istWallToUtc(dayKey: string, hhmm: string): Date {
  const [y, mo, d] = dayKey.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  const utcMs = Date.UTC(y, mo - 1, d, h, mi) - (5 * 60 + 30) * 60_000;
  return new Date(utcMs);
}

/** Add n days to a dayKey string. */
export function addDaysKey(dayKey: string, n: number): string {
  const [y, mo, d] = dayKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d + n));
  const yy = dt.getUTCFullYear().toString();
  const mm = (dt.getUTCMonth() + 1).toString().padStart(2, "0");
  const dd = dt.getUTCDate().toString().padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** 0 = Sunday for a dayKey string. */
export function weekdayOfKey(dayKey: string): number {
  const [y, mo, d] = dayKey.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
}

/** Format a Date/epoch in IST. */
export function formatIst(
  d: Date | number,
  o: { date?: boolean; time?: boolean; weekday?: boolean; locale?: "en" | "hi" } = { date: true },
): string {
  const dt = typeof d === "number" ? new Date(d) : d;
  const loc = o.locale === "hi" ? "hi-IN" : "en-IN";
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: IST_TZ,
    numberingSystem: "latn",
  };

  // Date shows unless explicitly turned off ({ time: true } = date + time).
  if (o.date !== false) {
    opts.day = "numeric";
    opts.month = "short";
    opts.year = "numeric";
  }
  if (o.time) {
    opts.hour = "numeric";
    opts.minute = "2-digit";
    opts.hour12 = true;
  }
  if (o.weekday) {
    opts.weekday = "short";
  }

  return new Intl.DateTimeFormat(loc, opts).format(dt);
}

/** Start day of a rashifal period: day → itself, week → Monday, month → 1st, year → 1 Jan.
 *  Isomorphic (the admin editor snaps its date picker with it). */
export function periodStartKey(period: "day" | "week" | "month" | "year", dayKey: string): string {
  if (period === "day") return dayKey;
  if (period === "week") return addDaysKey(dayKey, -((weekdayOfKey(dayKey) + 6) % 7));
  if (period === "month") return `${dayKey.slice(0, 7)}-01`;
  return `${dayKey.slice(0, 4)}-01-01`;
}
