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

const D2R = Math.PI / 180;
const norm = (x: number) => ((x % 360) + 360) % 360;

function jd(y: number, m: number, d: number, h: number): number {
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5 + h / 24;
}

/** Tropical longitudes for day number d (days since J2000). */
function longs(d: number): Record<GrahaKey, number> {
  const g = norm(357.529 + 0.98560028 * d);
  const L = norm(280.459 + 0.98564736 * d);
  const su = norm(L + 1.915 * Math.sin(g * D2R) + 0.02 * Math.sin(2 * g * D2R));
  const L0 = norm(218.316 + 13.176396 * d);
  const Mm = norm(134.963 + 13.064993 * d);
  const Dm = norm(297.85 + 12.190749 * d);
  const F = norm(93.272 + 13.22935 * d);
  const mo = norm(
    L0 +
      6.289 * Math.sin(Mm * D2R) +
      1.274 * Math.sin((2 * Dm - Mm) * D2R) +
      0.658 * Math.sin(2 * Dm * D2R) +
      0.214 * Math.sin(2 * Mm * D2R) -
      0.186 * Math.sin(g * D2R) -
      0.114 * Math.sin(2 * F * D2R),
  );
  const E = [-Math.cos(su * D2R), -Math.sin(su * D2R)];
  const o = { su, mo } as Record<GrahaKey, number>;
  const EL: Record<"me" | "ve" | "ma" | "ju" | "sa", [number, number, number]> = {
    me: [252.251, 4.09233445, 0.387],
    ve: [181.98, 1.60213034, 0.723],
    ma: [355.433, 0.52402068, 1.524],
    ju: [34.351, 0.08308529, 5.203],
    sa: [50.077, 0.03344414, 9.537],
  };
  (Object.keys(EL) as (keyof typeof EL)[]).forEach((k) => {
    const [l0, n, a] = EL[k];
    const l = norm(l0 + n * d) * D2R;
    o[k] = norm(Math.atan2(a * Math.sin(l) - E[1], a * Math.cos(l) - E[0]) / D2R);
  });
  o.ra = norm(125.0445 - 0.0529538 * d);
  o.ke = norm(o.ra + 180);
  return o;
}

/** 12.34 → "12°20′". */
const dms = (x: number) => {
  const d = Math.floor(x);
  const m = Math.floor((x - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′`;
};

export type BirthInput = {
  /** yyyy-mm-dd */
  dob: string;
  /** hh:mm (24 h); ignored when `unknown`. */
  tob?: string;
  unknown?: boolean;
  city?: City | null;
};

/** A.kundali (mka-astro.js 90–107). */
export function kundali(o: BirthInput): Kundali {
  const [Y, Mo, Dd] = String(o.dob).split("-").map(Number);
  const [hh, mm] = (o.unknown || !o.tob ? "12:00" : o.tob).split(":").map(Number);
  const c = o.city || CITIES[0];
  const d = jd(Y, Mo, Dd, hh + mm / 60 - 5.5) - 2451545;
  const T = d / 36525;
  const ay = 23.853 + 0.013969 * (Y + (Mo - 1) / 12 - 2000);
  const sid = (x: number) => norm(x - ay);
  const L1 = longs(d);
  const L2 = longs(d + 1);
  const lat = c[2] * D2R;
  const lst = norm(280.46061837 + 360.98564736629 * d + c[3]) * D2R;
  const eps = (23.4393 - 0.013 * T) * D2R;
  const asc = sid(
    norm(Math.atan2(Math.cos(lst), -(Math.sin(lst) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps))) / D2R),
  );
  const lagna = Math.floor(asc / 30);
  const planets: Planet[] = GRAHA.map((g) => {
    const k = g.k as GrahaKey;
    const lon = sid(L1[k]);
    let dl = L2[k] - L1[k];
    if (dl > 180) dl -= 360;
    if (dl < -180) dl += 360;
    const sign = Math.floor(lon / 30);
    return {
      ...g,
      lon,
      sign,
      degS: dms(lon % 30),
      house: ((sign - lagna + 12) % 12) + 1,
      retro: k === "ra" || k === "ke" || dl < 0,
      nak: NAK[Math.floor(lon / (360 / 27))],
    };
  });
  const moon = planets[1];
  return {
    lagna,
    lagnaDeg: dms(asc % 30),
    rashi: moon.sign,
    nak: NAK[Math.floor(moon.lon / (360 / 27))],
    pada: Math.floor((moon.lon % (360 / 27)) / (360 / 108)) + 1,
    planets,
    unknown: !!o.unknown,
    city: c,
  };
}
