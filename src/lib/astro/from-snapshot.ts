import { GRAHA, NAK, type City, type Kundali, type Planet } from "./kundali";
import type { ChartSnapshot } from "@/lib/domain/kundali";

function dms(x: number): string {
  const d = Math.floor(x);
  const m = Math.floor((x - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′`;
}

/**
 * Maps a calculated ChartSnapshot from the server engine to the frontend `Kundali` interface.
 * Preserves compatibility with `chartLayout`, `KundaliChart`, `KundaliPreview`, and other UI components.
 */
export function toKundali(snap: ChartSnapshot): Kundali {
  const planets: Planet[] = snap.planets.map((p) => {
    const g = GRAHA.find((item) => item.k === p.k);
    if (!g) {
      throw new Error(`Unknown graha key: ${p.k}`);
    }
    return {
      ...g,
      lon: p.lon,
      sign: p.sign,
      degS: dms(p.deg),
      house: p.house,
      retro: p.retro,
      nak: NAK[p.nak] ?? "",
    };
  });

  const placeParts = snap.input.place.split(",");
  const town = placeParts[0]?.trim() || snap.input.place;
  const region = placeParts.slice(1).join(",").trim();
  const city: City = [town, region, snap.input.lat, snap.input.lon];

  return {
    lagna: snap.lagna ? snap.lagna.sign : snap.moonSign,
    lagnaDeg: snap.lagna ? dms(snap.lagna.deg) : "",
    rashi: snap.moonSign,
    nak: NAK[snap.nakshatra.index] ?? "",
    pada: snap.nakshatra.pada,
    planets,
    unknown: snap.input.tobUnknown,
    city,
  };
}

/**
 * Maps a ChartSnapshot to the Navamsa (D9) chart Kundali interface.
 * Moves the lagna and all planets into their navamsa (D9) signs and houses.
 */
export function toKundaliD9(snap: ChartSnapshot): Kundali {
  const moonPlanet = snap.planets.find((p) => p.k === "mo");
  const d9Lagna = snap.lagna
    ? Math.floor((((snap.lagna.lon % 360) + 360) % 360) / (10 / 3)) % 12
    : (moonPlanet?.d9 ?? 0);

  const planets: Planet[] = snap.planets.map((p) => {
    const g = GRAHA.find((item) => item.k === p.k);
    if (!g) {
      throw new Error(`Unknown graha key: ${p.k}`);
    }
    const d9Deg = (((p.lon % (10 / 3)) + 10 / 3) % (10 / 3)) * 9;
    const house = ((p.d9 - d9Lagna + 12) % 12) + 1;
    return {
      ...g,
      lon: p.lon,
      sign: p.d9,
      degS: dms(d9Deg),
      house,
      retro: p.retro,
      nak: NAK[p.nak] ?? "",
    };
  });

  const placeParts = snap.input.place.split(",");
  const town = placeParts[0]?.trim() || snap.input.place;
  const region = placeParts.slice(1).join(",").trim();
  const city: City = [town, region, snap.input.lat, snap.input.lon];

  const d9LagnaDeg = snap.lagna
    ? dms((((snap.lagna.lon % (10 / 3)) + 10 / 3) % (10 / 3)) * 9)
    : "";

  return {
    lagna: d9Lagna,
    lagnaDeg: d9LagnaDeg,
    rashi: moonPlanet?.d9 ?? snap.moonSign,
    nak: NAK[snap.nakshatra.index] ?? "",
    pada: snap.nakshatra.pada,
    planets,
    unknown: snap.input.tobUnknown,
    city,
  };
}
