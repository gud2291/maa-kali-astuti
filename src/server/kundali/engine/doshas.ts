import "server-only";
import { AstroTime, Body, Ecliptic, GeoVector } from "astronomy-engine";
import { norm } from "./planets";
import { trueLahiriAyanamsa } from "./ayanamsa";

export type DoshasResult = {
  manglik: {
    fromLagna: boolean;
    fromMoon: boolean;
  };
  kaalSarp: {
    present: boolean;
    type: number | null; // Rahu's house (1–12)
  };
  sadeSati: {
    active: boolean;
    phase: "rising" | "peak" | "setting" | null;
    periods: { start: number; end: number }[];
  };
};

export type DoshasInput = {
  marsSign: number;
  moonSign: number;
  lagnaSign: number | null;
  rahuHouse: number;
  rahuLon: number;
  ketuLon: number;
  planetLons: { k: string; lon: number }[]; // 7 classical planets (su, mo, ma, me, ju, ve, sa)
  birthUtcMs: number;
  now?: Date;
};

const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];
const ONE_DAY_MS = 86400 * 1000;
const YEAR_MS = 365.25 * ONE_DAY_MS;

function getSaturnSignAtMs(ms: number): number {
  const t = new AstroTime(new Date(ms));
  const trueLahiri = trueLahiriAyanamsa(t);
  const vec = GeoVector(Body.Saturn, t, true);
  const ecl = Ecliptic(vec);
  const sidLon = norm(ecl.elon - trueLahiri);
  return Math.floor(sidLon / 30);
}

export function computeDoshas(input: DoshasInput): DoshasResult {
  const {
    marsSign,
    moonSign,
    lagnaSign,
    rahuHouse,
    rahuLon,
    ketuLon,
    planetLons,
    birthUtcMs,
    now = new Date(),
  } = input;

  // 1. Manglik
  const fromLagna =
    lagnaSign !== null
      ? MANGLIK_HOUSES.includes(((marsSign - lagnaSign + 12) % 12) + 1)
      : false;
  const fromMoon = MANGLIK_HOUSES.includes(
    ((marsSign - moonSign + 12) % 12) + 1,
  );

  // 2. Kaal Sarp: all 7 classical planets strictly inside 180° arc Rahu->Ketu or Ketu->Rahu
  const sevenKeys = new Set(["su", "mo", "ma", "me", "ju", "ve", "sa"]);
  const sevenPlanets = planetLons.filter((p) => sevenKeys.has(p.k));

  let allInRahuToKetu = sevenPlanets.length === 7;
  let allInKetuToRahu = sevenPlanets.length === 7;

  for (const p of sevenPlanets) {
    const diffRahu = norm(p.lon - rahuLon);
    if (!(diffRahu > 0 && diffRahu < 180)) {
      allInRahuToKetu = false;
    }

    const diffKetu = norm(p.lon - ketuLon);
    if (!(diffKetu > 0 && diffKetu < 180)) {
      allInKetuToRahu = false;
    }
  }

  const kaalSarpPresent = allInRahuToKetu || allInKetuToRahu;
  const kaalSarpType = kaalSarpPresent ? rahuHouse : null;

  // 3. Sade Sati: Saturn sidereal sign vs natal Moon sign
  const risingSign = (moonSign + 11) % 12;
  const peakSign = moonSign;
  const settingSign = (moonSign + 1) % 12;

  const isSadeSatiSign = (sign: number): boolean =>
    sign === risingSign || sign === peakSign || sign === settingSign;

  const currentSaturnSign = getSaturnSignAtMs(now.getTime());
  let active = false;
  let phase: "rising" | "peak" | "setting" | null = null;

  if (currentSaturnSign === risingSign) {
    active = true;
    phase = "rising";
  } else if (currentSaturnSign === peakSign) {
    active = true;
    phase = "peak";
  } else if (currentSaturnSign === settingSign) {
    active = true;
    phase = "setting";
  }

  // Periods: scan monthly (30 days) from birth to birth + 100 years, bisecting to 1 day
  const endTotalMs = birthUtcMs + 100 * YEAR_MS;
  const stepMs = 30 * ONE_DAY_MS;
  const periods: { start: number; end: number }[] = [];

  function bisect(t1: number, t2: number, targetInside: boolean): number {
    let low = t1;
    let high = t2;
    while (high - low > ONE_DAY_MS) {
      const mid = Math.floor((low + high) / 2);
      const midInside = isSadeSatiSign(getSaturnSignAtMs(mid));
      if (midInside === targetInside) {
        high = mid;
      } else {
        low = mid;
      }
    }
    return Math.floor((low + high) / 2);
  }

  let inSpan = isSadeSatiSign(getSaturnSignAtMs(birthUtcMs));
  let spanStart = birthUtcMs;
  let t = birthUtcMs;

  while (t < endTotalMs) {
    const nextT = Math.min(t + stepMs, endTotalMs);
    const nextInside = isSadeSatiSign(getSaturnSignAtMs(nextT));

    if (!inSpan && nextInside) {
      spanStart = bisect(t, nextT, true);
      inSpan = true;
    } else if (inSpan && !nextInside) {
      const spanEnd = bisect(t, nextT, false);
      periods.push({ start: spanStart, end: spanEnd });
      inSpan = false;
    }

    t = nextT;
  }

  if (inSpan) {
    periods.push({ start: spanStart, end: endTotalMs });
  }

  return {
    manglik: {
      fromLagna,
      fromMoon,
    },
    kaalSarp: {
      present: kaalSarpPresent,
      type: kaalSarpType,
    },
    sadeSati: {
      active,
      phase,
      periods,
    },
  };
}
