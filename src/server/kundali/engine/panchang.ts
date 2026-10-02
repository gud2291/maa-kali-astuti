import "server-only";
import { Body, Observer, SearchRiseSet } from "astronomy-engine";
import { birthToUtc } from "./time";

export type PanchangResult = {
  tithi: number; // 1–30
  paksha: "shukla" | "krishna";
  yoga: number; // 1–27
  karana: number; // 1–60
  vara: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
};

export type PanchangInput = {
  sunSid: number;
  moonSid: number;
  dob: string;
  birthDate: Date;
  lat: number;
  lon: number;
  tz: string;
};

/**
 * Computes the 5 limbs of Panchang:
 * - Tithi (1–30) and Paksha (shukla <= 15, krishna > 15)
 * - Yoga (1–27)
 * - Karana (1–60)
 * - Vara (0–6), adjusted by local sunrise (birth before sunrise counts as previous day)
 */
export function computePanchang(input: PanchangInput): PanchangResult {
  const { sunSid, moonSid, dob, birthDate, lat, lon, tz } = input;

  // Elongation: (moon - sun) mod 360
  const e = ((moonSid - sunSid) % 360 + 360) % 360;

  // Tithi: 1 to 30
  const tithi = Math.floor(e / 12) + 1;
  const paksha: "shukla" | "krishna" = tithi <= 15 ? "shukla" : "krishna";

  // Yoga: floor(((sun + moon) mod 360) / (40/3)) + 1
  const sum = ((sunSid + moonSid) % 360 + 360) % 360;
  const yoga = Math.floor(sum / (40 / 3)) + 1;

  // Karana: floor(e / 6) + 1 (1 to 60)
  const karana = Math.floor(e / 6) + 1;

  // Vara (weekday):
  const [y, m, d] = dob.split("-").map(Number);
  const localWeekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();

  let vara = localWeekday;
  const localMidnight = birthToUtc({
    dob,
    tob: "00:00",
    tobUnknown: false,
    tz,
  });

  const observer = new Observer(lat, lon, 0);
  const sunriseTime = SearchRiseSet(Body.Sun, observer, +1, localMidnight, 1);

  if (sunriseTime) {
    const sunriseMs = sunriseTime.date.getTime();
    if (birthDate.getTime() < sunriseMs) {
      vara = (localWeekday - 1 + 7) % 7;
    }
  }

  return {
    tithi,
    paksha,
    yoga,
    karana,
    vara,
  };
}
