import Image from "next/image";
import { inArray } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { Icon, type IconName } from "@/components/icons/Icon";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { ArchClip, ArchFrame } from "@/components/signature/ArchFrame";
import { PanditJi } from "@/components/signature/PanditJi";
import { MediaImg } from "@/components/media/MediaImg";
import { db } from "@/server/db/client";
import { media } from "@/server/db/schema/core";
import { getSetting } from "@/server/settings/queries";
import { toMediaRef } from "@/server/media/refs";
import { rng } from "@/lib/core/rng";
import { loc } from "@/lib/domain/loc";
import type { MediaRef } from "@/lib/domain/media";
import { cn } from "@/lib/utils/cn";
import { HeroArt } from "./HeroArt";
import { HeroSlides, type HeroSlideTextResolved } from "./HeroSlides";
import { QuickActions } from "./QuickActions";

export type HeroSlideProp = HeroSlideTextResolved & {
  media?: MediaRef | null;
};

export type HeroProps = {
  locale?: string;
  slides?: HeroSlideProp[];
};

/* §1 Hero (Home.dc.html 34–184, layout L() 1366–1382, vHero 1393–1425).
   Layout breakpoints: <768 mobile · 768–1023 stacked (art 440px) · ≥1024 two columns, art right.
   Client revision: the desktop banner is a fixed 550px tall (art 384px wide); stacked layouts crop
   the art into a box of min(58vh, W × 1.05 + 30, W × 1.14), W = min(vw − 32, 520), with a 72px
   ivory fade. Slide 1 shows Pandit Ji; slides 2–3 swap the art for a full-bleed banner image.
   HeroSlides mirrors the active slide on the section as [data-slide] / [data-bg] (group "hero"). */

/** Full-bleed banners for slides 2 and 3. Replace the files to change the images. */
const BANNERS = [
  { src: "/images/hero/banner-2.webp", on: "group-data-[slide=1]/hero:opacity-100" },
  { src: "/images/hero/banner-3.webp", on: "group-data-[slide=2]/hero:opacity-100" },
];

type Gem = { k: string; l: string; t: string; w: string; px: number; amb: string };

// vHero G (1395): mobile (<768) and desktop sets.
const GEMS_MOB: Gem[] = [
  { k: "rose", l: "84%", t: "62%", w: "19%", px: 0.22, amb: "float:7:12:6:0" },
  { k: "rudraksha", l: "-4%", t: "56%", w: "15%", px: 0.16, amb: "float:9:10:-5:.4" },
];
const GEMS_DESK: Gem[] = [
  { k: "amethyst", l: "84%", t: "10%", w: "17%", px: 0.28, amb: "float:8:16:5:0" },
  { k: "citrine", l: "-9%", t: "30%", w: "13%", px: 0.2, amb: "float:10:14:-6:.3" },
  { k: "rose", l: "88%", t: "64%", w: "15%", px: 0.32, amb: "float:7:12:6:.6" },
  { k: "rudraksha", l: "-6%", t: "72%", w: "12%", px: 0.18, amb: "float:9:10:-5:.2" },
];

/* M.stars(n, 400, 360, 'hm-sky'): 34 stars on desktop, 18 on mobile. The seeded sequence is the
   same, so the mobile set is the first 18 of the desktop set. */
function HeroSky() {
  const R = rng("hm-sky");
  const stars = Array.from({ length: 34 }, () => {
    const r = R() < 0.15 ? 1.4 : R() < 0.5 ? 0.9 : 0.6;
    return { cx: (R() * 400).toFixed(1), cy: (R() * 360).toFixed(1), r };
  });
  return (
    <svg viewBox="0 0 400 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" className="block">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#D9B96A"
          data-amb="twinkle"
          className={i >= 18 ? "max-md:hidden" : undefined}
        />
      ))}
    </svg>
  );
}

function GemLayer({ g, className }: { g: Gem; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-px={g.px}
      className={cn("pointer-events-none absolute block aspect-square", className)}
      style={{ left: g.l, top: g.t, width: g.w }}
    >
      <span data-amb={g.amb} className="block size-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/svg/gems/${g.k}.svg`} alt="" width={100} height={100} className="block size-full" />
      </span>
    </span>
  );
}

