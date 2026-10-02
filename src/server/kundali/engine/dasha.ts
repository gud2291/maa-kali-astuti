import "server-only";
import type { DashaPeriod, GrahaKey } from "@/lib/domain/kundali";
import { NAKSHATRA_LORDS, NAKSHATRA_SPAN } from "./nakshatra";

export const DASHA_YEARS: Record<GrahaKey, number> = {
  ke: 7,
  ve: 20,
  su: 6,
  mo: 10,
  ma: 7,
  ra: 18,
  ju: 16,
  sa: 19,
  me: 17,
};

const YEAR_MS = 365.25 * 86400 * 1000;

/**
 * Computes Vimshottari Mahadasha and Antardasha sequence from birth up to 120 years.
 *
 * @param moonLon Sidereal longitude of the natal Moon (0–360).
 * @param birthUtcMs Birth time in UTC epoch ms.
 */
export function computeVimshottariDashas(
  moonLon: number,
  birthUtcMs: number,
): DashaPeriod[] {
  const normLon = ((moonLon % 360) + 360) % 360;
  const nakIndex = Math.floor(normLon / NAKSHATRA_SPAN);
  const fractionElapsed = (normLon % NAKSHATRA_SPAN) / NAKSHATRA_SPAN;

  const firstLord = NAKSHATRA_LORDS[nakIndex % 9];
  const firstLordYears = DASHA_YEARS[firstLord];
  const firstLordIdx = NAKSHATRA_LORDS.indexOf(firstLord);

  const nominalStartMs = birthUtcMs - fractionElapsed * firstLordYears * YEAR_MS;
  const nominalEndMs = nominalStartMs + firstLordYears * YEAR_MS;

  const periods: DashaPeriod[] = [];

  // 1. First Mahadasha (partial)
  let currAdStart = nominalStartMs;
  const firstSubs: { lord: GrahaKey; start: number; end: number }[] = [];

  for (let j = 0; j < 9; j++) {
    const adLord = NAKSHATRA_LORDS[(firstLordIdx + j) % 9];
    const adYears = (firstLordYears * DASHA_YEARS[adLord]) / 120;
    const adDurationMs = adYears * YEAR_MS;
    const adEnd = currAdStart + adDurationMs;

    if (adEnd > birthUtcMs) {
      firstSubs.push({
        lord: adLord,
        start: Math.max(currAdStart, birthUtcMs),
        end: adEnd,
      });
    }
    currAdStart = adEnd;
  }

  periods.push({
    lord: firstLord,
    start: birthUtcMs,
    end: nominalEndMs,
    sub: firstSubs,
  });

  // 2. Subsequent Mahadashas until birth + 120 years
  const endThresholdMs = birthUtcMs + 120 * YEAR_MS;
  let currMdStart = nominalEndMs;
  let k = 1;

  while (currMdStart < endThresholdMs) {
    const mdLord = NAKSHATRA_LORDS[(firstLordIdx + k) % 9];
    const mdYears = DASHA_YEARS[mdLord];
    const mdEnd = currMdStart + mdYears * YEAR_MS;
    const mdLordIdx = NAKSHATRA_LORDS.indexOf(mdLord);

    const subs: { lord: GrahaKey; start: number; end: number }[] = [];
    let subStart = currMdStart;

    for (let j = 0; j < 9; j++) {
      const subLord = NAKSHATRA_LORDS[(mdLordIdx + j) % 9];
      const subYears = (mdYears * DASHA_YEARS[subLord]) / 120;
      const subEnd = subStart + subYears * YEAR_MS;
      subs.push({
        lord: subLord,
        start: subStart,
        end: subEnd,
      });
      subStart = subEnd;
    }

    periods.push({
      lord: mdLord,
      start: currMdStart,
      end: mdEnd,
      sub: subs,
    });

    currMdStart = mdEnd;
    k++;
  }

  return periods;
}
