"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { RASHI, type Rashi } from "@/lib/astro/rashi";
import { RASHIFAL_PERIODS, type RashifalPeriod, type RashiKey } from "@/lib/domain/enums";
import { RashiGlyph } from "@/components/signature/RashiGlyph";
import { Card } from "@/components/admin/ui/Card";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { toast } from "@/components/admin/ui/toast";
import { CoverageStrip } from "./CoverageStrip";
import {
  savePeriodEntriesAction,
  getPeriodEntriesAction,
  getCoverageAction,
} from "@/server/rashifal/admin-actions";
import type { RashifalAdminEntry, PeriodCoverage } from "@/server/rashifal/admin";
import { periodStart } from "@/server/rashifal/periods";
import { addDaysKey } from "@/lib/core/ist";
import { cn } from "@/lib/utils/cn";

export type RashifalEditorProps = {
  initialEntries: RashifalAdminEntry[];
  initialCoverage: PeriodCoverage[];
  todayKey: string;
};

type CardState = {
  rashi: RashiKey;
  textEn: string;
  textHi: string;
  hasScores: boolean;
  love: number;
  career: number;
  health: number;
  finance: number;
  hasLucky: boolean;
  luckyNumber: number;
  luckyColourEn: string;
  luckyColourHi: string;
  status: "draft" | "published";
};

function buildInitialCards(entries: RashifalAdminEntry[]): Record<RashiKey, CardState> {
  const map = new Map<RashiKey, RashifalAdminEntry>(
    entries.map((e) => [e.rashi, e]),
  );

  const out = {} as Record<RashiKey, CardState>;
  for (const r of RASHI) {
    const existing = map.get(r.key);
    out[r.key] = {
      rashi: r.key,
      textEn: existing?.textEn ?? "",
      textHi: existing?.textHi ?? "",
      hasScores: !!existing?.scores,
      love: existing?.scores?.love ?? 3,
      career: existing?.scores?.career ?? 3,
      health: existing?.scores?.health ?? 3,
      finance: existing?.scores?.finance ?? 3,
      hasLucky: !!existing?.lucky,
      luckyNumber: existing?.lucky?.number ?? r.num,
      luckyColourEn: existing?.lucky?.colour?.en ?? r.colour,
      luckyColourHi: existing?.lucky?.colour?.hi ?? "",
      status: existing?.status ?? "published",
    };
  }
  return out;
}