const CHAKRA = [
  { ring: "outer", amb: "spin:120" },
  { ring: "middle", amb: "spin:-90" },
  { ring: "inner", amb: "spin:60" },
] as const;

export async function Hero({ locale, slides }: HeroProps = {}) {
  const t = await getTranslations("home.hero");
  const trust: { k: "a" | "b" | "c"; icon: IconName; size: string }[] = [
    { k: "a", icon: "starF", size: "size-[15px]" },
    { k: "b", icon: "rudraksha", size: "size-4" },
    { k: "c", icon: "flame", size: "size-4" },
  ];

  let effectiveSlides: HeroSlideProp[] | undefined = slides;
  if (!effectiveSlides) {
    const home = await getSetting("home");
    if (home.hero) {
      const mediaIds = [
        home.hero.s1.mediaId,
        home.hero.s2.mediaId,
        home.hero.s3.mediaId,
      ].filter((id): id is number => typeof id === "number" && id > 0);

      const mediaMap = new Map<number, MediaRef>();
      if (mediaIds.length > 0) {
        const rows = await db
          .select()
          .from(media)
          .where(inArray(media.id, mediaIds));
        for (const row of rows) {
          if (row.status === "ready") {
            mediaMap.set(row.id, toMediaRef(row));
          }
        }
      }

      const locKey = locale === "hi" ? "hi" : "en";
      effectiveSlides = (["s1", "s2", "s3"] as const).map((k) => {
        const s = home.hero![k];
        return {
          key: k,
          eyebrow: loc(s.eyebrow, locKey),
          l1: loc(s.l1, locKey),
          l2: loc(s.l2, locKey),
          sub: loc(s.sub, locKey),
          body: loc(s.body, locKey),
          cta1: loc(s.cta1, locKey),
          cta2: loc(s.cta2, locKey),
          media: s.mediaId ? mediaMap.get(s.mediaId) ?? null : null,
        };
      });
    }
  }

  const s1Slide = effectiveSlides?.find((x) => x.key === "s1");
  const s2Slide = effectiveSlides?.find((x) => x.key === "s2");
  const s3Slide = effectiveSlides?.find((x) => x.key === "s3");

  return (
    <section data-screen-label="01 Hero" data-slide="0" className="group/hero relative overflow-hidden bg-iv lg:h-[550px]">
      <ArchClip id="hero-arch" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 size-[1180px] -translate-x-1/2 -translate-y-1/2 opacity-5 transition-opacity duration-700 group-data-[bg]/hero:opacity-0 motion-reduce:transition-none lg:left-[74%]"
      >
        <svg viewBox="-300 -300 600 600" width="100%" height="100%" className="block">
          <MandalaG R={296} col="#7A5C1C" sw={0.8} />
        </svg>
      </div>

      {/* Banner layer (slides 2–3): image crossfade under a deep-emerald scrim that keeps the copy
          side readable — top→bottom on stacked layouts, left→right on desktop. */}
      <div
        aria-hidden="true"
        className="pointer-events-none invisible absolute inset-0 opacity-0 transition-[opacity,visibility] duration-700 group-data-[bg]/hero:visible group-data-[bg]/hero:opacity-100 motion-reduce:transition-none"
      >
        {s2Slide?.media ? (
          <MediaImg
            media={s2Slide.media}
            fill
            sizes="100vw"
            alt=""
            className="object-cover opacity-0 transition-opacity duration-700 motion-reduce:transition-none group-data-[slide=1]/hero:opacity-100"
          />
        ) : (
          <Image
            src="/images/hero/banner-2.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-0 transition-opacity duration-700 motion-reduce:transition-none group-data-[slide=1]/hero:opacity-100"
          />
        )}
        {s3Slide?.media ? (
          <MediaImg
            media={s3Slide.media}
            fill
            sizes="100vw"
            alt=""
            className="object-cover opacity-0 transition-opacity duration-700 motion-reduce:transition-none group-data-[slide=2]/hero:opacity-100"
          />
        ) : (
          <Image
            src="/images/hero/banner-3.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-0 transition-opacity duration-700 motion-reduce:transition-none group-data-[slide=2]/hero:opacity-100"
          />
        )}
        <span className="absolute inset-0 block bg-[linear-gradient(180deg,rgba(10,31,26,.12)_0%,rgba(10,31,26,.5)_36%,rgba(10,31,26,.9)_58%)] lg:bg-[linear-gradient(90deg,rgba(10,31,26,.9)_0%,rgba(10,31,26,.66)_46%,rgba(10,31,26,.1)_100%)]" />
      </div>

      <div className="relative mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] items-center gap-7 px-4 pt-2 pb-10 md:px-8 md:pt-6 md:pb-14 lg:h-full lg:grid-cols-[minmax(0,1.02fr)_minmax(0,.98fr)] lg:gap-[clamp(40px,5vw,80px)] lg:py-0">
        {/* Art column (slide 1 only; kept in flow on slides 2–3 so the height never jumps) */}
        <div className="relative order-0 h-[min(58svh,calc(min(100vw_-_32px,520px)_*_1.05_+_30px),calc(min(100vw_-_32px,520px)_*_1.14))] min-w-0 overflow-hidden pt-[34px] transition-[opacity,visibility] duration-500 group-data-[bg]/hero:invisible group-data-[bg]/hero:opacity-0 motion-reduce:transition-none lg:order-2 lg:h-auto lg:overflow-visible lg:pt-[34px]">
          <HeroArt className="relative mx-auto aspect-[4/5] w-[84%] max-w-full md:w-[440px] lg:w-[384px]">
            <div className="absolute inset-0 bg-n9 [clip-path:url(#hero-arch)]">
              {s1Slide?.media ? (
                <MediaImg
                  media={s1Slide.media}
                  fill
                  sizes="(min-width: 1024px) 384px, (min-width: 768px) 440px, 84vw"
                  alt=""
                  priority
                  className="object-cover"
                />
              ) : (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 block bg-[radial-gradient(58%_44%_at_50%_36%,#1C4A3D,rgba(10,31,26,0))]"
                  />
                  <span aria-hidden="true" data-px="0.1" className="absolute inset-x-0 top-[-6%] block h-[72%]">
                    <HeroSky />
                  </span>
                  <div
                    aria-hidden="true"
                    className="absolute top-[35.2%] left-1/2 aspect-square w-[72%] -translate-x-1/2 -translate-y-1/2"
                  >
                    {CHAKRA.map((c) => (
                      <span key={c.ring} data-amb={c.amb} className="absolute inset-0 block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/svg/chakra/${c.ring}-d9b96a.svg`}
                          alt=""
                          width={400}
                          height={400}
                          className="block size-full"
                        />
                      </span>
                    ))}
                  </div>
                  <span className="absolute inset-0 block">
                    <PanditJi />
                  </span>
                </>
              )}
            </div>
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 block">
              <ArchFrame />
            </span>
            {GEMS_MOB.map((g) => (
              <GemLayer key={`m-${g.k}`} g={g} className="md:hidden" />
            ))}
            {GEMS_DESK.map((g) => (
              <GemLayer key={`d-${g.k}`} g={g} className="max-md:hidden" />
            ))}
          </HeroArt>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[72px] bg-[linear-gradient(rgba(251,247,238,0),#FBF7EE)] lg:hidden"
          />
        </div>

        {/* Text column: slides + controls (client), trust row, mobile quick actions */}
        <HeroSlides slides={effectiveSlides}>
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2.5 border-t border-s2 pt-[18px] font-sans text-[13px] leading-[1.3] font-semibold text-ink transition-colors duration-500 group-data-[bg]/hero:border-iv/20 group-data-[bg]/hero:text-iv">
            {trust.map((x, i) => (
              <span key={x.k} className="contents">
                {i > 0 && <span aria-hidden="true" className="size-1 rounded-pill bg-g5" />}
                <span className="flex items-center gap-[7px]">
                  <span className={cn("block text-g5", x.size)}>
                    <Icon name={x.icon} />
                  </span>
                  {t(`trust.${x.k}`)}
                </span>
              </span>
            ))}
          </div>
          <QuickActions />
        </HeroSlides>
      </div>
    </section>
  );
}
