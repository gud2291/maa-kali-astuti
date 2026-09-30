"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { EASE } from "@/components/motion/easing";
import { EYEBROW, rich } from "@/components/sections/consult/ui";
import { NightCrumbs } from "@/components/sections/rashifal/ui";
import { Starfield } from "@/components/signature/Starfield";
import { InlineArt } from "@/components/ui/InlineArt";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import type { Short, Video } from "@/lib/api/content";
import { secs } from "@/lib/core/format";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { routes } from "@/lib/routes";
import { SOCIAL, YT_IDS, ytEmbed } from "@/lib/site";
import { useUi } from "@/stores/ui";
import { cn } from "@/lib/utils/cn";
import { ShortsViewer } from "./ShortsViewer";

/* Videos page §1–§3 + Shorts viewer (design/Videos.dc.html 32–145, 163–174; script 179–236).
   One client island because the library grid drives the featured player.
   - URL: `?c=<cat>&v=<id>` is read once on mount (design reads the hash once); a tab writes `c`,
     a pick writes `c` and `v` (history.replaceState, no navigation).
   - Featured player (#player) is a facade: nothing loads from YouTube until play. With a real id
     (YT_IDS) play swaps in the youtube-nocookie iframe; the demo runs the design's preview: thumb
     .55, gold bar over the video's length (WAAPI), clock every second, pause / resume. Paused
     offscreen and on a hidden tab. Reduced motion: the bar steps each second instead of gliding.
   - Picking a grid card scrolls to #player (−60px, smooth) and starts it; the info column fades in
     (350 ms). Changing the category re-staggers the cards (y14, 480 ms, +50 ms each, EASE).
   - Shorts: stories row (<768) + the 9:16 rail (46% / 30% / six across ≥1024); both open the
     shared ShortsViewer (Esc / ← / →, focus on Close, scroll lock). */

type Play = false | "play" | "pause" | "yt";

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** "Subscribe on YouTube": the channel once confirmed, else the design's info toast. */
export function SubButton({ className }: { className: string }) {
  const t = useTranslations("home.video");
  const url = SOCIAL.find((s) => s.key === "youtube")?.url;
  const cls = cn(
    "inline-flex cursor-pointer items-center gap-[9px] rounded-btn border-0 bg-g3 px-[22px] font-sans text-[14.5px] leading-none font-bold whitespace-nowrap text-n9 no-underline hover:bg-g4 hover:text-n9",
    className,
  );
  const inner = (
    <>
      <Icon name="youtube" className="size-[19px]" />
      {t("subscribe")}
    </>
  );
  return url ? (
    <a href={url} target="_blank" rel="noopener" className={cls}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={() => useUi.getState().toast({ msg: t("subSoon"), tone: "info" })} className={cls}>
      {inner}
    </button>
  );
}

