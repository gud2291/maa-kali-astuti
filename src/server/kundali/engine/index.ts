import "server-only";
import { MakeTime } from "astronomy-engine";
import type { ChartPlanet, ChartSnapshot, GrahaKey } from "@/lib/domain/kundali";
import { birthToUtc } from "./time";
import { getLahiriAyanamsa } from "./ayanamsa";
import { computePlanets } from "./planets";
import { computeLagna } from "./lagna";
import { getNakshatra, getNavamsaSign, getWholeSignHouse } from "./nakshatra";
import { computeVimshottariDashas } from "./dasha";
import { computePanchang } from "./panchang";
import { computeDoshas } from "./doshas";
import { computeYogas } from "./yogas";

export type ComputeChartInput = {
  name: string;
  dob: string; // YYYY-MM-DD
  tob: string | null; // HH:mm or null
  tobUnknown: boolean;
  place: string;
  lat: number;
  lon: number;
  tz: string;
};

/**
 * Computes a full sidereal Lahiri Vedic astrology chart.
 * Pure function with zero I/O.
 */
export function computeChart(
  input: ComputeChartInput,
  now: Date = new Date(),
): ChartSnapshot {
  // 1. Convert wall birth time into UTC Date
  const birthDate = birthToUtc({
    dob: input.dob,
    tob: input.tob,
    tobUnknown: input.tobUnknown,
    tz: input.tz,
  });
  const birthUtcMs = birthDate.getTime();
  const t = MakeTime(birthDate);

  // 2. Lahiri ayanamsa
  const { trueLahiri } = getLahiriAyanamsa(t);

  // 3. Raw sidereal planet longitudes and retrograde status
  const rawPlanets = computePlanets(t);
  const sunRaw = rawPlanets.find((p) => p.k === "su")!;
  const moonRaw = rawPlanets.find((p) => p.k === "mo")!;
  const moonSign = Math.floor(moonRaw.lon / 30);
  const sunSign = Math.floor(sunRaw.lon / 30);

  // 4. Lagna (Ascendant)
  let lagna: ChartSnapshot["lagna"] = null;
  if (!input.tobUnknown) {
    const lagnaCalc = computeLagna(t, input.lat, input.lon, trueLahiri);
    const lagnaNak = getNakshatra(lagnaCalc.lon);
    lagna = {
      lon: lagnaCalc.lon,
      sign: lagnaCalc.sign,
      deg: lagnaCalc.deg,
      nak: lagnaNak.index,
      pada: lagnaNak.pada,
    };
  }

  // 5. ChartPlanets with whole-sign houses, nakshatras, and navamsas
  const refSign = lagna !== null ? lagna.sign : moonSign;
  const planets: ChartPlanet[] = rawPlanets.map((p) => {
    const sign = Math.floor(p.lon / 30);
    const deg = p.lon % 30;
    const nakInfo = getNakshatra(p.lon);
    const d9 = getNavamsaSign(p.lon);
    const house = getWholeSignHouse(sign, refSign);
    return {
      k: p.k,
      lon: p.lon,
      sign,
      deg,
      house,
      nak: nakInfo.index,
      pada: nakInfo.pada,
      retro: p.retro,
      d9,
    };
  });

  // 6. Moon's nakshatra & lord
  const moonNakInfo = getNakshatra(moonRaw.lon);
  const nakshatra = {
    index: moonNakInfo.index,
    pada: moonNakInfo.pada,
    lord: moonNakInfo.lord,
  };

  // 7. Panchang
  const panchang = computePanchang({
    sunSid: sunRaw.lon,
    moonSid: moonRaw.lon,
    dob: input.dob,
    birthDate,
    lat: input.lat,
    lon: input.lon,
    tz: input.tz,
  });

  // 8. Vimshottari Dashas
  const dashas = computeVimshottariDashas(moonRaw.lon, birthUtcMs);

  // 9. Doshas
  const marsPlanet = planets.find((p) => p.k === "ma")!;
  const rahuPlanet = planets.find((p) => p.k === "ra")!;
  const ketuPlanet = planets.find((p) => p.k === "ke")!;
  const doshas = computeDoshas({
    marsSign: marsPlanet.sign,
    moonSign,
    lagnaSign: lagna ? lagna.sign : null,
    rahuHouse: rahuPlanet.house,
    rahuLon: rahuPlanet.lon,
    ketuLon: ketuPlanet.lon,
    planetLons: planets.map((p) => ({ k: p.k, lon: p.lon })),
    birthUtcMs,
    now,
  });

  // 10. Yogas
  const planetSignsMap = {} as Record<GrahaKey, number>;
  for (const p of planets) {
    planetSignsMap[p.k] = p.sign;
  }
  const yogas = computeYogas({
    planetSigns: planetSignsMap,
    lagnaSign: lagna ? lagna.sign : null,
  });

  return {
    v: 1,
    input: {
      name: input.name,
      dob: input.dob,
      tob: input.tob,
      tobUnknown: input.tobUnknown,
      place: input.place,
      lat: input.lat,
      lon: input.lon,
      tz: input.tz,
      utcMs: birthUtcMs,
    },
    ayanamsa: trueLahiri,
    lagna,
    planets,
    moonSign,
    sunSign,
    nakshatra,
    panchang,
    dashas,
    doshas,
    yogas,
  };
}
