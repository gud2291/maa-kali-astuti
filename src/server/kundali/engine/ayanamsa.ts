import "server-only";
import { e_tilt, type AstroTime } from "astronomy-engine";

/**
 * Computes IAU-2006 general precession in longitude (in arcseconds)
 * for Julian centuries T since J2000 in Terrestrial Time.
 */
function generalPrecessionPA(T: number): number {
  return (
    5028.796195 * T +
    1.1054348 * T * T +
    0.00007964 * T ** 3 -
    0.000023857 * T ** 4 -
    0.0000000383 * T ** 5
  );
}

/**
 * Computes mean Lahiri (Chitrapaksha) ayanamsa in degrees.
 * Anchored to Swiss Ephemeris Lahiri value at J2000 (23.857092°).
 */
export function meanLahiriAyanamsa(time: AstroTime): number {
  const T = time.tt / 36525;
  const pA = generalPrecessionPA(T);
  return 23.857092 + pA / 3600;
}

/**
 * Computes true Lahiri ayanamsa in degrees (mean Lahiri + nutation in longitude dpsi).
 *
 * Self-check:
 * - 2000-01-01 12:00 UT -> true ≈ 23.853°
 * - 2024-01-01 00:00 UT -> true ≈ 24.19°
 */
export function trueLahiriAyanamsa(time: AstroTime): number {
  const mean = meanLahiriAyanamsa(time);
  const tilt = e_tilt(time);
  return mean + tilt.dpsi / 3600;
}

export function getLahiriAyanamsa(time: AstroTime): {
  meanLahiri: number;
  trueLahiri: number;
} {
  const mean = meanLahiriAyanamsa(time);
  const tilt = e_tilt(time);
  return {
    meanLahiri: mean,
    trueLahiri: mean + tilt.dpsi / 3600,
  };
}
