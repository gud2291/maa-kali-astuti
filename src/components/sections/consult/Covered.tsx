import { getTranslations } from "next-intl/server";
import { ICON_PATHS } from "@/lib/art/icons";
import { Icon, type IconName } from "@/components/icons/Icon";
import type { Service } from "@/lib/api/consult";
import { EYEBROW, rich } from "./ui";

/* §2 "What's covered" (Consultation-Detail.dc.html 69–85). Sand band. Heading + note (sticky at
   top 96px from 980px) beside a ruled 2-column list (auto-fit, min 300px) of covered areas, each
   with an icon circle. Items reveal in pairs (data-reveal = index % 2). Unknown icons fall back to
   the lotus, as in the design. */

const icon = (k: string): IconName => (k in ICON_PATHS ? (k as IconName) : "lotus");

export async function Covered({ s }: { s: Service }) {
  const t = await getTranslations("consult.detail");

  return (
    <section data-screen-label="What's covered" className="bg-s1 shadow-hair-y">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(28px,5vw,80px)] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)] min-[980px]:grid-cols-[minmax(0,.8fr)_minmax(0,1.6fr)]">
        <div data-reveal="0" className="static top-24 flex flex-col gap-3 min-[980px]:sticky">
          <span className={`${EYEBROW} text-g7`}>{t("covEyebrow")}</span>
          <h2
            lang="en"
            className="m-0 font-display text-[clamp(32px,3.6vw,48px)] leading-[1.08] font-normal tracking-[-.018em] text-balance text-em9 font-soft"
          >
            {t.rich(`copy.${s.key}.cov`, rich())}
          </h2>
          <p className="m-0 max-w-[380px] font-sans text-[15.5px] leading-[1.65] text-pretty text-ink6">
            {t(`copy.${s.key}.covNote`)}
          </p>
        </div>
        <ul
          lang="en"
          className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-x-9 border-t border-[rgba(184,146,58,.5)] p-0"
        >
          {s.covered.map(([ik, title, d], i) => (
            <li
              key={title}
              data-reveal={i % 2}
              className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 border-b border-[rgba(184,146,58,.5)] py-[22px]"
            >
              <span className="grid size-11 place-items-center rounded-pill bg-iv text-em7 shadow-[inset_0_0_0_1px_rgba(184,146,58,.55)]">
                <Icon name={icon(ik)} className="size-[22px]" />
              </span>
              <span className="flex flex-col gap-[5px]">
                <span className="font-display text-[20px] leading-[1.25] font-normal text-em9">{title}</span>
                <span className="font-sans text-[14.5px] leading-[1.55] text-pretty text-ink6">{d}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
