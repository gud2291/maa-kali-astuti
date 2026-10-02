"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { ShortsViewer, type ShortItem } from "@/components/sections/videos/ShortsViewer";
import { InlineArt } from "@/components/ui/InlineArt";
import { secs } from "@/lib/core/format";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { videoHref } from "@/lib/routes";
import { SOCIAL, YT_IDS, ytEmbed } from "@/lib/site";
import { useUi } from "@/stores/ui";
import { cn } from "@/lib/utils/cn";

/* §13 client islands (Home.dc.html 763–839, vVideo 1328–1345, vStart/vTick/vPause/vPick 1283–1294).
   Thumbnail markup arrives as trusted strings from src/lib/art/thumbs.ts (via the server section),
   so each one travels once and renders with its own id suffix.
   - Featured player is a facade: nothing from YouTube loads until play. With a real id (YT_IDS)
     play swaps in the youtube-nocookie iframe. Without one (the demo) it runs the design's preview
     playback: the thumb dims to .55, a gold bar fills over the video's length (WAAPI) and the clock
     ticks each second; pause / resume. The preview pauses when the player leaves the viewport or
     the tab is hidden. Reduced motion: the bar steps once a second instead of gliding.
   - "Up next" picks a video (back to idle). ≥1024 the list sits right of the player, 500px tall.
   - Mobile (<768) adds the Shorts stories row above; a story opens the ShortsViewer. */

export type VideoItem = { id: string; en: string; desc: string; dur: string; date: string; cat: string };

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** "Subscribe on YouTube": the channel once confirmed, else the design's info toast. */
export function YtSubscribe() {
  const t = useTranslations("home.video");
  const url = SOCIAL.find((s) => s.key === "youtube")?.url;
  const cls =
    "inline-flex h-12 cursor-pointer items-center gap-[9px] rounded-btn border-0 bg-g3 px-5 font-sans text-[14px] leading-none font-bold text-n9 no-underline hover:bg-g4 hover:text-n9";
  const inner = (
    <>
      <Icon name="youtube" className="size-[18px]" />
      {t("subscribe")}
    </>
  );
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={() => useUi.getState().toast({ msg: t("subSoon"), tone: "info" })} className={cls}>
      {inner}
    </button>
  );
}

/** Mobile Shorts stories row + viewer (Home.dc.html 776–785). */
export function ShortsRow({ shorts, thumbs }: { shorts: ShortItem[]; thumbs: Record<string, string> }) {
  const t = useTranslations("shorts");
  const [open, setOpen] = useState(-1);
  return (
    <>
      <div
        role="list"
        aria-label={t("label")}
        className="-mx-4 mb-[22px] no-scrollbar flex gap-3.5 overflow-x-auto px-4 pt-1 pb-1.5 md:hidden"
      >
        {shorts.map((sh, i) => (
          <div key={sh.id} role="listitem" className="flex-none">
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={t("watch", { title: sh.en })}
              className="flex w-[76px] cursor-pointer flex-col items-center gap-[7px] border-0 bg-transparent p-0"
            >
              <span className="block size-[72px] rounded-pill bg-[conic-gradient(#D9B96A,#B8683D,#D9B96A)] p-[3px]">
                <span className="block size-full overflow-hidden rounded-pill shadow-[0_0_0_2px_#0A1F1A]">
                  <InlineArt svg={thumbs[sh.id] ?? ""} uid={`hsr${sh.id}`} />
                </span>
              </span>
              <span className="line-clamp-2 max-w-[76px] text-center font-sans text-[11px] leading-[1.25] font-semibold text-em1">
                {sh.en}
              </span>
            </button>
          </div>
        ))}
      </div>
      <ShortsViewer shorts={shorts} thumbs={thumbs} index={open} onIndex={setOpen} uid="hsv" />
    </>
  );
}

type Play = false | "play" | "pause" | "yt";