export function RashifalEditor({
  initialEntries,
  initialCoverage,
  todayKey,
}: RashifalEditorProps): React.JSX.Element {
  const [period, setPeriod] = useState<RashifalPeriod>("day");
  const [startsOn, setStartsOn] = useState<string>(todayKey);
  const [cards, setCards] = useState<Record<RashiKey, CardState>>(() =>
    buildInitialCards(initialEntries),
  );
  const [initialCardsState, setInitialCardsState] = useState<string>(() =>
    JSON.stringify(buildInitialCards(initialEntries)),
  );
  const [coverageData, setCoverageData] = useState<PeriodCoverage[]>(initialCoverage);
  const [activeTabLang, setActiveTabLang] = useState<Record<RashiKey, "en" | "hi">>(
    () => Object.fromEntries(RASHI.map((r) => [r.key, "en"])) as Record<RashiKey, "en" | "hi">,
  );
  const [isPending, startTransition] = useTransition();

  const isDirty = useMemo(() => {
    return JSON.stringify(cards) !== initialCardsState;
  }, [cards, initialCardsState]);

  // Unsaved guard for window unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Load entries when period or startsOn changes
  const switchPeriodAndDate = (newPeriod: RashifalPeriod, newDate: string) => {
    const canonicalStart = periodStart(newPeriod, newDate);

    if (isDirty) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes. Discard changes and switch date/period?",
      );
      if (!confirmDiscard) return;
    }

    setPeriod(newPeriod);
    setStartsOn(canonicalStart);

    startTransition(async () => {
      const res = await getPeriodEntriesAction(newPeriod, canonicalStart);
      if (res.ok && res.data) {
        const nextCards = buildInitialCards(res.data);
        setCards(nextCards);
        setInitialCardsState(JSON.stringify(nextCards));
      } else {
        toast.error("Failed to load entries for selected period");
      }
    });
  };

  const handlePeriodChange = (newPeriod: RashifalPeriod) => {
    switchPeriodAndDate(newPeriod, startsOn);
  };

  const handleDateChange = (rawDate: string) => {
    if (!rawDate) return;
    switchPeriodAndDate(period, rawDate);
  };

  const updateCard = (rashi: RashiKey, patch: Partial<CardState>) => {
    setCards((prev) => ({
      ...prev,
      [rashi]: {
        ...prev[rashi],
        ...patch,
      },
    }));
  };

  const handleSaveAll = () => {
    // Find all cards that have non-empty textEn
    const entriesToSave = Object.values(cards).filter((c) => c.textEn.trim().length > 0);

    if (entriesToSave.length === 0) {
      toast.error("Please enter English prediction text for at least one rashi before saving.");
      return;
    }

    // Validate lengths
    for (const item of entriesToSave) {
      const rashiMeta = RASHI.find((r) => r.key === item.rashi);
      const name = rashiMeta?.en ?? item.rashi;
      if (item.textEn.trim().length < 20) {
        toast.error(`${name}: English text must be at least 20 characters.`);
        return;
      }
      if (item.textEn.trim().length > 1500) {
        toast.error(`${name}: English text exceeds 1500 characters.`);
        return;
      }
      if (item.textHi.trim().length > 1500) {
        toast.error(`${name}: Hindi text exceeds 1500 characters.`);
        return;
      }
    }

    startTransition(async () => {
      const payload = {
        period,
        startsOn,
        entries: entriesToSave.map((c) => ({
          rashi: c.rashi,
          textEn: c.textEn.trim(),
          textHi: c.textHi.trim(),
          scores: c.hasScores
            ? {
                love: c.love,
                career: c.career,
                health: c.health,
                finance: c.finance,
              }
            : null,
          lucky: c.hasLucky
            ? {
                number: c.luckyNumber,
                colour: {
                  en: c.luckyColourEn.trim(),
                  hi: c.luckyColourHi.trim(),
                },
              }
            : null,
          status: c.status,
        })),
      };

      const res = await savePeriodEntriesAction(payload);
      if (res.ok) {
        toast.success(`Successfully saved ${payload.entries.length} rashi entries!`);
        setInitialCardsState(JSON.stringify(cards));

        // Refresh coverage
        const covRes = await getCoverageAction(todayKey, addDaysKey(todayKey, 60));
        if (covRes.ok && covRes.data) {
          setCoverageData(covRes.data);
        }
      } else {
        toast.error(res.message || "Failed to save rashifal entries");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Period selection & Date picker */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="period-select" className="text-xs font-semibold text-ink6 uppercase">
                Period
              </label>
              <select
                id="period-select"
                value={period}
                onChange={(e) => handlePeriodChange(e.target.value as RashifalPeriod)}
                className="h-10 rounded-field border border-s2 bg-iv px-3 text-sm font-semibold text-ink focus:border-g5 focus:outline-none"
              >
                {RASHIFAL_PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p === "day" ? "Daily (Day)" : p === "week" ? "Weekly (Week)" : p === "month" ? "Monthly (Month)" : "Yearly (Year)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="starts-on-input" className="text-xs font-semibold text-ink6 uppercase">
                Period Start Date (IST)
              </label>
              <input
                id="starts-on-input"
                type="date"
                value={startsOn}
                onChange={(e) => handleDateChange(e.target.value)}
                className="h-10 rounded-field border border-s2 bg-iv px-3 text-sm font-mono text-ink focus:border-g5 focus:outline-none"
              />
            </div>

            <div className="flex flex-col justify-end pt-5 text-xs text-ink6">
              <span>
                Canonical start: <strong className="font-mono text-ink">{startsOn}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-xs font-medium text-cu">
                Unsaved edits
              </span>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={handleSaveAll}
              className="inline-flex h-11 items-center justify-center rounded-btn bg-em9 px-6 text-sm font-bold text-iv shadow transition hover:bg-em7 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Saving..." : "Save All (12 Signs)"}
            </button>
          </div>
        </div>
      </Card>

      {/* Coverage Strip */}
      <Card className="p-4 sm:p-5">
        <CoverageStrip
          period={period}
          selectedStartsOn={startsOn}
          coverage={coverageData}
          onSelectStartsOn={(date) => switchPeriodAndDate(period, date)}
          todayKey={todayKey}
        />
      </Card>

      {/* 12 Rashi Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {RASHI.map((r) => {
          const card = cards[r.key];
          const lang = activeTabLang[r.key] ?? "en";
          const isFilled = card.textEn.trim().length > 0;

          return (
            <Card
              key={r.key}
              className={cn(
                "flex flex-col justify-between p-5 transition-shadow",
                isFilled ? "border-l-4 border-l-g5" : "border-l-4 border-l-s2",
              )}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-s2 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-pill bg-s1 shadow-[inset_0_0_0_1px_rgba(184,146,58,.45)]">
                      <span className="block size-6">
                        <RashiGlyph k={r.key} col="#B8923A" sw={1.3} />
                      </span>
                    </span>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-lg font-bold text-em9">
                          {r.en}
                        </span>
                        <span className="font-deva text-base text-g7">
                          {r.hi}
                        </span>
                      </div>
                      <span className="text-xs text-ink6">
                        {r.west} · {r.dates}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateCard(r.key, {
                          status: card.status === "published" ? "draft" : "published",
                        })
                      }
                      className="cursor-pointer"
                    >
                      <StatusBadge
                        status={card.status === "published" ? "published" : "draft"}
                      />
                    </button>
                  </div>
                </div>

                {/* Language Tabs & Textarea */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 rounded-btn bg-s1 p-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTabLang((prev) => ({ ...prev, [r.key]: "en" }))
                        }
                        className={cn(
                          "rounded-field px-3 py-1 text-xs font-semibold cursor-pointer",
                          lang === "en" ? "bg-em9 text-iv" : "text-ink hover:text-em9",
                        )}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTabLang((prev) => ({ ...prev, [r.key]: "hi" }))
                        }
                        className={cn(
                          "rounded-field px-3 py-1 text-xs font-semibold cursor-pointer",
                          lang === "hi" ? "bg-em9 text-iv" : "text-ink hover:text-em9",
                        )}
                      >
                        Hindi (हिंदी)
                      </button>
                    </div>

                    <span
                      className={cn(
                        "text-xs font-mono",
                        lang === "en"
                          ? card.textEn.length > 0 && card.textEn.length < 20
                            ? "text-rose font-bold"
                            : card.textEn.length > 1500
                              ? "text-rose font-bold"
                              : "text-ink6"
                          : card.textHi.length > 1500
                            ? "text-rose font-bold"
                            : "text-ink6",
                      )}
                    >
                      {lang === "en"
                        ? `${card.textEn.length}/1500 chars (min 20)`
                        : `${card.textHi.length}/1500 chars`}
                    </span>
                  </div>

                  {lang === "en" ? (
                    <textarea
                      rows={4}
                      value={card.textEn}
                      onChange={(e) => updateCard(r.key, { textEn: e.target.value })}
                      placeholder={`Enter English prediction for ${r.en}...`}
                      className="w-full rounded-field border border-s2 bg-iv p-3 text-sm text-ink placeholder:text-ink6 focus:border-g5 focus:outline-none"
                    />
                  ) : (
                    <textarea
                      rows={4}
                      value={card.textHi}
                      onChange={(e) => updateCard(r.key, { textHi: e.target.value })}
                      placeholder={`${r.hi} के लिए हिंदी भविष्यवाणी दर्ज करें...`}
                      className="w-full rounded-field border border-s2 bg-iv p-3 text-sm font-hi text-ink placeholder:text-ink6 focus:border-g5 focus:outline-none"
                    />
                  )}
                </div>

                {/* Optional Scores & Lucky details */}
                <div className="space-y-3 rounded-btn border border-s2 bg-cream/40 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 font-semibold text-ink cursor-pointer">
                      <input
                        type="checkbox"
                        checked={card.hasScores}
                        onChange={(e) =>
                          updateCard(r.key, { hasScores: e.target.checked })
                        }
                        className="rounded border-s2 text-em9 focus:ring-g5"
                      />
                      <span>Area Scores (1–5)</span>
                    </label>

                    <label className="flex items-center gap-2 font-semibold text-ink cursor-pointer">
                      <input
                        type="checkbox"
                        checked={card.hasLucky}
                        onChange={(e) =>
                          updateCard(r.key, { hasLucky: e.target.checked })
                        }
                        className="rounded border-s2 text-em9 focus:ring-g5"
                      />
                      <span>Lucky Number &amp; Colour</span>
                    </label>
                  </div>

                  {card.hasScores && (
                    <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                      <div>
                        <label className="text-ink6 uppercase">Love</label>
                        <select
                          value={card.love}
                          onChange={(e) =>
                            updateCard(r.key, { love: Number(e.target.value) })
                          }
                          className="mt-1 w-full rounded border border-s2 bg-iv p-1 text-sm font-semibold"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-ink6 uppercase">Career</label>
                        <select
                          value={card.career}
                          onChange={(e) =>
                            updateCard(r.key, { career: Number(e.target.value) })
                          }
                          className="mt-1 w-full rounded border border-s2 bg-iv p-1 text-sm font-semibold"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-ink6 uppercase">Health</label>
                        <select
                          value={card.health}
                          onChange={(e) =>
                            updateCard(r.key, { health: Number(e.target.value) })
                          }
                          className="mt-1 w-full rounded border border-s2 bg-iv p-1 text-sm font-semibold"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-ink6 uppercase">Finance</label>
                        <select
                          value={card.finance}
                          onChange={(e) =>
                            updateCard(r.key, { finance: Number(e.target.value) })
                          }
                          className="mt-1 w-full rounded border border-s2 bg-iv p-1 text-sm font-semibold"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {card.hasLucky && (
                    <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
                      <div>
                        <label className="text-ink6 uppercase">Lucky Number (1–99)</label>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={card.luckyNumber}
                          onChange={(e) =>
                            updateCard(r.key, {
                              luckyNumber: Math.max(1, Math.min(99, Number(e.target.value) || 1)),
                            })
                          }
                          className="mt-1 w-full rounded border border-s2 bg-iv p-1.5 text-sm font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-ink6 uppercase">Colour (EN)</label>
                        <input
                          type="text"
                          value={card.luckyColourEn}
                          onChange={(e) =>
                            updateCard(r.key, { luckyColourEn: e.target.value })
                          }
                          placeholder="e.g. Crimson"
                          className="mt-1 w-full rounded border border-s2 bg-iv p-1.5 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-ink6 uppercase">Colour (HI)</label>
                        <input
                          type="text"
                          value={card.luckyColourHi}
                          onChange={(e) =>
                            updateCard(r.key, { luckyColourHi: e.target.value })
                          }
                          placeholder="जैसे: लाल"
                          className="mt-1 w-full rounded border border-s2 bg-iv p-1.5 text-sm font-hi"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Sticky Bottom Bar for Mobile & Desktop convenience */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-btn border border-s2 bg-em9/95 px-6 py-3.5 text-iv shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">
            {period.toUpperCase()}: <span className="font-mono text-g3">{startsOn}</span>
          </span>
          <span className="text-xs text-em1/70">
            ({Object.values(cards).filter((c) => c.textEn.trim().length > 0).length}/12 written)
          </span>
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={handleSaveAll}
          className="inline-flex h-10 items-center justify-center rounded-btn bg-g3 px-5 text-sm font-bold text-n9 transition hover:bg-g4 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? "Saving..." : "Save All"}
        </button>
      </div>
    </div>
  );
}