export function VideosLibrary({
  cats,
  videos,
  shorts,
  subs,
  thumbs,
  shortThumbs,
}: {
  cats: [string, string, string][];
  videos: Video[];
  shorts: Short[];
  subs: string;
  thumbs: Record<string, string>;
  shortThumbs: Record<string, string>;
}) {
  const t = useTranslations("videos");
  const [cat, setCat] = useState("all");
  const [vid, setVid] = useState(videos[0]?.id ?? "v1");
  const [play, setPlay] = useState<Play>(false);
  const [short, setShort] = useState(-1);

  const frameRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const secRef = useRef(0);
  const animRef = useRef<Animation | null>(null);
  const prev = useRef<{ cat: string; vid: string } | null>(null);

  const catName = (k: string) => cats.find(([key]) => key === k)?.[1] ?? "";
  const v = videos.find((x) => x.id === vid) ?? videos[0];
  const yt = YT_IDS[v.id];
  const list = videos.filter((x) => cat === "all" || x.cat === cat);

  const writeUrl = (c: string, id?: string) => {
    const q = new URLSearchParams({ c });
    if (id) q.set("v", id);
    try {
      window.history.replaceState(window.history.state, "", `${window.location.pathname}?${q}`);
    } catch {}
  };

  // Read ?c= / ?v= once (didMount 181).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get("c");
    const id = q.get("v");
    if (c && cats.some(([k]) => k === c)) setCat(c);
    if (id && videos.some((x) => x.id === id)) setVid(id);
  }, [cats, videos]);

  // didUpdate 187–192: grid stagger on a category change, info fade on a video change.
  useEffect(() => {
    const p = prev.current;
    prev.current = { cat, vid };
    if (!p || isReduced()) return;
    if (p.cat !== cat && gridRef.current)
      gridRef.current.querySelectorAll("[data-card]").forEach((c, i) =>
        c.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], {
          duration: 480,
          delay: i * 50,
          easing: EASE,
          fill: "backwards",
        }),
      );
    if (p.vid !== vid && infoRef.current) infoRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350 });
  }, [cat, vid]);

  // Preview playback (start 194–202, tick 203, pause 204).
  useEffect(() => {
    if (play !== "play") {
      animRef.current?.pause();
      return;
    }
    const total = secs(v.dur);
    const bar = barRef.current;
    const reduced = isReduced();
    if (bar && !reduced) {
      animRef.current?.cancel();
      const a = bar.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        duration: total * 1000,
        fill: "forwards",
      });
      a.currentTime = secRef.current * 1000;
      animRef.current = a;
    }
    const tick = () => {
      if (timeRef.current) timeRef.current.textContent = clock(Math.floor(secRef.current));
      if (reduced && bar) bar.style.transform = `scaleX(${secRef.current / total})`;
    };
    tick();
    const iv = window.setInterval(() => {
      secRef.current = Math.min(total, secRef.current + 1);
      tick();
    }, 1000);
    return () => clearInterval(iv);
  }, [play, v.dur]);

  // The preview pauses offscreen and on a hidden tab.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const hold = () => setPlay((p) => (p === "play" ? "pause" : p));
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && hold(), { threshold: 0 });
    io.observe(el);
    const onVis = () => document.hidden && hold();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => () => animRef.current?.cancel(), []);

  const start = (id = vid) => setPlay(YT_IDS[id] ? "yt" : "play");

  // pick 205–208: reset, scroll to the player, start.
  const pick = (id: string) => {
    animRef.current?.cancel();
    animRef.current = null;
    secRef.current = 0;
    setVid(id);
    setPlay(false);
    writeUrl(cat, id);
    const el = document.getElementById("player");
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 60,
        behavior: isReduced() ? "auto" : "smooth",
      });
    // Start after the reset commits so the effect sees play === false → "play".
    requestAnimationFrame(() => start(id));
  };

  const on = play === "play" || play === "pause";
  const shareHref = `https://wa.me/?text=${encodeURIComponent(t("player.shareText", { title: v.en }))}`;

  return (
    <>
      {/* §1 Featured discourse (32–84) */}
      <section
        id="player"
        data-screen-label="01 Featured discourse"
        className="relative scroll-mt-16 overflow-hidden bg-n9 text-em1"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <Starfield seed="vd-sky" n={26} nMob={14} h={800} />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[-300px] right-[-260px] size-[760px] opacity-[.06]"
        >
          <svg viewBox="-300 -300 600 600" width="100%" height="100%" className="block">
            <MandalaG R={296} col="#D9B96A" sw={1} />
          </svg>
        </div>
        <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] pt-[clamp(20px,4vw,44px)] pb-[clamp(56px,8vw,104px)]">
          <div className="mb-[clamp(24px,3.4vw,44px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-[18px]">
            <div className="flex max-w-[760px] flex-col gap-3.5">
              <NightCrumbs
                label={t("crumbs.label")}
                items={[{ href: routes.home, t: t("crumbs.home") }, { t: t("crumbs.here") }]}
              />
              <span className={cn(EYEBROW, "text-g3")}>{t.rich("hero.eyebrow", rich("text-g3"))}</span>
              <h1
                lang="en"
                className="m-0 font-display text-[clamp(40px,5.4vw,76px)] leading-[1.02] font-normal tracking-[-.022em] text-balance text-iv font-soft"
              >
                {t.rich("hero.title", rich("text-g3"))}
              </h1>
              <span lang="hi" className="font-deva text-[clamp(18px,2vw,22px)] leading-[1.35] text-g3">
                {t("hero.deva")}
              </span>
            </div>
            <div className="flex flex-col items-start gap-2.5">
              <span className="font-sans text-[13.5px] leading-[1.4] font-medium text-sg3">
                {t("hero.subs", { subs })}
              </span>
              <SubButton className="h-[50px]" />
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-[clamp(20px,3vw,48px)] lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
            <div
              ref={frameRef}
              className="relative aspect-video overflow-hidden rounded-btn bg-black shadow-[inset_0_0_0_1px_rgba(217,185,106,.35),0_40px_80px_-48px_rgba(0,0,0,.8)]"
            >
              {play !== "yt" && (
                <span
                  className="absolute inset-0 block transition-opacity duration-[400ms]"
                  style={{ opacity: on ? 0.55 : 1 }}
                >
                  <InlineArt key={v.id} svg={thumbs[v.id] ?? ""} uid={`vf${v.id}`} />
                </span>
              )}
              {!play && (
                <button
                  type="button"
                  onClick={() => start()}
                  aria-label={t("player.play", { title: v.en, dur: v.dur })}
                  className="absolute inset-0 grid cursor-pointer place-items-center border-0 bg-transparent"
                >
                  <span className="grid size-[92px] place-items-center rounded-pill bg-[rgba(10,31,26,.6)] text-g3 shadow-[inset_0_0_0_1.5px_#D9B96A,0_0_0_12px_rgba(217,185,106,.12)] transition-transform duration-[250ms] hover:scale-[1.06]">
                    <Icon name="play" className="ml-[5px] size-[34px]" />
                  </span>
                  <span className="absolute right-3.5 bottom-3.5 inline-flex h-[26px] items-center rounded-3 bg-[rgba(10,31,26,.85)] px-[9px] font-sans text-[12px] leading-none font-bold text-iv tabular">
                    {v.dur}
                  </span>
                </button>
              )}
              {on && (
                <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(rgba(0,0,0,0)_55%,rgba(0,0,0,.75))]">
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => setPlay(play === "play" ? "pause" : "play")}
                      aria-label={play === "play" ? t("player.pauseL") : t("player.playL")}
                      className="grid size-10 cursor-pointer place-items-center rounded-pill border-0 bg-[rgba(251,247,238,.14)] text-iv"
                    >
                      <Icon name={play === "play" ? "pause" : "play"} className="size-[18px]" />
                    </button>
                    <span className="relative h-[3px] flex-1 rounded-pill bg-[rgba(251,247,238,.25)]">
                      <span
                        ref={barRef}
                        className="absolute inset-y-0 left-0 w-full origin-left rounded-pill bg-g3"
                        style={{ transform: "scaleX(0)" }}
                      />
                    </span>
                    <span className="font-sans text-[12px] leading-none font-semibold whitespace-nowrap text-iv tabular">
                      <span ref={timeRef} /> / {v.dur}
                    </span>
                  </div>
                  <span className="px-4 pb-3 font-sans text-[11.5px] leading-[1.3] font-medium text-sg3">
                    {t("player.preview")}
                  </span>
                </div>
              )}
              {play === "yt" && yt && (
                <iframe
                  src={ytEmbed(yt)}
                  title={t("player.frame", { title: v.en })}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute inset-0 size-full border-0"
                />
              )}
            </div>

            <div ref={infoRef} className="flex min-w-0 flex-col gap-3.5">
              <span className="inline-flex h-[26px] items-center self-start rounded-pill px-[11px] font-sans text-[10.5px] leading-none font-bold tracking-[.12em] text-g3 uppercase shadow-[inset_0_0_0_1px_rgba(217,185,106,.5)]">
                {catName(v.cat)}
              </span>
              <h2
                lang="en"
                className="m-0 font-display text-[clamp(24px,2.4vw,32px)] leading-[1.18] font-normal text-balance text-iv font-soft"
              >
                {v.en}
              </h2>
              <span lang="hi" className="font-deva text-[18px] leading-[1.35] text-g3">
                {v.hi.join(" ")}
              </span>
              <p lang="en" className="m-0 font-sans text-[15.5px] leading-[1.7] text-pretty text-sg3">
                {v.desc}
              </p>
              <dl className="m-0 grid grid-cols-2 gap-3 border-y border-[rgba(217,185,106,.2)] py-3.5">
                <div className="flex flex-col gap-[5px]">
                  <dt className="font-sans text-[10px] leading-[1.2] font-semibold tracking-[.14em] text-sg5 uppercase hi:tracking-normal">
                    {t("player.published")}
                  </dt>
                  <dd className="m-0 font-sans text-[14px] leading-[1.3] font-semibold text-iv">{v.date}</dd>
                </div>
                <div className="flex flex-col gap-[5px]">
                  <dt className="font-sans text-[10px] leading-[1.2] font-semibold tracking-[.14em] text-sg5 uppercase hi:tracking-normal">
                    {t("player.length")}
                  </dt>
                  <dd className="m-0 font-sans text-[14px] leading-[1.3] font-semibold text-iv tabular">{v.dur}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={shareHref}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex h-[46px] items-center gap-2 rounded-btn px-4 font-sans text-[13.5px] leading-none font-semibold text-g1 no-underline shadow-ring-gold hover:bg-[rgba(217,185,106,.1)] hover:text-iv"
                >
                  <Icon name="whatsapp" className="size-4" />
                  {t("player.share")}
                </a>
                <Link
                  href={routes.consultations}
                  className="inline-flex h-[46px] items-center gap-2 rounded-btn px-4 font-sans text-[13.5px] leading-none font-semibold text-g1 no-underline shadow-ring-gold hover:bg-[rgba(217,185,106,.1)] hover:text-iv"
                >
                  <Icon name="calendar" className="size-4" />
                  {t("player.ask")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §2 Library (86–115) */}
      <section data-screen-label="02 Library" className="bg-iv">
        <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)]">
          <div className="mb-[clamp(24px,3vw,40px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
            <div data-reveal="0" className="flex flex-col gap-3">
              <span className={cn(EYEBROW, "text-g7")}>{t("library.eyebrow")}</span>
              <h2
                lang="en"
                className="m-0 font-display text-[clamp(32px,3.8vw,50px)] leading-[1.08] font-normal tracking-[-.018em] text-em9 font-soft"
              >
                {t.rich("library.title", rich())}
              </h2>
            </div>
            <div
              role="tablist"
              aria-label={t("library.tabs")}
              className="no-scrollbar flex max-w-full gap-6 overflow-x-auto shadow-hair-bottom"
            >
              {cats.map(([k, en, hi]) => {
                const sel = cat === k;
                const n = k === "all" ? videos.length : videos.filter((x) => x.cat === k).length;
                return (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={sel}
                    onClick={() => {
                      setCat(k);
                      writeUrl(k);
                    }}
                    className={cn(
                      "flex min-h-11 flex-none cursor-pointer items-center gap-[7px] border-0 bg-transparent py-3 font-sans text-[14px] leading-none font-semibold whitespace-nowrap",
                      sel ? "text-em9 shadow-[inset_0_-2px_0_#B8923A]" : "text-ink6",
                    )}
                  >
                    <span lang="en">{en}</span>
                    <span lang="hi" className="font-hi text-[13.5px] leading-none font-medium text-g7">
                      {hi}
                    </span>
                    <span className="font-sans text-[12px] leading-none font-semibold text-ink6">{n}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div
            ref={gridRef}
            role="tabpanel"
            className="grid grid-cols-1 gap-x-[clamp(14px,2vw,28px)] gap-y-[clamp(24px,3vw,40px)] sm:grid-cols-2 lg:grid-cols-3"
          >
            {list.map((x) => (
              <article key={x.id} data-card="" className="flex min-w-0 flex-col gap-3.5">
                <button
                  type="button"
                  onClick={() => pick(x.id)}
                  aria-label={t("library.play", { title: x.en, dur: x.dur })}
                  className="relative block aspect-video w-full cursor-pointer overflow-hidden rounded-btn border-0 bg-n9 p-0 shadow-[inset_0_0_0_1px_rgba(184,146,58,.35)] transition-[transform,box-shadow] duration-300 hover:-translate-y-[3px] hover:shadow-[inset_0_0_0_1px_#B8923A,0_24px_44px_-28px_rgba(14,59,48,.6)]"
                >
                  <span className="absolute inset-0 block">
                    <InlineArt svg={thumbs[x.id] ?? ""} uid={`vg${x.id}`} />
                  </span>
                  <span className="absolute top-1/2 left-1/2 -mt-7 -ml-7 grid size-14 place-items-center rounded-pill bg-[rgba(10,31,26,.6)] text-g3 shadow-[inset_0_0_0_1.5px_#D9B96A]">
                    <Icon name="play" className="ml-[3px] size-[22px]" />
                  </span>
                  <span className="absolute right-2 bottom-2 inline-flex h-[22px] items-center rounded-[2px] bg-[rgba(10,31,26,.85)] px-[7px] font-sans text-[11px] leading-none font-bold text-iv tabular">
                    {x.dur}
                  </span>
                  {x.id === vid && !!play && (
                    <span className="absolute top-2 left-2 inline-flex h-[22px] items-center rounded-pill bg-g3 px-2 font-sans text-[10px] leading-none font-bold tracking-[.08em] text-n9 uppercase hi:tracking-normal">
                      {t("library.now")}
                    </span>
                  )}
                </button>
                <div lang="en" className="flex flex-col gap-[7px]">
                  <span className="font-sans text-[10.5px] leading-[1.2] font-semibold tracking-[.14em] text-g7 uppercase">
                    {catName(x.cat)} · {x.date}
                  </span>
                  <span className="font-display text-[clamp(19px,1.7vw,22px)] leading-[1.25] font-normal text-balance text-em9">
                    {x.en}
                  </span>
                  <span className="font-sans text-[14.5px] leading-[1.6] text-pretty text-ink6">{x.desc}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* §3 Shorts (117–145) */}
      <section data-screen-label="03 Shorts" className="bg-s1 shadow-hair-y">
        <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)]">
          <div className="mb-[clamp(22px,3vw,36px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div data-reveal="0" className="flex flex-col gap-3">
              <span className={cn(EYEBROW, "text-g7")}>{t("shorts.eyebrow")}</span>
              <h2
                lang="en"
                className="m-0 font-display text-[clamp(32px,3.8vw,50px)] leading-[1.08] font-normal tracking-[-.018em] text-em9 font-soft"
              >
                {t.rich("shorts.title", rich())}
              </h2>
            </div>
            <span data-reveal="1" className="max-w-[380px] font-sans text-[15px] leading-[1.6] text-ink6">
              {t("shorts.hint")}
            </span>
          </div>

          <ShortsStories shorts={shorts} thumbs={shortThumbs} onOpen={setShort} />

          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pt-1 pb-2 md:mx-0 md:px-0">
            {shorts.map((s, i) => (
              <ShortCard key={s.id} s={s} i={i} svg={shortThumbs[s.id] ?? ""} onOpen={setShort} />
            ))}
          </div>
        </div>
      </section>

      <ShortsViewer shorts={shorts} thumbs={shortThumbs} index={short} onIndex={setShort} uid="vsv" />
    </>
  );
}

/** Mobile stories row (126–135): gold conic ring, sand gap, two-line title. */
function ShortsStories({
  shorts,
  thumbs,
  onOpen,
}: {
  shorts: Short[];
  thumbs: Record<string, string>;
  onOpen: (i: number) => void;
}) {
  const t = useTranslations("shorts");
  return (
    <div
      role="list"
      aria-label={t("label")}
      className="no-scrollbar -mx-4 mb-5 flex gap-3.5 overflow-x-auto px-4 pt-1 pb-1.5 md:hidden"
    >
      {shorts.map((s, i) => (
        <div key={s.id} role="listitem" className="flex-none">
          <button
            type="button"
            onClick={() => onOpen(i)}
            aria-label={t("watch", { title: `${s.en}, ${s.dur}` })}
            className="flex w-[76px] cursor-pointer flex-col items-center gap-[7px] border-0 bg-transparent p-0"
          >
            <span className="block size-[72px] rounded-pill bg-[conic-gradient(#D9B96A,#B8683D,#D9B96A)] p-[3px]">
              <span className="block size-full overflow-hidden rounded-pill shadow-[0_0_0_2px_#F4EDDD]">
                <InlineArt svg={thumbs[s.id] ?? ""} uid={`vss${s.id}`} />
              </span>
            </span>
            <span
              lang="en"
              className="line-clamp-2 max-w-[76px] text-center font-sans text-[11px] leading-[1.25] font-semibold text-ink"
            >
              {s.en}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}

/** One 9:16 card in the rail (138–141). Width: 46% (<768), 30%, six across from 1024. */
function ShortCard({ s, i, svg, onOpen }: { s: Short; i: number; svg: string; onOpen: (i: number) => void }) {
  const t = useTranslations("shorts");
  return (
    <button
      type="button"
      onClick={() => onOpen(i)}
      aria-label={t("watch", { title: `${s.en}, ${s.dur}` })}
      data-reveal={i % 3}
      className="relative aspect-[9/16] flex-[0_0_46%] cursor-pointer snap-start overflow-hidden rounded-[6px] border-0 bg-n9 p-0 shadow-[0_20px_40px_-26px_rgba(14,59,48,.6)] transition-transform duration-300 hover:-translate-y-1 md:flex-[0_0_30%] lg:flex-[0_0_calc((100%-70px)/6)]"
    >
      <span className="absolute inset-0 block">
        <InlineArt svg={svg} uid={`vs${s.id}`} />
      </span>
      <span className="absolute top-2 right-2 inline-flex h-[22px] items-center gap-[5px] rounded-[2px] bg-[rgba(10,31,26,.85)] px-[7px] font-sans text-[11px] leading-none font-bold text-iv tabular">
        <Icon name="play" className="size-[11px]" />
        {s.dur}
      </span>
    </button>
  );
}
