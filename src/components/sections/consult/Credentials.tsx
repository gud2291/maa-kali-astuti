import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons/Icon";
import { CountGroup, Counter } from "@/components/motion/Counter";
import { LotusRule } from "@/components/ui/ornaments";
import { routes } from "@/lib/routes";
import { EYEBROW, UNDERLINE, rich } from "./ui";

/* §4 Credentials (Consultations.dc.html 151–183). Ivory. The founder quote (big brass quote mark,
   italic Fraunces, lotus rule, caption) beside "Who you speak with": heading, bio, four credentials
   in a ruled grid, three count-up stats (1600 ms at 40% visible) and "Read his story". Two columns
   (.9fr / 1.1fr) from 980px. */

const CRED_ICONS: IconName[] = ["cert", "flame", "eye", "scroll"];
const STATS: [number, string][] = [
  [18, "+"],
  [12000, "+"],
  [3500, "+"],
];

export async function Credentials() {
  const t = await getTranslations("consult.cred");
  const items = t.raw("items") as { t: string; d: string }[];
  const stats = t.raw("stats") as string[];

  return (
    <section data-screen-label="Credentials" className="bg-iv">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(40px,6vw,96px)] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)] min-[980px]:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <figure data-reveal="0" className="relative m-0 flex flex-col gap-[22px] pt-3">
          <span
            aria-hidden="true"
            className="h-12 font-display text-[120px] leading-[.6] font-normal text-g5 opacity-50"
          >
            “
          </span>
          <blockquote
            lang="en"
            className="m-0 font-display text-[clamp(28px,3.2vw,42px)] leading-[1.18] font-normal tracking-[-.012em] text-balance text-em9 italic [font-variation-settings:'SOFT'_50]"
          >
            {t("quote")}
          </blockquote>
          <span className="block h-3.5 w-[180px]">
            <LotusRule />
          </span>
          <figcaption className="font-sans text-[12px] leading-[1.4] font-semibold tracking-[.14em] text-g7 uppercase hi:tracking-normal">
            {t("caption")}
          </figcaption>
        </figure>

        <div className="flex flex-col gap-[18px]">
          <span data-reveal="0" className={`${EYEBROW} text-g7`}>
            {t("eyebrow")}
          </span>
          <h2
            data-reveal="1"
            lang="en"
            className="m-0 font-display text-[clamp(32px,3.8vw,50px)] leading-[1.08] font-normal tracking-[-.018em] text-em9 font-soft"
          >
            {t.rich("title", rich())}
          </h2>
          <span data-reveal="1" lang="hi" className="font-deva text-[18px] leading-[1.35] text-g7">
            {t("deva")}
          </span>
          <p data-reveal="2" className="m-0 max-w-[560px] font-sans text-[16.5px] leading-[1.7] text-pretty text-ink6">
            {t("body")}
          </p>
          <ul className="m-0 mt-2 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-x-7 border-t border-s2 p-0">
            {items.map((c, i) => (
              <li key={i} className="grid grid-cols-[26px_minmax(0,1fr)] gap-3.5 border-b border-s2 py-4">
                <Icon name={CRED_ICONS[i]} className="size-6 text-g5" />
                <span className="flex flex-col gap-1">
                  <span className="font-sans text-[15px] leading-[1.3] font-semibold text-em9">{c.t}</span>
                  <span className="font-sans text-[13.5px] leading-[1.5] text-ink6">{c.d}</span>
                </span>
              </li>
            ))}
          </ul>
          <CountGroup className="mt-2.5 grid grid-cols-3 gap-4">
            {STATS.map(([v, suf], i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <span className="font-display text-[clamp(34px,4vw,52px)] leading-none font-normal tracking-[-.02em] text-em9 tabular">
                  <Counter value={v} />
                  <span className="text-g5">{suf}</span>
                </span>
                <span className="font-sans text-[13px] leading-[1.4] font-medium text-ink6">{stats[i]}</span>
              </div>
            ))}
          </CountGroup>
          <Link
            href={routes.about}
            className={`${UNDERLINE} mt-2 inline-flex items-center gap-2 self-start text-[14px] leading-none`}
          >
            {t("story")}
            <Icon name="arrowR" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
