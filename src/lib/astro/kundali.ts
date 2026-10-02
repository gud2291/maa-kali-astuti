/* Approximate Janam Kundali, ported 1:1 from mka-astro.js 67–108 (prototype-grade maths:
   low-precision Sun/Moon/planet longitudes, Lahiri-style ayanamsa, IST assumed for every
   city — INV gotcha 13). Phase B replaces this with Swiss Ephemeris on the server. */
import cities from "@/lib/data/cities.json";
import demoKundali from "@/lib/data/demo-kundali.json";
import graha from "@/lib/data/graha.json";
import nakshatra from "@/lib/data/nakshatra.json";

/** [town, state, latitude, longitude]. */
export type City = [string, string, number, number];
export type Graha = (typeof graha)[number];
export type GrahaKey = "su" | "mo" | "ma" | "me" | "ju" | "ve" | "sa" | "ra" | "ke";

export type Planet = Graha & {
  lon: number;
  /** 0–11 (Mesha = 0). */
  sign: number;
  degS: string;
  /** 1–12, counted from the Lagna. */
  house: number;
  retro: boolean;
  nak: string;
};

export type Kundali = {
  /** 0–11. */
  lagna: number;
  lagnaDeg: string;
  /** Moon sign (Chandra rashi), 0–11. */
  rashi: number;
  nak: string;
  pada: number;
  planets: Planet[];
  /** Birth time unknown → calculated for 12:00 noon. */
  unknown: boolean;
  city: City;
};

export const GRAHA = graha as readonly Graha[];
export const NAK = nakshatra as readonly string[];
export const CITIES = cities as unknown as readonly City[];

/** Demo chart: 12 Nov 1986, 06:40, Varanasi (A.DEMO_K, precomputed by the extractor). */
export const DEMO_K = demoKundali as unknown as Kundali;

/** Town search for the place combobox: prefix matches first, then "contains", max 6 (A.placeSearch 74). */
export function placeSearch(q: string): City[] {
  const s = String(q || "")
    .trim()
    .toLowerCase();
  if (!s) return [];
  const a = CITIES.filter((c) => c[0].toLowerCase().startsWith(s));
  const b = CITIES.filter((c) => !c[0].toLowerCase().startsWith(s) && `${c[0]} ${c[1]}`.toLowerCase().includes(s));
  return a.concat(b).slice(0, 6);
}

