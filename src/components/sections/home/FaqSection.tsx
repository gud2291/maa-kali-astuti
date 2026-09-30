import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/icons/Icon";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import { FaqList } from "@/components/ui/FaqList";
import faq from "@/lib/data/faq.json";
import { waLink } from "@/lib/site";

/* §16 "15 FAQ" (Home.dc.html 894–911, L3 1258). Ivory band: heading + the emerald "Still unsure?"
   WhatsApp card (sticky at top 110px on ≥1024) beside FaqList set "home", first answer open. */

export async function FaqSection() {
  const t = await getTranslations("home.faq");
  const em = (c: ReactNode) => <em className="text-g5 italic">{c}</em>;

  return (
    <section lang="en" data-screen-label="15 FAQ" className="bg-iv">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(32px,5vw,80px)] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)] lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.3fr)]">
        <div className="static top-[110px] flex flex-col gap-[18px] lg:sticky">
          <MaskText className="flex flex-col gap-3">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase">
              {t("eyebrow")}
            </span>
            <h2 className="m-0 font-display text-[clamp(32px,3.8vw,50px)] leading-[1.08] font-normal tracking-[-.018em] text-em9 font-soft">
              <MaskLine>{t.rich("l1", { em })}</MaskLine>
            </h2>
            <span lang="hi" className="font-deva text-[19px] leading-[1.35] text-g7">
              {t("deva")}
            </span>
          </MaskText>
          <div
            data-reveal="1"
            className="flex flex-col gap-3 rounded-btn bg-em9 p-[22px] text-em1 shadow-[inset_0_0_0_1px_rgba(217,185,106,.45)]"
          >
            <span className="grid size-11 place-items-center rounded-pill text-g3 shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)]">
              <Icon name="whatsapp" className="size-[22px]" />
            </span>
            <span className="font-display text-[22px] leading-[1.2] font-normal text-iv">{t("waTitle")}</span>
            <span className="font-sans text-[14.5px] leading-[1.6] text-sg3">{t("waBody")}</span>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener"
              className="inline-flex h-[46px] items-center gap-2 self-start rounded-btn bg-g3 px-[18px] font-sans text-[14px] leading-none font-bold text-n9 no-underline hover:bg-g4 hover:text-n9"
            >
              {t("waCta")}
              <Icon name="arrowR" className="size-[15px]" />
            </a>
          </div>
        </div>
        <FaqList items={faq.home as [string, string][]} openFirst />
      </div>
    </section>
  );
}
