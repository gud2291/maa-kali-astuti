import "server-only";

import type { ChartPlanet, ChartSnapshot, GrahaKey } from "@/lib/domain/kundali";
import type { LifeAreaKey, ReportContent } from "../content/types";
import { getReportContent } from "../content";
import { formatIst } from "@/lib/core/ist";

export type BuildReportModelInput = {
  chart: ChartSnapshot;
  lang: "en" | "hi";
  name?: string;
  place?: string;
  generatedAt?: Date | number;
};

export type ReportPlanetRow = {
  key: GrahaKey;
  name: string;
  signIndex: number;
  signName: string;
  degreesFormatted: string; // e.g. "12°34′"
  house: number;
  nakshatraName: string;
  pada: number;
  retroState: string; // "R" or ""
  isRetro: boolean;
  d9SignIndex: number;
  d9SignName: string;
};

export type ReportPlanetInHouse = {
  key: GrahaKey;
  name: string;
  house: number;
  body: string;
};

export type ReportLifeArea = {
  key: LifeAreaKey;
  title: string;
  house: number;
  signIndex: number;
  signName: string;
  body: string;
};

export type ReportDashaRow = {
  lord: GrahaKey;
  lordName: string;
  start: string;
  end: string;
  subs: Array<{
    lord: GrahaKey;
    lordName: string;
    start: string;
    end: string;
  }>;
};

export type ReportModel = {
  name: string;
  place: string;
  dob: string;
  tob: string | null;
  tobUnknown: boolean;
  formattedDob: string;
  formattedTob: string;
  lang: "en" | "hi";
  generatedAtFormatted: string;
  content: ReportContent;
  chart: ChartSnapshot;

  panchang: {
    tithi: { index: number; name: string; paksha: "shukla" | "krishna" };
    nakshatra: { index: number; name: string; pada: number; lord: GrahaKey; lordName: string };
    yoga: { index: number; name: string };
    karana: { index: number; name: string };
    vara: { index: number; name: string };
    ayanamsaFormatted: string;
    sunSign: { index: number; name: string };
    moonSign: { index: number; name: string };
    lagnaSign: { index: number; name: string } | null;
  };

  lagnaAnalysis: {
    isUnknownTime: boolean;
    signIndex: number;
    signName: string;
    title: string;
    body: string;
    unknownTimeNote: string | null;
  };

  moonSignAnalysis: {
    signIndex: number;
    signName: string;
    body: string;
  };

  nakshatraAnalysis: {
    index: number;
    name: string;
    pada: number;
    body: string;
  };

  planetTable: ReportPlanetRow[];
  planetInHouse: ReportPlanetInHouse[];
  lifeAreas: ReportLifeArea[];

  dashaTimeline: {
    currentMahadasha: {
      lord: GrahaKey;
      lordName: string;
      start: string;
      end: string;
      body: string;
    };
    currentAntardasha: {
      lord: GrahaKey;
      lordName: string;
      start: string;
      end: string;
    };
    nextThreeAntardashas: Array<{
      lord: GrahaKey;
      lordName: string;
      start: string;
      end: string;
    }>;
    nextMahadasha: {
      lord: GrahaKey;
      lordName: string;
      start: string;
      end: string;
      body: string;
    } | null;
    allMahadashas: ReportDashaRow[];
  };

  doshas: {
    manglik: {
      present: boolean;
      fromLagna: boolean;
      fromMoon: boolean;
      body: string;
    };
    kaalSarp: {
      present: boolean;
      type: number | null;
      body: string;
    };
    sadeSati: {
      active: boolean;
      phase: "rising" | "peak" | "setting" | null;
      body: string;
      periods: Array<{ start: string; end: string }>;
    };
  };

  yogas: Array<{
    key: string;
    title: string;
    body: string;
  }>;

  gems: {
    signIndex: number;
    signName: string;
    gem: string;
    rudraksha: string;
    mantra: string;
    note: string;
  };

  remedies: Array<{
    key: GrahaKey;
    name: string;
    reason: string;
    body: string;
  }>;
};