export function VideoPlayer({ videos, thumbs }: { videos: VideoItem[]; thumbs: Record<string, string> }) {
  const t = useTranslations("home.video");
  const [vid, setVid] = useState(0);
  const [play, setPlay] = useState<Play>(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const secRef = useRef(0);
  const animRef = useRef<Animation | null>(null);

  const v = videos[vid] ?? videos[0];
  const yt = v?.yt || (v ? YT_IDS[v.id] : undefined);

  // Preview playback: bar over the full length + a one-second clock (vStart / vTick / vPause).
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

  const start = () => setPlay(yt ? "yt" : "play");
  const pick = (i: number) => {
    animRef.current?.cancel();
    animRef.current = null;
    secRef.current = 0;
    setVid(i);
    setPlay(false);
  };

  const on = play === "play" || play === "pause";

  return (
    <div className="grid grid-cols-1 items-start gap-[clamp(16px,2vw,28px)] lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
      <div className="flex min-w-0 flex-col gap-3.5">
        <div
          ref={frameRef}
          className="relative aspect-video overflow-hidden rounded-btn bg-black shadow-[inset_0_0_0_1px_rgba(217,185,106,.35),0_40px_80px_-48px_rgba(0,0,0,.8)]"
        >
          {play !== "yt" && (
            <span
              className="absolute inset-0 block transition-opacity duration-[400ms]"
              style={{ opacity: on ? 0.55 : 1 }}
            >
              {yt ? (
                <img
                  src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`}
                  alt={v.en}
                  className="size-full object-cover"
                />
              ) : (
                <InlineArt key={v.id} svg={thumbs[v.id] ?? ""} uid={`hf${v.id}`} />
              )}
            </span>
          )}
          {!play && (
            <button
              type="button"
              onClick={start}
              aria-label={t("play", { title: v.en, dur: v.dur })}
              className="absolute inset-0 grid cursor-pointer place-items-center border-0 bg-transparent"
            >
              <span className="grid size-[84px] place-items-center rounded-pill bg-[rgba(10,31,26,.6)] text-g3 shadow-[inset_0_0_0_1.5px_#D9B96A,0_0_0_10px_rgba(217,185,106,.12)] transition-transform duration-[250ms] hover:scale-[1.06]">
                <Icon name="play" className="ml-[5px] size-8" />
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
                  aria-label={play === "play" ? t("pauseL") : t("playL")}
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
                {t("preview")}
              </span>
            </div>
          )}
          {play === "yt" && yt && (
            <iframe
              src={ytEmbed(yt)}
              title={t("frame", { title: v.en })}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 size-full border-0"
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2.5 font-sans text-[11px] leading-[1.2] font-semibold tracking-[.14em] text-g3 uppercase">
            {v.cat} · {v.date}
          </span>
          <span className="font-display text-[clamp(22px,2.2vw,28px)] leading-[1.2] font-normal text-balance text-iv">
            {v.en}
          </span>
          <span className="max-w-[680px] font-sans text-[15px] leading-[1.65] text-pretty text-sg3">{v.desc}</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-sg5 uppercase">
          {t("upNext")}
        </span>
        <div role="list" className="flex [scrollbar-width:thin] flex-col gap-1.5 overflow-y-auto pr-1 lg:max-h-[500px]">
          {videos.map((x, i) => {
            const cur = i === vid;
            return (
              <div key={x.id} role="listitem">
                <button
                  type="button"
                  onClick={() => pick(i)}
                  aria-current={cur ? "true" : undefined}
                  className={cn(
                    "grid w-full cursor-pointer grid-cols-[128px_minmax(0,1fr)] items-center gap-3 rounded-btn border-0 p-2 text-left transition-colors duration-200 hover:bg-n8",
                    cur ? "bg-n8 shadow-[inset_0_0_0_1px_rgba(217,185,106,.5)]" : "bg-transparent",
                  )}
                >
                  <span className="relative block aspect-video overflow-hidden rounded-3">
                    {x.yt || YT_IDS[x.id] ? (
                      <img
                        src={`https://i.ytimg.com/vi/${x.yt || YT_IDS[x.id]}/hqdefault.jpg`}
                        alt={x.en}
                        className="size-full object-cover"
                      />
                    ) : (
                      <InlineArt svg={thumbs[x.id] ?? ""} uid={`hp${x.id}`} />
                    )}
                    <span className="absolute right-[5px] bottom-[5px] inline-flex h-[18px] items-center rounded-[2px] bg-[rgba(10,31,26,.85)] px-[5px] font-sans text-[10px] leading-none font-bold text-iv tabular">
                      {x.dur}
                    </span>
                  </span>
                  <span className="flex min-w-0 flex-col gap-1.5">
                    <span className="inline-flex h-5 items-center self-start rounded-pill px-2 font-sans text-[9.5px] leading-none font-bold tracking-[.1em] text-g3 uppercase shadow-[inset_0_0_0_1px_rgba(217,185,106,.45)]">
                      {x.cat}
                    </span>
                    <span className="line-clamp-2 font-sans text-[14px] leading-[1.35] font-medium text-iv">
                      {x.en}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        <Link
          href={videoHref()}
          className="inline-flex items-center gap-2 py-2 font-sans text-[14px] leading-[1.3] font-semibold text-g1 no-underline hover:text-g1"
        >
          {t("all")}
          <Icon name="arrowR" className="size-[15px]" />
        </Link>
      </div>
    </div>
  );
}
