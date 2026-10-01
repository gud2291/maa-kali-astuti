import type { CSSProperties, ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons/Icon";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import { KundaliChart } from "@/components/signature/KundaliChart";
import { InlineArt } from "@/components/ui/InlineArt";
import { DEMO_K } from "@/lib/astro/kundali";
import { SEAL_SVG } from "@/lib/art/seal";
import { LOSHU_SVG, PALM_LIGHT_SVG, TAROT_SVG } from "@/lib/art/service-art";
import { fmt } from "@/lib/core/format";
import consult from "@/lib/data/consult.json";
import services from "@/lib/data/services.json";
import { bookHref, routes, serviceHref } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

/* §8 "07 Consultations" (Home.dc.html 562–620, vBento 1216–1232). Bento: the dark Kundali tile
   (2×2 on desktop, static chart at 20% + a slowly turning guarantee seal) with Palmistry, Tarot
   and Numerology tiles; then the four-step "How a consultation works" strip. The chart, palm and
   Lo Shu art are never drawn on Home (INV gotcha 10), so they render complete. */

type Svc = (typeof services)[number];
type ModeKey = keyof typeof consult.modes;
const svc = (k: string) => services.find((s) => s.key === k) as Svc;
const modes = (s: Svc) =>
  (s.modes as ModeKey[]).map((m) => ({ t: consult.modes[m].t, icon: consult.modes[m].ic as IconName }));

type Palette = {
  bg: string;
  ring: string;
  head: string;
  hiC: string;
  sub: string;
  icRing: string;
  icC: string;
  btn: string;
};
const LIGHT: Palette = {
  bg: "bg-cream",
  ring: "shadow-[inset_0_0_0_1px_#EAE0CA]",
  head: "text-em9",
  hiC: "text-g7",
  sub: "text-ink6",
  icRing: "shadow-[inset_0_0_0_1px_rgba(184,146,58,.55)]",
  icC: "text-g5",
  btn: "bg-em7 text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)]",
};
const SAND: Palette = { ...LIGHT, bg: "bg-s1", ring: "shadow-[inset_0_0_0_1px_rgba(184,146,58,.4)]" };
const DARK: Palette = {
  bg: "bg-n8",
  ring: "shadow-[inset_0_0_0_1px_rgba(217,185,106,.3)]",
  head: "text-iv",
  hiC: "text-g3",
  sub: "text-sg3",
  icRing: "shadow-[inset_0_0_0_1px_rgba(217,185,106,.45)]",
  icC: "text-g3",
  btn: "bg-g3 text-n9",
};

type Tile = {
  k: string;
  pal: Palette;
  art: ReactNode;
  /** Reveal index. */
  r: number;
  /** grid-column / min-height / art box, per breakpoint (classes). */
  cls: string;
  artCls: string;
  artStyle: CSSProperties;
  /** Palm uses two columns from 768 so the art sits right of the text. */
  twoCol?: boolean;
};

const TILES: Tile[] = [
  {
    k: "palm",
    pal: LIGHT,
    art: <InlineArt svg={PALM_LIGHT_SVG} uid="hm-palm" />,
    r: 1,
    cls: "min-h-[300px] md:col-[1/span_2] md:min-h-[250px] lg:col-[3/span_2]",
    artCls: "top-[6%] right-[3%] w-[40%] lg:w-[36%]",
    artStyle: { aspectRatio: "300/280" },
    twoCol: true,
  },
  {
    k: "tarot",
    pal: SAND,
    art: <InlineArt svg={TAROT_SVG} uid="hm-tarot" />,
    r: 2,
    cls: "min-h-[300px] md:col-[1/span_1] md:min-h-[270px] lg:col-[3/span_1]",
    artCls: "top-[-2%] right-[-6%] w-[40%] lg:w-[46%]",
    artStyle: { aspectRatio: "280/240" },
  },
  {
    k: "numerology",
    pal: DARK,
    art: <InlineArt svg={LOSHU_SVG} uid="hm-loshu" />,
    r: 3,
    cls: "min-h-[300px] md:col-[2/span_1] md:min-h-[270px] lg:col-[4/span_1]",
    artCls: "top-[-3%] right-[-4%] w-[34%] lg:w-[36%]",
    artStyle: { aspectRatio: "1/1" },
  },
];

const DEVA_NUM = ["१", "२", "३", "४"];

export async function ConsultBento() {
  const t = await getTranslations("home.bento");
  const em = (c: ReactNode) => <em className="text-g5 italic">{c}</em>;
  const kx = svc("kundali");

  return (
    <section lang="en" data-screen-label="07 Consultations" className="bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] pt-[clamp(64px,9vw,136px)] pb-[clamp(56px,7vw,112px)]">
        <div className="mb-[clamp(28px,4vw,52px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-end gap-x-16 gap-y-4">
          <MaskText className="flex flex-col gap-3">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase">
              {t("eyebrow")}
            </span>
            <h2 className="m-0 font-display text-[clamp(26px,3.4vw,44px)] leading-[1.12] font-normal tracking-[-.02em] text-em9 font-soft">
              <MaskLine>{t("l1")}</MaskLine>
              <MaskLine>{t.rich("l2", { em })}</MaskLine>
            </h2>
            <span lang="hi" className="font-deva text-[19px] leading-[1.35] text-g7">
              {t("deva")}
            </span>
          </MaskText>
          <div
            data-reveal="1"
            className="flex max-w-[460px] flex-col items-start gap-3.5 justify-self-start lg:justify-self-end"
          >
            <p className="m-0 font-sans text-[16px] leading-[1.65] text-pretty text-ink6">{t("intro")}</p>
            <Link
              href={routes.consultations}
              className="inline-flex items-center gap-2 bg-[linear-gradient(#B8923A,#B8923A)] bg-[length:100%_1px] bg-bottom bg-no-repeat py-1.5 font-sans text-[14px] leading-[1.3] font-semibold text-em7 no-underline"
            >
              {t("compare")}
              <Icon name="arrowR" className="size-[15px]" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-[clamp(12px,1.4vw,20px)] md:grid-cols-2 lg:grid-cols-4">
          {/* Kundali — the big dark tile */}
          <div
            data-reveal="0"
            className="relative flex min-h-[440px] flex-col justify-between gap-8 overflow-hidden rounded-btn bg-em9 p-[clamp(22px,3vw,40px)] text-em1 shadow-[inset_0_0_0_1px_rgba(217,185,106,.45)] md:col-[1/span_2] md:min-h-[420px] lg:row-[1/span_2] lg:min-h-[540px]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-[-10%] bottom-[-16%] aspect-square w-[66%] opacity-20"
            >
              <KundaliChart K={DEMO_K} col="#D9B96A" ink="#FBF7EE" sub="#9FB3AA" fs={16} />
            </span>
            <span className="absolute top-[clamp(18px,2.4vw,32px)] right-[clamp(18px,2.4vw,32px)] block aspect-square w-[clamp(86px,9vw,116px)]">
              <span data-amb="spin:80" className="block size-full">
                <InlineArt svg={SEAL_SVG} uid="hm" />
              </span>
            </span>
            <div className="relative flex max-w-[420px] flex-col gap-3.5">
              <span className="grid size-[52px] place-items-center rounded-pill bg-n8 text-g3 shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)]">
                <Icon name="kundali" className="size-[26px]" />
              </span>
              <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g3 uppercase">
                {t("most")}
              </span>
              <Link
                href={serviceHref("kundali")}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 no-underline"
              >
                <span className="font-display text-[clamp(30px,3.2vw,44px)] leading-[1.05] text-iv font-soft">
                  {kx.name}
                </span>
                <span lang="hi" className="font-deva text-[20px] leading-[1.3] text-g3">
                  {kx.hi}
                </span>
              </Link>
              <p className="m-0 font-sans text-[16px] leading-[1.65] text-pretty text-sg3">{kx.line}</p>
            </div>
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="font-sans text-[17px] leading-none font-bold whitespace-nowrap text-iv tabular">
                  {t("from", { price: fmt(kx.price) })}{" "}
                  <span className="text-[14px] font-medium text-sg3">· {kx.dur}</span>
                </span>
                <span className="flex gap-1.5">
                  {modes(kx).map((m) => (
                    <span
                      key={m.t}
                      role="img"
                      aria-label={m.t}
                      title={m.t}
                      className="grid size-8 place-items-center rounded-pill text-g3 shadow-[inset_0_0_0_1px_rgba(217,185,106,.45)]"
                    >
                      <Icon name={m.icon} className="size-4" />
                    </span>
                  ))}
                </span>
              </div>
              <Link
                href={bookHref("kundali")}
                className="inline-flex h-[50px] items-center gap-[9px] rounded-btn bg-g3 px-[22px] font-sans text-[14.5px] leading-none font-bold text-n9 no-underline transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-g4 hover:text-n9"
              >
                <Icon name="calendar" className="size-[17px]" />
                {t("book")}
              </Link>
            </div>
          </div>

          {TILES.map((tile) => {
            const x = svc(tile.k);
            const p = tile.pal;
            return (
              <div
                key={tile.k}
                data-reveal={tile.r}
                className={cn(
                  "relative grid grid-cols-1 items-end gap-[18px] overflow-hidden rounded-btn p-[clamp(20px,2.4vw,30px)]",
                  tile.twoCol && "md:grid-cols-[minmax(0,.62fr)_minmax(0,.38fr)]",
                  p.bg,
                  p.ring,
                  tile.cls,
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("pointer-events-none absolute block justify-self-end opacity-95", tile.artCls)}
                  style={tile.artStyle}
                >
                  {tile.art}
                </span>
                <div className="relative flex min-w-0 flex-col gap-2.5">
                  <span className={cn("grid size-11 place-items-center rounded-pill", p.icRing, p.icC)}>
                    <Icon name={x.icon as IconName} className="size-[22px]" />
                  </span>
                  <Link href={serviceHref(tile.k)} className="flex flex-col gap-1 no-underline">
                    <span className={cn("font-display text-[clamp(23px,2.2vw,28px)] leading-[1.1] font-soft", p.head)}>
                      {x.name}
                    </span>
                    <span lang="hi" className={cn("font-deva text-[16px] leading-[1.3]", p.hiC)}>
                      {x.hi}
                    </span>
                  </Link>
                  <span className={cn("font-sans text-[14.5px] leading-[1.6] text-pretty", p.sub)}>{x.line}</span>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                    <span className="flex flex-col gap-[7px]">
                      <span
                        className={cn("font-sans text-[15px] leading-none font-bold whitespace-nowrap tabular", p.head)}
                      >
                        {t("from", { price: fmt(x.price) })}{" "}
                        <span className={cn("text-[13px] font-medium", p.sub)}>· {x.dur}</span>
                      </span>
                      <span className="flex gap-[5px]">
                        {modes(x).map((m) => (
                          <span
                            key={m.t}
                            role="img"
                            aria-label={m.t}
                            title={m.t}
                            className={cn("grid size-7 place-items-center rounded-pill", p.icRing, p.icC)}
                          >
                            <Icon name={m.icon} className="size-3.5" />
                          </span>
                        ))}
                      </span>
                    </span>
                    <Link
                      href={bookHref(tile.k)}
                      className={cn(
                        "inline-flex h-11 items-center gap-[7px] rounded-btn px-4 font-sans text-[13.5px] leading-none font-semibold no-underline",
                        p.btn,
                      )}
                    >
                      {t("book")}
                      <Icon name="arrowR" className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-[clamp(28px,3.4vw,48px)] border-t border-dashed border-[rgba(184,146,58,.55)] pt-[clamp(20px,2.4vw,28px)]">
          <span className="mb-[18px] block font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase">
            {t("how")}
          </span>
          <ol className="m-0 grid list-none grid-cols-1 gap-x-7 gap-y-[18px] p-0 md:grid-cols-2 lg:grid-cols-4">
            {(consult.steps as [string, string, string][]).map(([, title, d], i) => (
              <li key={title} data-reveal={i} className="grid grid-cols-[44px_minmax(0,1fr)] items-start gap-3.5">
                <span
                  lang="hi"
                  className="grid size-11 place-items-center rounded-pill bg-s1 font-deva text-[20px] leading-none text-g7 shadow-[inset_0_0_0_1px_rgba(184,146,58,.55)]"
                >
                  {DEVA_NUM[i]}
                </span>
                <span className="flex flex-col gap-1 pt-[3px]">
                  <span className="font-sans text-[15px] leading-[1.3] font-semibold text-em9">{title}</span>
                  <span className="font-sans text-[14px] leading-[1.55] text-pretty text-ink6">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