function formatDeg(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′`;
}

const DEBILITATION: Partial<Record<GrahaKey, number>> = {
  su: 6,
  mo: 7,
  ma: 3,
  me: 11,
  ju: 9,
  ve: 5,
  sa: 0,
};

export function buildReportModel(input: BuildReportModelInput): ReportModel {
  const { chart, lang } = input;
  const content = getReportContent(lang);

  const name = (input.name || chart.input.name || (lang === "hi" ? "जातक" : "Native")).trim();
  const place = (input.place || chart.input.place || "").trim();
  const nowMs =
    typeof input.generatedAt === "number"
      ? input.generatedAt
      : input.generatedAt instanceof Date
        ? input.generatedAt.getTime()
        : Date.now();

  const generatedAtFormatted = formatIst(nowMs, { date: true, locale: lang });

  // Birth details formatting
  const [bYear, bMonth, bDay] = chart.input.dob.split("-").map(Number);
  const birthDateObj = new Date(Date.UTC(bYear, bMonth - 1, bDay, 12, 0, 0));
  const formattedDob = formatIst(birthDateObj, { date: true, locale: lang });
  const formattedTob = chart.input.tobUnknown || !chart.input.tob
    ? (lang === "hi" ? "अज्ञात (दोपहर 12:00 आधारित)" : "Unknown (12:00 PM estimated)")
    : chart.input.tob;

  // Reference sign (Lagna sign or Moon sign when unknown)
  const isUnknownTime = chart.input.tobUnknown || chart.lagna === null;
  const refSign = chart.lagna ? chart.lagna.sign : chart.moonSign;

  // Lagna Analysis
  const lagnaSignIndex = refSign;
  const lagnaSignName = content.labels.signs[lagnaSignIndex] ?? "";
  const lagnaContent = content.lagna[lagnaSignIndex] ?? { title: lagnaSignName, body: "" };
  const unknownTimeNote = isUnknownTime
    ? (lang === "hi"
        ? "जन्म समय अज्ञात होने के कारण विश्लेषण चंद्र लग्न (चंद्रमा की राशि) को आधार मानकर तैयार किया गया है।"
        : "Birth time was marked unknown; analysis is calculated using Chandra Lagna (Moon sign) as the foundational reference.")
    : null;

  // Moon & Nakshatra
  const moonSignIndex = chart.moonSign;
  const moonSignName = content.labels.signs[moonSignIndex] ?? "";
  const moonSignBody = content.moonSign[moonSignIndex] ?? "";

  const nakshatraIndex = chart.nakshatra.index;
  const nakshatraName = content.labels.nakshatras[nakshatraIndex] ?? "";
  const nakshatraBody = content.nakshatra[nakshatraIndex] ?? "";

  // Planet table rows
  const planetTable: ReportPlanetRow[] = chart.planets.map((p) => {
    const isRetro = p.retro && p.k !== "ra" && p.k !== "ke";
    return {
      key: p.k,
      name: content.labels.planets[p.k] ?? p.k,
      signIndex: p.sign,
      signName: content.labels.signs[p.sign] ?? "",
      degreesFormatted: formatDeg(p.deg),
      house: p.house,
      nakshatraName: content.labels.nakshatras[p.nak] ?? "",
      pada: p.pada,
      retroState: isRetro ? "R" : "",
      isRetro,
      d9SignIndex: p.d9,
      d9SignName: content.labels.signs[p.d9] ?? "",
    };
  });

  // 9 Planet-in-house blocks
  const planetInHouse: ReportPlanetInHouse[] = chart.planets.map((p) => ({
    key: p.k,
    name: content.labels.planets[p.k] ?? p.k,
    house: p.house,
    body: content.planetInHouse[p.k]?.[p.house] ?? "",
  }));

  // 6 Life areas: career (10th), marriage (7th), health (6th), money (2nd), family (4th), education (5th)
  const LIFE_AREA_CONFIG: Array<{ key: LifeAreaKey; titleKey: string; houseOffset: number; houseNum: number }> = [
    { key: "career", titleKey: "career", houseOffset: 9, houseNum: 10 },
    { key: "marriage", titleKey: "marriage", houseOffset: 6, houseNum: 7 },
    { key: "health", titleKey: "health", houseOffset: 5, houseNum: 6 },
    { key: "money", titleKey: "money", houseOffset: 1, houseNum: 2 },
    { key: "family", titleKey: "family", houseOffset: 3, houseNum: 4 },
    { key: "education", titleKey: "education", houseOffset: 4, houseNum: 5 },
  ];

  const lifeAreas: ReportLifeArea[] = LIFE_AREA_CONFIG.map(({ key, titleKey, houseOffset, houseNum }) => {
    const signIndex = (refSign + houseOffset) % 12;
    return {
      key,
      title: content.labels.sections[titleKey] ?? key,
      house: houseNum,
      signIndex,
      signName: content.labels.signs[signIndex] ?? "",
      body: content.lifeArea[key]?.[signIndex] ?? "",
    };
  });

  // Vimshottari timeline
  const allMahadashas: ReportDashaRow[] = chart.dashas.map((d) => ({
    lord: d.lord,
    lordName: content.labels.planets[d.lord] ?? d.lord,
    start: formatIst(d.start, { date: true, locale: lang }),
    end: formatIst(d.end, { date: true, locale: lang }),
    subs: d.sub.map((s) => ({
      lord: s.lord,
      lordName: content.labels.planets[s.lord] ?? s.lord,
      start: formatIst(s.start, { date: true, locale: lang }),
      end: formatIst(s.end, { date: true, locale: lang }),
    })),
  }));

  let currentMaha = chart.dashas.find((d) => nowMs >= d.start && nowMs < d.end);
  if (!currentMaha && chart.dashas.length > 0) {
    currentMaha = nowMs < chart.dashas[0].start ? chart.dashas[0] : chart.dashas[chart.dashas.length - 1];
  }
  const currentMahaLord = currentMaha ? currentMaha.lord : chart.nakshatra.lord;
  const currentMahaStart = currentMaha ? formatIst(currentMaha.start, { date: true, locale: lang }) : "";
  const currentMahaEnd = currentMaha ? formatIst(currentMaha.end, { date: true, locale: lang }) : "";

  let currentSub = currentMaha?.sub.find((s) => nowMs >= s.start && nowMs < s.end);
  if (!currentSub && currentMaha && currentMaha.sub.length > 0) {
    currentSub = nowMs < currentMaha.sub[0].start ? currentMaha.sub[0] : currentMaha.sub[currentMaha.sub.length - 1];
  }
  const currentSubLord = currentSub ? currentSub.lord : currentMahaLord;
  const currentSubStart = currentSub ? formatIst(currentSub.start, { date: true, locale: lang }) : "";
  const currentSubEnd = currentSub ? formatIst(currentSub.end, { date: true, locale: lang }) : "";

  const allSubs: Array<{ lord: GrahaKey; start: number; end: number }> = [];
  for (const d of chart.dashas) {
    for (const s of d.sub) {
      allSubs.push(s);
    }
  }

  const currentSubIdx = allSubs.findIndex(
    (s) => s.start === currentSub?.start && s.lord === currentSub?.lord,
  );
  const nextThreeSubRaw =
    currentSubIdx >= 0 ? allSubs.slice(currentSubIdx + 1, currentSubIdx + 4) : [];
  const nextThreeAntardashas = nextThreeSubRaw.map((s) => ({
    lord: s.lord,
    lordName: content.labels.planets[s.lord] ?? s.lord,
    start: formatIst(s.start, { date: true, locale: lang }),
    end: formatIst(s.end, { date: true, locale: lang }),
  }));

  const currentMahaIdx = chart.dashas.findIndex(
    (d) => d.start === currentMaha?.start && d.lord === currentMaha?.lord,
  );
  const nextMahaRaw =
    currentMahaIdx >= 0 && currentMahaIdx + 1 < chart.dashas.length
      ? chart.dashas[currentMahaIdx + 1]
      : null;

  const nextMahadasha = nextMahaRaw
    ? {
        lord: nextMahaRaw.lord,
        lordName: content.labels.planets[nextMahaRaw.lord] ?? nextMahaRaw.lord,
        start: formatIst(nextMahaRaw.start, { date: true, locale: lang }),
        end: formatIst(nextMahaRaw.end, { date: true, locale: lang }),
        body: content.mahadasha[nextMahaRaw.lord] ?? "",
      }
    : null;

  // Doshas
  const manglikPresent = chart.doshas.manglik.fromLagna || chart.doshas.manglik.fromMoon;
  const manglikBody = manglikPresent ? content.manglik.present : content.manglik.absent;

  const kaalSarpPresent = chart.doshas.kaalSarp.present;
  const kaalSarpBody = kaalSarpPresent ? content.kaalSarp.present : content.kaalSarp.absent;

  const sadeSatiPhase = chart.doshas.sadeSati.phase;
  let sadeSatiBody = content.sadeSati.none;
  if (chart.doshas.sadeSati.active && sadeSatiPhase) {
    sadeSatiBody = content.sadeSati[sadeSatiPhase] ?? content.sadeSati.none;
  }
  const sadeSatiPeriods = chart.doshas.sadeSati.periods.map((p) => ({
    start: formatIst(p.start, { date: true, locale: lang }),
    end: formatIst(p.end, { date: true, locale: lang }),
  }));

  // Yogas
  const yogas = chart.yogas.map((yKey) => {
    const yInfo = content.yogas[yKey as keyof typeof content.yogas];
    return {
      key: yKey,
      title: yInfo?.title ?? yKey,
      body: yInfo?.body ?? "",
    };
  });

  // Gemstones & Rudraksha (by Lagna sign, or Moon sign when unknown)
  const gemInfo = content.gems[refSign] ?? {
    gem: "Spiritual consultation",
    rudraksha: "5 Mukhi Rudraksha",
    mantra: "Om Namah Shivaya",
    note: "General balancing remedies recommended.",
  };

  // Remedies: planets in 6/8/12 or debilitated, or 3 most relevant when none
  const qualifyingPlanets: Array<{ planet: ChartPlanet; reason: string }> = [];
  for (const p of chart.planets) {
    const isDebilitated = DEBILITATION[p.k] === p.sign;
    const isDusthana = [6, 8, 12].includes(p.house);
    if (isDebilitated || isDusthana) {
      const reasons: string[] = [];
      if (isDebilitated) {
        reasons.push(lang === "hi" ? "नीच राशि" : "Debilitated");
      }
      if (isDusthana) {
        reasons.push(
          lang === "hi"
            ? `${p.house}वें भाव में स्थित`
            : `In House ${p.house}`,
        );
      }
      qualifyingPlanets.push({
        planet: p,
        reason: reasons.join(", "),
      });
    }
  }

  let remedies: Array<{ key: GrahaKey; name: string; reason: string; body: string }> = [];
  if (qualifyingPlanets.length > 0) {
    remedies = qualifyingPlanets.map(({ planet, reason }) => ({
      key: planet.k,
      name: content.labels.planets[planet.k] ?? planet.k,
      reason,
      body: content.remedies[planet.k] ?? "",
    }));
  } else {
    const fallbackKeys: GrahaKey[] = ["sa", "ra", "ke"];
    remedies = fallbackKeys.map((k) => ({
      key: k,
      name: content.labels.planets[k] ?? k,
      reason: lang === "hi" ? "कल्याणकारी शांति व सुरक्षा" : "Harmonizing & Protection",
      body: content.remedies[k] ?? "",
    }));
  }

  return {
    name,
    place,
    dob: chart.input.dob,
    tob: chart.input.tob,
    tobUnknown: chart.input.tobUnknown,
    formattedDob,
    formattedTob,
    lang,
    generatedAtFormatted,
    content,
    chart,

    panchang: {
      tithi: {
        index: chart.panchang.tithi,
        name: content.labels.tithis[chart.panchang.tithi] ?? `Tithi ${chart.panchang.tithi + 1}`,
        paksha: chart.panchang.paksha,
      },
      nakshatra: {
        index: chart.nakshatra.index,
        name: nakshatraName,
        pada: chart.nakshatra.pada,
        lord: chart.nakshatra.lord,
        lordName: content.labels.planets[chart.nakshatra.lord] ?? chart.nakshatra.lord,
      },
      yoga: {
        index: chart.panchang.yoga,
        name: content.labels.yogaNames[chart.panchang.yoga] ?? `Yoga ${chart.panchang.yoga + 1}`,
      },
      karana: {
        index: chart.panchang.karana,
        name: content.labels.karanas[chart.panchang.karana] ?? `Karana ${chart.panchang.karana + 1}`,
      },
      vara: {
        index: chart.panchang.vara,
        name: content.labels.weekdays[chart.panchang.vara] ?? `Day ${chart.panchang.vara}`,
      },
      ayanamsaFormatted: formatDeg(chart.ayanamsa),
      sunSign: {
        index: chart.sunSign,
        name: content.labels.signs[chart.sunSign] ?? "",
      },
      moonSign: {
        index: chart.moonSign,
        name: moonSignName,
      },
      lagnaSign: chart.lagna
        ? {
            index: chart.lagna.sign,
            name: content.labels.signs[chart.lagna.sign] ?? "",
          }
        : null,
    },

    lagnaAnalysis: {
      isUnknownTime,
      signIndex: lagnaSignIndex,
      signName: lagnaSignName,
      title: lagnaContent.title,
      body: lagnaContent.body,
      unknownTimeNote,
    },

    moonSignAnalysis: {
      signIndex: moonSignIndex,
      signName: moonSignName,
      body: moonSignBody,
    },

    nakshatraAnalysis: {
      index: nakshatraIndex,
      name: nakshatraName,
      pada: chart.nakshatra.pada,
      body: nakshatraBody,
    },

    planetTable,
    planetInHouse,
    lifeAreas,

    dashaTimeline: {
      currentMahadasha: {
        lord: currentMahaLord,
        lordName: content.labels.planets[currentMahaLord] ?? currentMahaLord,
        start: currentMahaStart,
        end: currentMahaEnd,
        body: content.mahadasha[currentMahaLord] ?? "",
      },
      currentAntardasha: {
        lord: currentSubLord,
        lordName: content.labels.planets[currentSubLord] ?? currentSubLord,
        start: currentSubStart,
        end: currentSubEnd,
      },
      nextThreeAntardashas,
      nextMahadasha,
      allMahadashas,
    },

    doshas: {
      manglik: {
        present: manglikPresent,
        fromLagna: chart.doshas.manglik.fromLagna,
        fromMoon: chart.doshas.manglik.fromMoon,
        body: manglikBody,
      },
      kaalSarp: {
        present: kaalSarpPresent,
        type: chart.doshas.kaalSarp.type,
        body: kaalSarpBody,
      },
      sadeSati: {
        active: chart.doshas.sadeSati.active,
        phase: sadeSatiPhase,
        body: sadeSatiBody,
        periods: sadeSatiPeriods,
      },
    },

    yogas,

    gems: {
      signIndex: refSign,
      signName: content.labels.signs[refSign] ?? "",
      gem: gemInfo.gem,
      rudraksha: gemInfo.rudraksha,
      mantra: gemInfo.mantra,
      note: gemInfo.note,
    },

    remedies,
  };
}
