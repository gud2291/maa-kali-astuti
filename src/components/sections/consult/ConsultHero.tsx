import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { InlineArt } from "@/components/ui/InlineArt";
import { PORTRAIT_BG_CONSULT_SVG } from "@/lib/art/portrait";
import { bookHref, routes } from "@/lib/routes";
import { Crumbs, EYEBROW, rich } from "./ui";

/* §1 Consultations hero (Consultations.dc.html 31–70). Ivory: a faint mandala top-left; copy with
   the breadcrumb, eyebrow, display h1, Devanagari line, intro, two CTAs and the trust row; the arch
   portrait with the S7 chakra (spin 120 / −90 / 60 s) between the night sky and the silhouette, and
   the name card overlapping its bottom-left. 2 columns from 980px; the arch is 300px wide <768. */

const CHAKRA = [
  { ring: "outer", amb: "spin:120" },
  { ring: "middle", amb: "spin:-90" },
  { ring: "inner", amb: "spin:60" },
] as const;

export async function ConsultHero() {
  const t = await getTranslations("consult");

  return (
    <section data-screen-label="Consultations hero" className="relative overflow-hidden bg-iv">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/svg/ornaments/mandala-7a5c1c.svg"
        alt=""
        aria-hidden="true"
        width={680}
        height={680}
        className="pointer-events-none absolute top-[-200px] left-[-220px] size-[680px] max-w-none opacity-[.06]"
      />
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[clamp(40px,6vw,88px)] px-[clamp(16px,4vw,32px)] pt-[clamp(20px,4vw,44px)] pb-[clamp(64px,8vw,112px)] min-[980px]:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
        <div className="flex min-w-0 flex-col gap-[18px]">
          <Crumbs
            label={t("breadcrumb")}
            items={[{ href: routes.home, t: t("crumbHome") }, { t: t("crumbConsult") }]}
          />
          <span className={`${EYEBROW} text-g7`}>{t.rich("hero.eyebrow", rich())}</span>
          <h1
            lang="en"
            className="m-0 font-display text-[clamp(40px,5.6vw,76px)] leading-[1.03] font-normal tracking-[-.022em] text-balance text-em9 font-soft"
          >
            {t.rich("hero.title", rich())}
          </h1>
          <span lang="hi" className="font-deva text-[clamp(18px,2vw,23px)] leading-[1.35] text-g7">
            {t("hero.deva")}
          </span>
          <p className="m-0 mt-1 max-w-[540px] font-sans text-[clamp(16px,1.4vw,18px)] leading-[1.65] text-pretty text-ink6">
            {t("hero.body")}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-3">
            <Link
              href={bookHref("kundali")}
              className="inline-flex h-[52px] items-center gap-2.5 rounded-btn bg-em7 sheen px-[26px] font-sans text-[15px] leading-none font-semibold tracking-[.03em] text-iv no-underline shadow-ring-gold hover:[transform:translateY(-1px)] hover:text-iv hi:tracking-normal"
            >
              <Icon name="calendar" className="size-[18px]" />
              {t("hero.book")}
            </Link>
            <AnchorLink
              to="services"
              className="inline-flex h-[52px] items-center gap-2 rounded-btn bg-iv px-[22px] font-sans text-[15px] leading-none font-semibold text-em7 no-underline shadow-ring-em transition-colors duration-150 hover:bg-em1 hover:text-em7"
            >
              {t("hero.compare")}
            </AnchorLink>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-[18px] gap-y-2.5 font-sans text-[13px] leading-[1.3] font-semibold text-ink">
            <span className="flex items-center gap-1.5">
              <Icon name="starF" className="size-[15px] text-g5" />
              {t("hero.rating")}
            </span>
            <span aria-hidden="true" className="size-1 rounded-pill bg-g5" />
            <span className="flex items-center gap-1.5">
              <Icon name="seal" className="size-4 text-g5" />
              {t("hero.guarantee")}
            </span>
            <span aria-hidden="true" className="size-1 rounded-pill bg-g5" />
            <span className="flex items-center gap-1.5">
              <Icon name="globe" className="size-4 text-g5" />
              {t("hero.lang")}
            </span>
          </div>
        </div>

        <div className="relative w-full max-w-[300px] justify-self-center pb-7 md:max-w-[440px]">
          <div className="relative aspect-[300/380]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-[8%] bottom-[-22px] left-[8%] h-10 rounded-[50%] bg-[radial-gradient(closest-side,rgba(14,59,48,.28),rgba(14,59,48,0))]"
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 324 404"
              fill="none"
              stroke="#B8923A"
              strokeWidth="1"
              className="pointer-events-none absolute top-[-3.2%] left-[-4%] h-[106.3%] w-[108%] overflow-visible"
            >
              <path d="M2 404V162A160 160 0 0 1 322 162V404" opacity=".55" />
            </svg>
            <span className="absolute inset-0 block">
              <InlineArt svg={PORTRAIT_BG_CONSULT_SVG} uid="cons" />
            </span>
            <div
              aria-hidden="true"
              className="absolute top-[38.4%] left-1/2 aspect-square w-[74%] -translate-x-1/2 -translate-y-1/2 opacity-60"
            >
              {CHAKRA.map((c) => (
                <span key={c.ring} data-amb={c.amb} className="absolute inset-0 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/svg/chakra/${c.ring}-d9b96a.svg`}
                    alt=""
                    width={320}
                    height={320}
                    className="block size-full"
                  />
                </span>
              ))}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/svg/portrait/fg.svg"
              alt={t("hero.portraitAlt")}
              width={300}
              height={380}
              className="absolute inset-0 block size-full"
            />
          </div>
          <div className="absolute bottom-0 left-[-4px] flex max-w-[260px] flex-col gap-1.5 rounded-btn bg-iv px-[18px] py-3.5 shadow-[inset_0_0_0_1px_rgba(184,146,58,.55),0_18px_36px_-20px_rgba(14,59,48,.4)] md:left-[-36px]">
            <span lang="en" className="font-display text-[19px] leading-[1.15] font-normal text-em9">
              {t("hero.capName")}
            </span>
            <span className="font-sans text-[12.5px] leading-[1.45] font-medium text-ink6">{t("hero.capLine")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
