import "server-only";
import type { GrahaKey } from "@/lib/domain/kundali";
import type { YogaKey } from "../engine/yogas";

export type LifeAreaKey =
  | "career"
  | "marriage"
  | "health"
  | "money"
  | "family"
  | "education";

export type ReportLabels = {
  signs: string[]; // 12 signs Mesha...Meena
  planets: Record<GrahaKey, string>;
  nakshatras: string[]; // 27 nakshatras Ashwini...Revati
  tithis: string[]; // 30 tithis
  yogaNames: string[]; // 27 panchang yogas
  karanas: string[]; // 11 karanas (Bava, Balava...)
  weekdays: string[]; // 7 weekdays (Ravivara...Shanivara)
  sections: Record<string, string>;
  tableHeaders: Record<string, string>;
};

export type ReportContent = {
  labels: ReportLabels;
  lagna: Record<number, { title: string; body: string }>; // 0..11
  moonSign: Record<number, string>; // 0..11
  nakshatra: Record<number, string>; // 0..26
  planetInHouse: Record<GrahaKey, Record<number, string>>; // house 1..12
  lifeArea: Record<LifeAreaKey, Record<number, string>>; // sign 0..11
  mahadasha: Record<GrahaKey, string>;
  manglik: {
    present: string;
    absent: string;
  };
  kaalSarp: {
    present: string;
    absent: string;
  };
  sadeSati: {
    rising: string;
    peak: string;
    setting: string;
    none: string;
  };
  yogas: Record<YogaKey, { title: string; body: string }>;
  remedies: Record<GrahaKey, string>;
  gems: Record<
    number,
    {
      gem: string;
      rudraksha: string;
      mantra: string;
      note: string;
    }
  >; // 0..11
};

export type DeepPartial<T> = T extends Function
  ? T
  : T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends object
      ? { [P in keyof T]?: DeepPartial<T[P]> }
      : T;

export type PartialReportContent = DeepPartial<ReportContent>;
