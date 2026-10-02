import "server-only";
import placesData from "./places-data.json";

export type Place = {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz: string;
};

type InternalPlace = Place & {
  foldName: string;
  foldFull: string;
  words: string[];
};

function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Pre-process place records once per server instance
const RECORDS: InternalPlace[] = (() => {
  const tzList = placesData.tz as string[];
  const rawList = placesData.p as [
    string,
    string,
    string,
    number,
    number,
    number,
    number,
  ][];

  return rawList.map((item, idx) => {
    const [name, region, country, lat, lon, tzIdx] = item;
    const tz = tzList[tzIdx] || "UTC";
    const foldName = fold(name);
    const foldRegion = fold(region);
    const foldFull = `${foldName} ${foldRegion} ${fold(country)}`;
    const words = `${foldName} ${foldRegion}`
      .split(/\s+/)
      .filter((w) => w.length > 0);

    return {
      id: `${country}_${lat}_${lon}_${idx}`,
      name,
      region,
      country,
      lat,
      lon,
      tz,
      foldName,
      foldFull,
      words,
    };
  });
})();

/**
 * Searches places with ASCII-folded lowercase matching.
 * Priority:
 * 1. Prefix matches on name
 * 2. Word-start matches (on name or region)
 * 3. Contains matches
 * Ties are broken by population descending (RECORDS is pre-sorted by population).
 */
export function searchPlaces(q: string, limit = 8): Place[] {
  const term = fold(q);
  if (term.length < 2) return [];

  const prefix: Place[] = [];
  const wordStart: Place[] = [];
  const contains: Place[] = [];

  for (const r of RECORDS) {
    if (r.foldName.startsWith(term)) {
      prefix.push({
        id: r.id,
        name: r.name,
        region: r.region,
        country: r.country,
        lat: r.lat,
        lon: r.lon,
        tz: r.tz,
      });
      if (prefix.length >= limit) break;
      continue;
    }

    const hasWordStart = r.words.some((w) => w.startsWith(term));
    if (hasWordStart) {
      wordStart.push({
        id: r.id,
        name: r.name,
        region: r.region,
        country: r.country,
        lat: r.lat,
        lon: r.lon,
        tz: r.tz,
      });
      continue;
    }

    if (r.foldFull.includes(term)) {
      contains.push({
        id: r.id,
        name: r.name,
        region: r.region,
        country: r.country,
        lat: r.lat,
        lon: r.lon,
        tz: r.tz,
      });
    }
  }

  const results: Place[] = [];
  for (const p of prefix) {
    if (results.length >= limit) break;
    results.push(p);
  }
  for (const p of wordStart) {
    if (results.length >= limit) break;
    results.push(p);
  }
  for (const p of contains) {
    if (results.length >= limit) break;
    results.push(p);
  }

  return results;
}
