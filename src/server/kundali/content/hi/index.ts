/* [client-review] Hindi draft for Sadhak Ji's review. */
import "server-only";
import type { ReportContent } from "../types";
import { LABELS_HI } from "./labels";
import { LAGNA_HI } from "./lagna";
import { MOON_SIGN_HI } from "./moon-sign";
import { NAKSHATRA_HI } from "./nakshatra";
import { PLANET_IN_HOUSE_HI } from "./planet-in-house";
import { LIFE_AREA_HI } from "./life-area";
import { MAHADASHA_HI } from "./dasha";
import { DOSHAS_HI } from "./doshas";
import { YOGAS_HI } from "./yogas";
import { REMEDIES_HI, GEMS_HI } from "./remedies";

export const REPORT_HI: ReportContent = {
  labels: LABELS_HI,
  lagna: LAGNA_HI,
  moonSign: MOON_SIGN_HI,
  nakshatra: NAKSHATRA_HI,
  planetInHouse: PLANET_IN_HOUSE_HI,
  lifeArea: LIFE_AREA_HI,
  mahadasha: MAHADASHA_HI,
  manglik: DOSHAS_HI.manglik,
  kaalSarp: DOSHAS_HI.kaalSarp,
  sadeSati: DOSHAS_HI.sadeSati,
  yogas: YOGAS_HI,
  remedies: REMEDIES_HI,
  gems: GEMS_HI,
};

export {
  LABELS_HI,
  LAGNA_HI,
  MOON_SIGN_HI,
  NAKSHATRA_HI,
  PLANET_IN_HOUSE_HI,
  LIFE_AREA_HI,
  MAHADASHA_HI,
  DOSHAS_HI,
  YOGAS_HI,
  REMEDIES_HI,
  GEMS_HI,
};
