import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import type { Service } from "@/lib/api/consult";
import { fmt } from "@/lib/core/format";
import { bookHref } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { EYEBROW, rich } from "./ui";

/* §4 Packages #tiers (Consultation-Detail.dc.html 108–134). Ivory. Essential / Detailed / Premium:
   the recommended tier is the dark emerald card with the gold "Most chosen" pill and a gold button;
   the other two are cream with an outline button and sit 24px lower when the three share a row
   (≥900px). Each button opens the booking flow on that tier. Palmistry's first two tiers read
   "Report" instead of minutes. */

const LIGHT = {
  card: "bg-cream text-ink shadow-ring-sand w900:mt-6",
  title: "text-em9",
  sub: "text-g7",
  tick: "text-em5",
  rule: "border-s2",
  btn: "bg-transparent text-em7 shadow-ring-em hover:text-em7",
};
const REC = {
  card: "bg-em9 text-em1 shadow-[inset_0_0_0_1px_rgba(217,185,106,.6),0_30px_60px_-34px_rgba(10,31,26,.6)]",
  title: "text-iv",
  sub: "text-g3",
  tick: "text-g3",
  rule: "border-[rgba(217,185,106,.3)]",
  btn: "bg-g3 text-n9 hover:text-n9",
};

export async function Tiers({ s }: { s: Service }) {
  const t = await getTranslations("consult");

  return (
    <section id="tiers" data-screen-label="Packages" className="scroll-mt-16 bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,120px)]">
        <div className="mb-[clamp(32px,4vw,52px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-14 gap-y-[18px]">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={`${EYEBROW} text-g7`}>{t("detail.tiersEyebrow")}</span>
            <h2
              lang="en"
              className="m-0 font-display text-[clamp(32px,3.8vw,50px)] leading-[1.08] font-normal tracking-[-.018em] text-em9 font-soft"
            >
              {t.rich("detail.tiersTitle", rich())}
            </h2>
          </div>
          <p data-reveal="1" className="m-0 max-w-[480px] font-sans text-[15.5px] leading-[1.65] text-pretty text-ink6">
            {t("detail.tiersIntro")}
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-7 w900:grid-cols-3 w900:gap-5">
          {s.tiers.map((tier, i) => {
            const rec = !!tier.rec;
            const P = rec ? REC : LIGHT;
            return (
              <article
                key={tier.k}
                data-reveal={i}
                className={cn("relative flex flex-col gap-[18px] rounded-btn p-[clamp(24px,3vw,34px)]", P.card)}
              >
                {rec && (
                  <span className="absolute top-[-13px] left-[clamp(24px,3vw,34px)] inline-flex h-[26px] items-center gap-1.5 rounded-pill bg-g3 px-3 font-sans text-[10.5px] leading-none font-bold tracking-[.12em] text-n9 uppercase hi:tracking-normal">
                    <Icon name="starF" className="size-3" />
                    {t("detail.mostChosen")}
                  </span>
                )}
                <div className="flex items-baseline justify-between gap-2.5">
                  <span
                    lang="en"
                    className={cn("font-display text-[28px] leading-[1.1] font-normal font-soft", P.title)}
                  >
                    {tier.t}
                  </span>
                  <span className={cn("font-sans text-[12.5px] leading-none font-semibold", P.sub)}>
                    {s.key === "palm" && i < 2 ? t("detail.report") : t("dur.mins", { n: tier.mins })}
                  </span>
                </div>
                <span className={cn("font-sans text-[34px] leading-none font-bold tracking-[-.01em] tabular", P.title)}>
                  {fmt(tier.price)}
                </span>
                <ul lang="en" className={cn("m-0 flex flex-1 list-none flex-col gap-3 border-t p-0 pt-[18px]", P.rule)}>
                  {tier.inc.map((x) => (
                    <li
                      key={x}
                      className="grid grid-cols-[18px_minmax(0,1fr)] gap-2.5 font-sans text-[14.5px] leading-[1.5] font-medium"
                    >
                      <Icon name="check" className={cn("mt-0.5 size-[18px]", P.tick)} />
                      {x}
                    </li>
                  ))}
                </ul>
                <Link
                  href={bookHref(s.key, tier.k)}
                  className={cn(
                    "flex h-[50px] items-center justify-center gap-[9px] rounded-btn font-sans text-[14.5px] leading-none font-semibold tracking-[.02em] no-underline transition-transform duration-200 hover:-translate-y-px hi:tracking-normal",
                    P.btn,
                  )}
                >
                  {t("detail.choose", { t: tier.t })}
                  <Icon name="arrowR" className="size-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
