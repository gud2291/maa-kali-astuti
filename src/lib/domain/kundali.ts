export type GrahaKey = "su" | "mo" | "ma" | "me" | "ju" | "ve" | "sa" | "ra" | "ke"; // same keys as src/lib/astro/kundali.ts

export type ChartPlanet = {
  k: GrahaKey;
  lon: number; // sidereal longitude 0–360
  sign: number;
  deg: number; // sign 0 = Mesha … 11 = Meena; degrees inside the sign
  house: number; // 1–12, whole-sign from the lagna (from the Moon sign when birth time is unknown)
  nak: number;
  pada: number; // nakshatra 0–26, pada 1–4
  retro: boolean;
  d9: number; // retrograde; navamsa sign 0–11
};

export type DashaPeriod = {
  lord: GrahaKey;
  start: number;
  end: number;
  sub: { lord: GrahaKey; start: number; end: number }[];
}; // epoch ms

export type ChartSnapshot = {
  v: 1;
  input: {
    name: string;
    dob: string;
    tob: string | null;
    tobUnknown: boolean;
    place: string;
    lat: number;
    lon: number;
    tz: string;
    utcMs: number;
  };
  ayanamsa: number; // Lahiri (true), degrees
  lagna: {
    lon: number;
    sign: number;
    deg: number;
    nak: number;
    pada: number;
  } | null; // null when birth time is unknown
  planets: ChartPlanet[]; // 9, order su mo ma me ju ve sa ra ke
  moonSign: number;
  sunSign: number;
  nakshatra: { index: number; pada: number; lord: GrahaKey }; // Moon's
  panchang: {
    tithi: number;
    paksha: "shukla" | "krishna";
    yoga: number;
    karana: number;
    vara: number;
  };
  dashas: DashaPeriod[]; // Vimshottari, birth → 120 years
  doshas: {
    manglik: { fromLagna: boolean; fromMoon: boolean };
    kaalSarp: { present: boolean; type: number | null }; // type = Rahu's house 1–12
    sadeSati: {
      active: boolean;
      phase: "rising" | "peak" | "setting" | null;
      periods: { start: number; end: number }[];
    };
  };
  yogas: string[]; // keys from YOGA_KEYS (B25)
};
