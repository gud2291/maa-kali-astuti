"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { enter } from "@/components/motion/fx";
import { RashiGlyph } from "@/components/signature/RashiGlyph";
import { EYEBROW } from "@/components/sections/consult/ui";
import { PlaceInput, type SelectedPlace } from "@/components/forms/PlaceInput";
import { computeChartAction } from "@/server/kundali/actions";
import { toKundali } from "@/lib/astro/from-snapshot";
import { RASHI, sunRashi, type Rashi } from "@/lib/astro/rashi";
import { rashiHref } from "@/lib/routes";
import { useUi } from "@/stores/ui";
import { cn } from "@/lib/utils/cn";
import { useRashifal } from "./period";
import { brass, H2 } from "./ui";

/* §3 "Find your rashi" (Rashifal.dc.html 139–197, findRashi 248–256). Sand. Date of birth alone
   gives the Surya (sun) rashi; with "Add birth time and place" filled in, the sidereal Kundali
   engine gives the Chandra (Moon) rashi and nakshatra. Right column: the 4 × 3 glyph grid until a
   result, then the night result card (fades up 14px, 450 ms) with "Remember my rashi", which
   stores it on this device and marks it "Yours" in the grid above. */

type Found = { r: Rashi; moon: boolean; nak?: string };

const LABEL = "font-sans text-[13px] leading-[1.2] font-semibold text-ink";
const FIELD =
  "h-[52px] w-full rounded-field border-none bg-cream px-3.5 font-sans text-[16px] leading-[1.2] font-medium text-ink outline-none focus:shadow-[inset_0_0_0_1.5px_#164E3F]";

