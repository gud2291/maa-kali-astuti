import "server-only";
import {
  AstroTime,
  Body,
  Ecliptic,
  EclipticGeoMoon,
  GeoVector,
  SunPosition,
} from "astronomy-engine";
import type { GrahaKey } from "@/lib/domain/kundali";
import { getLahiriAyanamsa, trueLahiriAyanamsa } from "./ayanamsa";

export function norm(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export type RawPlanetCalc = {
  k: GrahaKey;
  lon: number; // sidereal longitude 0–360
  retro: boolean;
};

const BODY_MAP: Record<"ma" | "me" | "ju" | "ve" | "sa", Body> = {
  ma: Body.Mars,
  me: Body.Mercury,
  ju: Body.Jupiter,
  ve: Body.Venus,
  sa: Body.Saturn,
};

function getSiderealLonForBody(
  key: "ma" | "me" | "ju" | "ve" | "sa",
  t: AstroTime,
  trueLahiri: number,
): number {
  const body = BODY_MAP[key];
  const vec = GeoVector(body, t, true);
  const ecl = Ecliptic(vec);
  return norm(ecl.elon - trueLahiri);
}

/**
 * Computes sidereal longitudes and retrograde status for all 9 grahas
 * in standard order: su, mo, ma, me, ju, ve, sa, ra, ke.
 */
export function computePlanets(t: AstroTime): RawPlanetCalc[] {
  const { meanLahiri, trueLahiri } = getLahiriAyanamsa(t);

  // 1. Sun
  const sunTrop = SunPosition(t).elon;
  const sunSid = norm(sunTrop - trueLahiri);

  // 2. Moon
  const moonTrop = EclipticGeoMoon(t).lon;
  const moonSid = norm(moonTrop - trueLahiri);

  // 3. Rahu & Ketu (Meeus mean lunar node minus mean Lahiri)
  const T = t.tt / 36525;
  const meeusMeanNode =
    125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  const rahuSid = norm(meeusMeanNode - meanLahiri);
  const ketuSid = norm(rahuSid + 180);

  // For retrograde calculation: ±12 hours (0.5 days) difference
  const tPlus = new AstroTime(t.ut + 0.5);
  const tMinus = new AstroTime(t.ut - 0.5);
  const trueLahiriPlus = trueLahiriAyanamsa(tPlus);
  const trueLahiriMinus = trueLahiriAyanamsa(tMinus);

  function isRetro(key: "ma" | "me" | "ju" | "ve" | "sa"): boolean {
    const lonPlus = getSiderealLonForBody(key, tPlus, trueLahiriPlus);
    const lonMinus = getSiderealLonForBody(key, tMinus, trueLahiriMinus);
    let diff = lonPlus - lonMinus;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff < 0;
  }

  // 4. Mars...Saturn
  const maSid = getSiderealLonForBody("ma", t, trueLahiri);
  const meSid = getSiderealLonForBody("me", t, trueLahiri);
  const juSid = getSiderealLonForBody("ju", t, trueLahiri);
  const veSid = getSiderealLonForBody("ve", t, trueLahiri);
  const saSid = getSiderealLonForBody("sa", t, trueLahiri);

  return [
    { k: "su", lon: sunSid, retro: false },
    { k: "mo", lon: moonSid, retro: false },
    { k: "ma", lon: maSid, retro: isRetro("ma") },
    { k: "me", lon: meSid, retro: isRetro("me") },
    { k: "ju", lon: juSid, retro: isRetro("ju") },
    { k: "ve", lon: veSid, retro: isRetro("ve") },
    { k: "sa", lon: saSid, retro: isRetro("sa") },
    { k: "ra", lon: rahuSid, retro: true },
    { k: "ke", lon: ketuSid, retro: true },
  ];
}
