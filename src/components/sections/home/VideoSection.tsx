import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { SHORT_THUMB_SVG, VIDEO_THUMB_SVG } from "@/lib/art/thumbs";
import videos from "@/lib/data/videos.json";
import { ShortsRow, VideoPlayer, YtSubscribe, type VideoItem } from "./VideoPlayer";

/* §13 "12 YouTube discourses" (Home.dc.html 763–839, vVideo 1328–1345, L3 1255).
   Night band with a faint mandala top-right. Header + subscriber line + Subscribe; on mobile the
   Shorts stories row; then the featured player (facade) with the six-video "Up next" list.
   Only the six videos and six Shorts used here send their thumbnail strings to the client. */

type Vid = keyof typeof VIDEO_THUMB_SVG;
type Short = keyof typeof SHORT_THUMB_SVG;
const CAT = Object.fromEntries(videos.cats.map(([k, en]) => [k, en]));

export async function VideoSection() {
  const t = await getTranslations("home.video");
  const em = (c: ReactNode) => <em className="text-g3 italic">{c}</em>;

  const six = videos.videos.slice(0, 6);
  const items: VideoItem[] = six.map((v) => ({
    id: v.id,
    en: v.en,
    desc: v.desc,
    dur: v.dur,
    date: v.date,
    cat: CAT[v.cat] ?? "",
  }));
  const thumbs = Object.fromEntries(six.map((v) => [v.id, VIDEO_THUMB_SVG[v.id as Vid]]));
  const shorts = videos.shorts.map((s) => ({ id: s.id, en: s.en, dur: s.dur }));
  const shortThumbs = Object.fromEntries(videos.shorts.map((s) => [s.id, SHORT_THUMB_SVG[s.id as Short]]));

  return (
    <section lang="en" data-screen-label="12 YouTube discourses" className="relative overflow-hidden bg-n9 text-em1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-260px] right-[-260px] size-[720px] opacity-[.06]"
      >
        <svg viewBox="-300 -300 600 600" width="100%" height="100%" className="block">
          <MandalaG R={296} col="#D9B96A" sw={1} />
        </svg>
      </div>
      <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)]">
        <div className="mb-[clamp(24px,3.4vw,44px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-[18px]">
          <MaskText className="flex flex-col gap-3">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g3 uppercase">
              {t("eyebrow")}{" "}
              <span lang="hi" className="font-hi text-[1.12em] font-medium tracking-normal normal-case">
                · {t("eyebrowHi")}
              </span>
            </span>
            <h2 className="m-0 font-display text-[clamp(26px,3.4vw,44px)] leading-[1.12] font-normal tracking-[-.018em] text-iv font-soft">
              <MaskLine>{t.rich("l1", { em })}</MaskLine>
            </h2>
          </MaskText>
          <div className="flex flex-wrap items-center gap-3.5">
            <span className="font-sans text-[13.5px] leading-[1.4] font-medium text-sg3">{videos.subs}</span>
            <YtSubscribe />
          </div>
        </div>
        <ShortsRow shorts={shorts} thumbs={shortThumbs} />
        <VideoPlayer videos={items} thumbs={thumbs} />
      </div>
    </section>
  );
}