/** Local yyyy-mm-dd (the design's `max` and future check). */
const isoToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function RashiFinder() {
  const t = useTranslations("rashifal.find");
  const { per, mine, setMine } = useRashifal();
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [place, setPlace] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [more, setMore] = useState(false);
  const [tried, setTried] = useState(false);
  const [found, setFound] = useState<Found | null>(null);
  const [today, setToday] = useState("");
  const foundRef = useRef<HTMLDivElement>(null);

  // The date picker's max is the viewer's today (client only; the page is static).
  useEffect(() => {
    setToday(isoToday());
  }, []);

  // Result card entrance (fx.enter y14, 450 ms) on every new result.
  useEffect(() => {
    if (found) enter(foundRef.current, { y: 14, dur: 450 });
  }, [found]);

  const find = async (e: FormEvent) => {
    e.preventDefault();
    if (!dob || dob > isoToday()) {
      setTried(true);
      setFound(null);
      return;
    }
    const [, m, d] = dob.split("-").map(Number);
    if (more && tob && (selectedPlace || place.trim())) {
      let p = selectedPlace;
      if (!p && place.trim()) {
        try {
          const res = await fetch(`/api/places?q=${encodeURIComponent(place.split(",")[0].trim())}`);
          if (res.ok) {
            const list = (await res.json()) as SelectedPlace[];
            if (list.length > 0) p = list[0];
          }
        } catch {}
      }
      if (p) {
        const result = await computeChartAction({
          name: "User",
          dob,
          tob,
          tobUnknown: false,
          place: {
            name: p.region ? `${p.name}, ${p.region}` : p.name,
            lat: p.lat,
            lon: p.lon,
            tz: p.tz,
          },
        });
        if (result.ok) {
          const K = toKundali(result.data);
          setFound({ r: RASHI[K.rashi], moon: true, nak: K.nak });
          setTried(false);
          return;
        }
      }
    }
    setFound({ r: sunRashi(m, d), moon: false });
    setTried(false);
  };

  const save = () => {
    if (!found) return;
    setMine(found.r.key);
    useUi.getState().toast({ msg: t("saved", { name: found.r.en }), tone: "ok" });
  };

  return (
    <section data-screen-label="Find your rashi" className="bg-s1 shadow-[inset_0_1px_0_rgba(184,146,58,.35)]">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(28px,5vw,80px)] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)] lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]">
        <div className="flex min-w-0 flex-col gap-[18px]">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
            <h2 lang="en" className={cn(H2, "text-[clamp(30px,3.6vw,46px)]")}>
              {t.rich("title", { em: brass })}
            </h2>
            <span lang="hi" className="font-deva text-[18px] leading-[1.35] text-g7">
              अपनी राशि जानिए
            </span>
          </div>

          <form onSubmit={find} noValidate className="flex max-w-[520px] flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="rf-dob" className={LABEL}>
                {t("dob")}
              </label>
              <input
                id="rf-dob"
                type="date"
                min="1900-01-01"
                max={today || undefined}
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  setTried(false);
                }}
                aria-invalid={tried}
                aria-describedby={tried ? "rf-dob-err" : undefined}
                className={cn(FIELD, "shadow-[inset_0_0_0_1px_#EAE0CA]")}
                style={tried ? { boxShadow: "inset 0 0 0 1px #A8322D" } : undefined}
              />
              {tried && (
                <span
                  id="rf-dob-err"
                  role="alert"
                  className="flex items-center gap-1.5 font-sans text-[12.5px] leading-[1.4] font-semibold text-sin"
                >
                  <span className="block size-3.5 flex-none">
                    <Icon name="alert" />
                  </span>
                  {t("dobErr")}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMore((v) => !v)}
              aria-expanded={more}
              aria-controls="rf-more"
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 self-start border-none bg-transparent p-0 font-sans text-[14px] leading-[1.3] font-semibold text-em7"
            >
              <span className="block size-[18px]">
                <Icon name="plus" />
              </span>
              {t("more")}
            </button>

            {more && (
              <div id="rf-more" className="grid grid-cols-1 gap-x-3 gap-y-4 min-[480px]:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-2">
                  <label htmlFor="rf-tob" className={LABEL}>
                    {t("tob")}
                  </label>
                  <input
                    id="rf-tob"
                    type="time"
                    value={tob}
                    onChange={(e) => setTob(e.target.value)}
                    className={cn(FIELD, "shadow-[inset_0_0_0_1px_#EAE0CA]")}
                  />
                </div>
                <div className="relative flex min-w-0 flex-col gap-2">
                  <label htmlFor="rf-place" className={LABEL}>
                    {t("place")}
                  </label>
                  <PlaceInput
                    id="rf-place"
                    value={place}
                    onChange={(val) => {
                      setPlace(val);
                      setSelectedPlace(null);
                    }}
                    onSelect={(p) => {
                      const placeStr = p.region ? `${p.name}, ${p.region}` : p.name;
                      setPlace(placeStr);
                      setSelectedPlace(p);
                    }}
                    placeholder={t("placeHint")}
                    className={cn(FIELD, "shadow-[inset_0_0_0_1px_#EAE0CA]")}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="inline-flex h-[52px] cursor-pointer items-center gap-2.5 self-start rounded-btn border-none bg-em7 px-[26px] font-sans text-[15px] leading-none font-semibold text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)] hover:bg-em5"
            >
              {t("submit")}
              <span className="block size-[17px]">
                <Icon name="arrowR" />
              </span>
            </button>
          </form>
        </div>

        <div aria-live="polite" className="min-w-0">
          {!found ? (
            <div className="relative grid grid-cols-4 gap-px overflow-hidden rounded-btn bg-[rgba(184,146,58,.35)] shadow-[inset_0_0_0_1px_rgba(184,146,58,.35)]">
              {RASHI.map((x) => (
                <span key={x.key} className="flex aspect-square flex-col items-center justify-center gap-1.5 bg-s1">
                  <span className="block aspect-square w-[30%]">
                    <RashiGlyph k={x.key} col="#B8923A" sw={1.3} />
                  </span>
                  <span lang="hi" className="font-deva text-[15px] leading-[1.2] text-g7">
                    {x.hi}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <div
              ref={foundRef}
              id="rf-found"
              className="relative grid grid-cols-1 items-center gap-6 overflow-hidden rounded-btn bg-n9 p-[clamp(22px,3vw,36px)] text-em1 shadow-[inset_0_0_0_1px_rgba(217,185,106,.45),0_30px_60px_-36px_rgba(10,31,26,.7)] min-[480px]:grid-cols-2"
            >
              <div className="relative grid aspect-[5/6] w-full max-w-[220px] place-items-center justify-self-center rounded-[50%_50%_4px_4px/42%_42%_4px_4px] bg-n8 shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)]">
                <span className="block aspect-square w-[52%]">
                  <RashiGlyph k={found.r.key} col="#D9B96A" sw={1.1} />
                </span>
              </div>
              <div className="flex min-w-0 flex-col gap-3">
                <span className="font-sans text-[11px] leading-[1.3] font-semibold tracking-[.14em] text-g3 uppercase hi:tracking-normal">
                  {found.moon ? t("kindMoon") : t("kindSun")}
                </span>
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span lang="en" className="font-display text-[clamp(36px,4vw,48px)] leading-none text-iv">
                    {found.r.en}
                  </span>
                  <span lang="hi" className="font-deva text-[28px] leading-[1.2] text-g3">
                    {found.r.hi}
                  </span>
                </span>
                <span className="font-sans text-[14px] leading-[1.6] font-medium text-pretty text-sg3">
                  {found.moon ? t("noteMoon", { nak: found.nak ?? "" }) : t("noteSun")}
                </span>
                <div className="mt-1 flex flex-wrap gap-2.5">
                  <Link
                    href={rashiHref(found.r.key, per)}
                    className="inline-flex h-12 items-center gap-2 rounded-btn bg-g3 px-[18px] font-sans text-[14px] leading-none font-bold text-n9 no-underline hover:bg-g4 hover:text-n9"
                  >
                    {t("read", { name: found.r.en })}
                    <span className="block size-[15px]">
                      <Icon name="arrowR" />
                    </span>
                  </Link>
                  {mine === found.r.key ? (
                    <span className="inline-flex h-12 items-center gap-2 font-sans text-[14px] leading-none font-semibold text-[#9CC9AE]">
                      <span className="block size-4">
                        <Icon name="checkc" />
                      </span>
                      {t("marked")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={save}
                      className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-btn border-none bg-transparent px-4 font-sans text-[14px] leading-none font-semibold text-g1 shadow-[inset_0_0_0_1px_rgba(217,185,106,.6)] hover:bg-[rgba(217,185,106,.1)]"
                    >
                      <span className="block size-4">
                        <Icon name="heart" />
                      </span>
                      {t("remember")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
