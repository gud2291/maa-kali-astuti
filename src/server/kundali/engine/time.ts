import "server-only";

/**
 * Returns the offset in minutes between the given IANA timezone and UTC at the instant `at`.
 * Positive east of Greenwich (e.g. +330 for Asia/Kolkata).
 */
export function tzOffsetMin(tz: string, at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  const parts = dtf.formatToParts(at);
  let year = 1970;
  let month = 1;
  let day = 1;
  let hour = 0;
  let minute = 0;
  let second = 0;

  for (const p of parts) {
    if (p.type === "year") year = Number(p.value);
    else if (p.type === "month") month = Number(p.value);
    else if (p.type === "day") day = Number(p.value);
    else if (p.type === "hour") hour = Number(p.value);
    else if (p.type === "minute") minute = Number(p.value);
    else if (p.type === "second") second = Number(p.value);
  }

  // Construct UTC timestamp corresponding to local clock reading in that timezone
  const localAsUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);
  const diffMs = localAsUtcMs - at.getTime();
  return Math.round(diffMs / 60000);
}

export type BirthTimeInput = {
  dob: string; // YYYY-MM-DD
  tob?: string | null; // HH:mm
  tobUnknown?: boolean;
  tz: string; // IANA timezone e.g. "Asia/Kolkata"
};

/**
 * Converts wall birth time into a UTC Date.
 * Unknown birth time defaults to 12:00 noon.
 * Two passes of `local − offset` resolve historical and daylight shifts accurately.
 */
export function birthToUtc(input: BirthTimeInput): Date {
  const [yStr, mStr, dStr] = input.dob.split("-");
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);

  let hour = 12;
  let minute = 0;
  if (!input.tobUnknown && input.tob) {
    const [hStr, minStr] = input.tob.split(":");
    hour = Number(hStr);
    minute = Number(minStr);
  }

  // Treat local clock reading as UTC to start approximation
  const localMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  // Pass 1: offset at nominal local instant
  const offset1 = tzOffsetMin(input.tz, new Date(localMs));
  const approxUtcMs = localMs - offset1 * 60000;

  // Pass 2: refine offset at the approximated UTC instant
  const offset2 = tzOffsetMin(input.tz, new Date(approxUtcMs));
  const finalUtcMs = localMs - offset2 * 60000;

  return new Date(finalUtcMs);
}
