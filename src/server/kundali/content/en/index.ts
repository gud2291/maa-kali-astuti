/* [client-review] Draft text for Sadhak Ji's review. */
import "server-only";
import type { ReportContent } from "../types";
import { LABELS_EN } from "./labels";
import { LAGNA_EN } from "./lagna";
import { MOON_SIGN_EN } from "./moon-sign";
import { NAKSHATRA_EN } from "./nakshatra";
import { PLANET_IN_HOUSE_EN } from "./planet-in-house";
import { LIFE_AREA_EN } from "./life-area";
import { MAHADASHA_EN } from "./dasha";
import { DOSHAS_EN } from "./doshas";
import { YOGAS_EN } from "./yogas";
import { REMEDIES_EN, GEMS_EN } from "./remedies";

export const REPORT_EN: ReportContent = {
  labels: LABELS_EN,
  lagna: LAGNA_EN,
  moonSign: MOON_SIGN_EN,
  nakshatra: NAKSHATRA_EN,
  planetInHouse: PLANET_IN_HOUSE_EN,
  lifeArea: LIFE_AREA_EN,
  mahadasha: MAHADASHA_EN,
  manglik: DOSHAS_EN.manglik,
  kaalSarp: DOSHAS_EN.kaalSarp,
  sadeSati: DOSHAS_EN.sadeSati,
  yogas: YOGAS_EN,
  remedies: REMEDIES_EN,
  gems: GEMS_EN,
};

export {
  LABELS_EN,
  LAGNA_EN,
  MOON_SIGN_EN,
  NAKSHATRA_EN,
  PLANET_IN_HOUSE_EN,
  LIFE_AREA_EN,
  MAHADASHA_EN,
  DOSHAS_EN,
  YOGAS_EN,
  REMEDIES_EN,
  GEMS_EN,
};
