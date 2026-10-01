import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import { KundaliMini } from "./KundaliMini";
import { LoveMini } from "./LoveMini";

/* §7 "06 Kundali and Love Calculator" (Home.dc.html 437–560). Sand band: header, then the
   emerald Kundali card and the ivory Love card — 7fr / 5fr from 1100px, stacked below. */
export async function AstroTools({ buildNow }: { buildNow: number }) {
  const t = await getTranslations("home.tools");
  const em = (c: ReactNode) => <em className="text-g5 italic">{c}</em>;

  return (
    <section
      lang="en"
      data-screen-label="06 Kundali and Love Calculator"
      className="bg-s1 shadow-[inset_0_-1px_0_rgba(184,146,58,.35)]"
    >
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)]">
        <div className="mb-[clamp(28px,4vw,52px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-end gap-x-16 gap-y-4">
          <MaskText className="flex flex-col gap-3">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase">
              {t("eyebrow")}
            </span>
            <h2 className="m-0 font-display text-[clamp(26px,3.4vw,44px)] leading-[1.12] font-normal tracking-[-.02em] text-em9 font-soft">
              <MaskLine>{t.rich("title", { em })}</MaskLine>
            </h2>
            <span lang="hi" className="font-deva text-[19px] leading-[1.35] text-g7">
              {t("deva")}
            </span>
          </MaskText>
          <p
            data-reveal="1"
            className="m-0 max-w-[460px] justify-self-start font-sans text-[16px] leading-[1.65] text-pretty text-ink6 lg:justify-self-end"
          >
            {t("intro")}
          </p>
        </div>
        <div className="grid grid-cols-1 items-stretch gap-[clamp(16px,2vw,28px)] w1100:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <KundaliMini buildNow={buildNow} />
          <LoveMini />
        </div>
      </div>
    </section>
  );
}
