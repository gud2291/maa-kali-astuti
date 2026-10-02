import "server-only";
import type { GrahaKey } from "@/lib/domain/kundali";

export const NAKSHATRA_SPAN = 40 / 3; // 13°20'
export const PADA_SPAN = 10 / 3; // 3°20'

export const NAKSHATRA_LORDS: GrahaKey[] = [
  "ke",
  "ve",
  "su",
  "mo",
  "ma",
  "ra",
  "ju",
  "sa",
  "me",
];

export type NakshatraInfo = {
  index: number; // 0–26
  pada: number; // 1–4
  lord: GrahaKey;
};

/**
 * Calculates nakshatra index (0–26), pada (1–4), and planetary lord
 * from sidereal longitude (0–360).
 */
export function getNakshatra(lon: number): NakshatraInfo {
  const normLon = ((lon % 360) + 360) % 360;
  const index = Math.floor(normLon / NAKSHATRA_SPAN);
  const pada = Math.floor((normLon % NAKSHATRA_SPAN) / PADA_SPAN) + 1;
  const lord = NAKSHATRA_LORDS[index % 9];
  return { index, pada, lord };
}

/**
 * Navamsa (D9) sign from sidereal longitude (0–11).
 * floor(lon / (10/3)) mod 12
 */
export function getNavamsaSign(lon: number): number {
  const normLon = ((lon % 360) + 360) % 360;
  return Math.floor(normLon / PADA_SPAN) % 12;
}

/**
 * Whole-sign house (1–12) counted from a reference sign (0–11).
 * refSign is typically the Lagna sign (or the Moon sign if birth time is unknown).
 */
export function getWholeSignHouse(planetSign: number, refSign: number): number {
  return ((planetSign - refSign + 12) % 12) + 1;
}
