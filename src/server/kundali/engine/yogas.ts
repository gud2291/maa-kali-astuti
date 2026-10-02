import "server-only";
import type { GrahaKey } from "@/lib/domain/kundali";

export const YOGA_KEYS = [
  "gajakesari",
  "budhaditya",
  "chandraMangal",
  "ruchaka",
  "bhadra",
  "hamsa",
  "malavya",
  "shasha",
  "kemadruma",
] as const;

export type YogaKey = (typeof YOGA_KEYS)[number];

export type YogasInput = {
  planetSigns: Record<GrahaKey, number>; // 0–11
  lagnaSign: number | null; // null when birth time is unknown
};

/**
 * Computes active Vedic Yogas from planetary signs and Lagna.
 * Lagna-based yogas (Panch Mahapurusha: ruchaka, bhadra, hamsa, malavya, shasha)
 * are skipped when birth time is unknown.
 */
export function computeYogas(input: YogasInput): YogaKey[] {
  const { planetSigns, lagnaSign } = input;
  const active: YogaKey[] = [];

  // 1. Gajakesari = Jupiter in a kendra (1, 4, 7, 10) from the Moon
  const juHouseFromMoon =
    ((planetSigns.ju - planetSigns.mo + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(juHouseFromMoon)) {
    active.push("gajakesari");
  }

  // 2. Budhaditya = Sun + Mercury in the same sign
  if (planetSigns.su === planetSigns.me) {
    active.push("budhaditya");
  }

  // 3. Chandra-Mangal = Moon + Mars in the same sign
  if (planetSigns.mo === planetSigns.ma) {
    active.push("chandraMangal");
  }

  // 4. Panch Mahapurusha: planet in own or exaltation sign AND in kendra from Lagna
  if (lagnaSign !== null) {
    const isMahapurusha = (pSign: number, ownOrExalt: number[]): boolean => {
      const houseFromLagna = ((pSign - lagnaSign + 12) % 12) + 1;
      return [1, 4, 7, 10].includes(houseFromLagna) && ownOrExalt.includes(pSign);
    };

    // Ruchaka (Mars: own 0/7, exalt 9)
    if (isMahapurusha(planetSigns.ma, [0, 7, 9])) {
      active.push("ruchaka");
    }
    // Bhadra (Mercury: own 2/5, exalt 5)
    if (isMahapurusha(planetSigns.me, [2, 5])) {
      active.push("bhadra");
    }
    // Hamsa (Jupiter: own 8/11, exalt 3)
    if (isMahapurusha(planetSigns.ju, [8, 11, 3])) {
      active.push("hamsa");
    }
    // Malavya (Venus: own 1/6, exalt 11)
    if (isMahapurusha(planetSigns.ve, [1, 6, 11])) {
      active.push("malavya");
    }
    // Shasha (Saturn: own 9/10, exalt 6)
    if (isMahapurusha(planetSigns.sa, [9, 10, 6])) {
      active.push("shasha");
    }
  }

  // 5. Kemadruma = no planet other than Sun/Rahu/Ketu in the 2nd or 12th from the Moon
  const secondFromMoon = (planetSigns.mo + 1) % 12;
  const twelfthFromMoon = (planetSigns.mo + 11) % 12;
  const planetsToCheck: GrahaKey[] = ["ma", "me", "ju", "ve", "sa"];

  const hasPlanetIn2or12 = planetsToCheck.some((k) => {
    const s = planetSigns[k];
    return s === secondFromMoon || s === twelfthFromMoon;
  });

  if (!hasPlanetIn2or12) {
    active.push("kemadruma");
  }

  return active;
}
