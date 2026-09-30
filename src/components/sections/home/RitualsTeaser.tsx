import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import { InlineArt } from "@/components/ui/InlineArt";
import { THALI_HOME_SVG } from "@/lib/art/thali";
import rituals from "@/lib/data/rituals.json";
import { anchors } from "@/lib/routes";
import { RitualSteps } from "./RitualSteps";

/* §11 "10 Rituals and Anushthan" (Home.dc.html 688–719, vRituals 1313–1319, L3 1253).
   Ivory band: the brass thali (glow:4 halo inside the art, smoke, diya flicker) under a `glow:5`
   radial halo, sticky at top 120px on ≥1024; beside it the heading, the scroll-filled five-step
   process (RitualSteps), the ethics quote and the sheen CTA. One column below 1024. */

export async function RitualsTeaser() {
  const t = await getTranslations("home.rituals");
  const em = (c: ReactNode) => <em className="text-g5 italic">{c}</em>;

  return (
    <section lang="en" data-screen-label="10 Rituals and Anushthan" className="relative overflow-hidden bg-iv">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(32px,5vw,96px)] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,136px)] lg:grid-cols-2">
        <div className="static top-[120px] flex min-w-0 flex-col items-center gap-5 lg:sticky">
          <div data-reveal="0" className="relative w-full max-w-[560px]">
            <span
              aria-hidden="true"
              data-amb="glow:5"
              className="pointer-events-none absolute top-[40%] left-1/2 aspect-square w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-pill bg-[radial-gradient(closest-side,rgba(242,198,109,.34),rgba(242,198,109,0))]"
            />
            <span className="relative block aspect-[520/400] w-full">
              <InlineArt svg={THALI_HOME_SVG} uid="hm" />
            </span>
          </div>
          <span className="text-center font-display text-[17px] leading-[1.4] font-normal text-g7 italic">
            {t("caption")}
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-[22px]">
          <MaskText className="flex flex-col gap-3">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase">
              {t("eyebrow")} ·{" "}
              <span lang="hi" className="font-hi text-[1.12em] font-medium tracking-normal normal-case">
                {t("eyebrowHi")}
              </span>
            </span>
            <h2 className="m-0 font-display text-[clamp(34px,4.2vw,56px)] leading-[1.06] font-normal tracking-[-.02em] text-em9 font-soft">
              <MaskLine>{t("l1")}</MaskLine>
              <MaskLine>{t.rich("l2", { em })}</MaskLine>
            </h2>
          </MaskText>

          <RitualSteps steps={rituals.process as [string, string, string][]} />

          <figure
            data-reveal="1"
            className="m-0 mt-2.5 rounded-btn bg-s1 px-6 py-[22px] shadow-[inset_0_0_0_1px_rgba(184,146,58,.4)]"
          >
            <blockquote className="m-0 font-display text-[clamp(20px,2vw,25px)] leading-[1.4] font-normal text-pretty text-em9 italic [font-variation-settings:'SOFT'_50]">
              {t("quote")}
            </blockquote>
            <figcaption className="mt-3 font-sans text-[11.5px] leading-[1.3] font-semibold tracking-[.14em] text-g7 uppercase">
              {t("quoteBy")}
            </figcaption>
          </figure>

          <Link
            href={anchors.ritualsInquire}
            className="inline-flex h-[52px] items-center gap-2.5 self-start rounded-btn bg-em7 sheen px-6 font-sans text-[15px] leading-none font-semibold text-iv no-underline shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)] hover:text-iv"
          >
            <Icon name="diya" className="size-[18px]" />
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
