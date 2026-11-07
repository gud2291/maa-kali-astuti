"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons/Icon";
import { enter, stagger } from "@/components/motion/fx";
import { ProductImage } from "@/components/commerce/ProductImage";
import intents from "@/lib/data/intents.json";
import { categoryHref, intentHref, productHref, serviceHref } from "@/lib/routes";
import { fmt } from "@/lib/core/format";
import { loc } from "@/lib/domain/loc";
import { waLinkTo } from "@/lib/core/commerce";
import { useCatalog } from "@/stores/catalog";
import type { Product } from "@/types/product";
import { useSiteSettings } from "./SiteSettingsProvider";

/* Panel shell (SiteChrome 94 / 148): hangs under the header; enters −8px 280 ms and staggers its
   `[data-col]` children (y10, 360 ms, 45 ms steps) — SiteChrome 485. */
function Panel({ onEnter, children }: { onEnter: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    enter(ref.current, { y: -8, dur: 280 });
    stagger(ref.current, "[data-col]", { y: 10, dur: 360, step: 45 });
  }, []);
  return (
    <div
      ref={ref}
      onMouseEnter={onEnter}
      className="absolute inset-x-0 top-full hidden bg-iv shadow-[inset_0_1px_0_rgba(184,146,58,.45),0_28px_48px_-28px_rgba(14,59,48,.35)] nav:block"
    >
      {children}
    </div>
  );
}

const num = "font-sans text-[11px] leading-none font-semibold tracking-[.16em] text-g7";
const catName = "font-display text-[19px] leading-[1.15] font-normal text-em9";
const catHi = "font-deva text-[14px] leading-[1.35] font-normal text-g7";
const itemLink = "font-sans text-[14px] leading-[1.4] font-medium text-ink no-underline hover:text-em5";

function CatLink({
  cat,
  name,
  hi,
  close,
  mb = true,
}: {
  cat: Product["cat"];
  name: string;
  hi: string;
  close: () => void;
  mb?: boolean;
}) {
  return (
    <Link
      href={categoryHref(cat)}
      onClick={close}
      className={`flex flex-col gap-[5px] no-underline ${mb ? "mb-[3px]" : ""}`}
    >
      <span className={catName}>{name}</span>
      <span lang="hi" className={catHi}>
        {hi}
      </span>
    </Link>
  );
}

const BRACELETS = ["pyrite", "citrine", "rose", "tourmaline", "tiger", "amethyst", "chakra"];

/** Shop mega menu (SiteChrome 93–145, 486–490): five category columns, "Not sure?", featured 12 Nag, intention chips. */
export function MegaShop({ close, keep }: { close: () => void; keep: () => void }) {
  const t = useTranslations("chrome.mega");
  const hi = useLocale() === "hi";
  const { contact } = useSiteSettings();
  const byId = useCatalog((s) => s.byId);
  const products = useCatalog((s) => s.snap?.products ?? []);
  const nag = byId.get("nag12");
  const amulets = products.filter((p) => p.cat === "amulets");
  const attars = products.filter((p) => p.cat === "attar");
  const books = products.filter((p) => p.cat === "books");

  return (
    <Panel onEnter={keep}>
      <div className="mx-auto grid max-w-[1320px] grid-cols-[repeat(5,minmax(0,1fr))_272px] gap-7 px-6 pt-[30px] pb-6">
        <div data-col="1" className="flex flex-col gap-3">
          <span className={num}>01</span>
          <CatLink cat="rudraksha" name="Rudraksha & Malas" hi="रुद्राक्ष एवं माला" close={close} mb={false} />
          <div className="mt-0.5 grid grid-cols-5 gap-1">
            {Array.from({ length: 13 }, (_, i) => i + 2).map((n) => {
              const p = byId.get("r" + n);
              return (
                <Link
                  key={n}
                  href={p ? productHref(p) : `/product/rudraksha-${n}-mukhi`}
                  onClick={close}
                  aria-label={t("mukhiAria", { n })}
                  className="grid h-[30px] place-items-center rounded-3 font-sans text-[12px] leading-none font-semibold text-em7 tabular no-underline shadow-ring-sand transition-colors duration-150 hover:bg-em1"
                >
                  {n}
                </Link>
              );
            })}
          </div>
          <span className="font-sans text-[11px] leading-[1.3] font-medium text-ink6">{t("mukhiNote")}</span>
          {byId.get("m5") && (
            <Link href={productHref(byId.get("m5")!)} onClick={close} className={itemLink}>
              5 Mukhi Mala
            </Link>
          )}
          {byId.get("m7") && (
            <Link href={productHref(byId.get("m7")!)} onClick={close} className={itemLink}>
              7 Mukhi Mala
            </Link>
          )}
        </div>

        <div data-col="1" className="flex flex-col gap-[9px]">
          <span className={num}>02</span>
          <CatLink cat="bracelets" name="Crystal Bracelets" hi="क्रिस्टल ब्रेसलेट" close={close} />
          {BRACELETS.map((k) => {
            const p = byId.get("b-" + k);
            if (!p) return null;
            return (
              <Link key={k} href={productHref(p)} onClick={close} className={itemLink}>
                {p.stoneName}
              </Link>
            );
          })}
          <Link
            href={categoryHref("bracelets")}
            onClick={close}
            className="font-sans text-[13px] leading-[1.4] font-semibold text-em7 no-underline"
          >
            {t("allBracelets")}
          </Link>
        </div>

        <div data-col="1" className="flex flex-col gap-[9px]">
          <span className={num}>03</span>
          <CatLink cat="amulets" name="Sacred Amulets" hi="भोजपत्र कवच" close={close} />
          {amulets.map((p) => (
            <Link key={p.id} href={productHref(p)} onClick={close} className={itemLink}>
              {p.name.replace(" Amulet", "").replace("Protection ", "")}
            </Link>
          ))}
        </div>

        <div data-col="1" className="flex flex-col gap-[9px]">
          <span className={num}>04</span>
          <CatLink cat="havan" name="Havan Samagri" hi="हवन सामग्री" close={close} />
          {byId.get("havan") && (
            <Link href={productHref(byId.get("havan")!)} onClick={close} className={itemLink}>
              Bitter Havan · 100 g
            </Link>
          )}
          <span className={`${num} mt-3.5`}>05</span>
          <CatLink cat="copper" name="Energized Copper" hi="ऊर्जित ताम्र" close={close} />
          {nag && (
            <Link href={productHref(nag)} onClick={close} className={itemLink}>
              Copper 12 Nag set
            </Link>
          )}
          <span className={`${num} mt-3.5`}>06</span>
          <CatLink cat="attar" name="Attar & Fragrance Oils" hi="अत्तर एवं सुगंधित तेल" close={close} />
          {attars.map((p) => (
            <Link key={p.id} href={productHref(p)} onClick={close} className={itemLink}>
              {p.name.replace(" (Fragrance Oil)", "")}
            </Link>
          ))}
          <span className={`${num} mt-3.5`}>07</span>
          <CatLink cat="books" name="Spiritual Books" hi="आध्यात्मिक पुस्तकें" close={close} />
          {books.map((p) => (
            <Link key={p.id} href={productHref(p)} onClick={close} className={itemLink}>
              {p.name}
            </Link>
          ))}
        </div>

        <div data-col="1" className="flex flex-col gap-[9px]">
          <span className={num}>—</span>
          <span className={catName}>{t("notSure")}</span>
          <p className="m-0 font-sans text-[14px] leading-[1.55] font-normal text-ink6">{t("notSureBody")}</p>
          <a
            href={waLinkTo(contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-2 font-sans text-[13px] leading-none font-semibold text-em7 no-underline"
          >
            <span className="block size-4">
              <Icon name="whatsapp" />
            </span>
            {t("askWa")}
          </a>
        </div>

        {nag && (
          <Link
            data-col="1"
            href={productHref(nag)}
            onClick={close}
            className="grid grid-cols-[96px_1fr] items-center gap-3.5 self-start rounded-btn bg-s1 p-3 no-underline shadow-[inset_0_0_0_1px_rgba(184,146,58,.4)]"
          >
            <span className="relative block aspect-[4/5] w-24 overflow-hidden rounded-3 bg-s1">
              <ProductImage p={{ ...nag, date: 0, pop: 0 }} sizes="96px" alt="" />
            </span>
            <span className="flex flex-col gap-1.5">
              <span className="font-sans text-[10px] leading-[1.2] font-semibold tracking-[.14em] text-[#8A4A26] uppercase hi:tracking-normal">
                {t("featured")}
              </span>
              <span className="font-display text-[16px] leading-[1.25] font-normal text-em9">
                Hand-Energized Pure Copper 12 Nag
              </span>
              <span className="font-sans text-[14px] leading-none font-bold text-ink tabular">
                {fmt(nag.price)} <span className="text-[12px] font-medium text-ink6 line-through">{fmt(nag.mrp)}</span>
              </span>
            </span>
          </Link>
        )}
      </div>

      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-2.5 border-t border-dashed border-s2 px-6 pt-3.5 pb-[22px]">
        <span className="mr-1.5 font-sans text-[11px] leading-none font-semibold tracking-[.16em] text-g7 uppercase hi:tracking-normal">
          {t("byIntention")}
        </span>
        {intents.map((i) => (
          <Link
            key={i.key}
            href={intentHref(i.key as Product["ik"])}
            onClick={close}
            className="flex h-8 items-center gap-[7px] rounded-pill bg-cream px-3.5 font-sans text-[13px] leading-none font-medium text-em7 no-underline shadow-ring-sand transition-[box-shadow,background-color] duration-150 hover:bg-em1 hover:shadow-[inset_0_0_0_1px_#1C6B54]"
          >
            <span className="block size-[15px] text-g5">
              <Icon name={i.icon as IconName} />
            </span>
            {hi ? i.hi : i.en}
          </Link>
        ))}
      </div>
    </Panel>
  );
}

/** Consultations mega menu (SiteChrome 147–165, 491): four service cards + the guarantee card. */
export function MegaConsult({ close, keep }: { close: () => void; keep: () => void }) {
  const t = useTranslations("chrome.mega");
  const locale = useLocale();
  const services = useCatalog((s) => s.snap?.services ?? []);

  return (
    <Panel onEnter={keep}>
      <div className="mx-auto grid max-w-[1320px] grid-cols-[repeat(4,minmax(0,1fr))_260px] gap-5 px-6 py-[26px]">
        {services.map((s) => (
          <Link
            key={s.key}
            data-col="1"
            href={serviceHref(s.key)}
            onClick={close}
            className="flex flex-col gap-2.5 rounded-btn bg-cream p-[18px] no-underline shadow-ring-sand transition-shadow duration-200 hover:shadow-ring-g5"
          >
            <span className="block size-7 text-g5">
              <Icon name={s.icon as IconName} />
            </span>
            <span className="font-display text-[19px] leading-[1.2] font-normal text-em9">{loc(s.name, locale)}</span>
            <span className="font-sans text-[13px] leading-[1.5] font-normal text-ink6">{loc(s.line, locale)}</span>
            <span className="font-sans text-[13px] leading-none font-semibold text-ink tabular">
              {t("from", { price: fmt(s.price) })} <span className="font-medium text-ink6">· {s.dur}</span>
            </span>
          </Link>
        ))}
        <div data-col="1" className="flex flex-col gap-2.5 rounded-btn bg-em9 p-[18px] text-iv">
          <span className="block size-[30px] text-g3">
            <Icon name="seal" />
          </span>
          <span className="font-display text-[18px] leading-[1.25] font-normal">{t("guaranteeTitle")}</span>
          <span className="font-sans text-[13px] leading-[1.5] font-normal text-em1">{t("guaranteeBody")}</span>
        </div>
      </div>
    </Panel>
  );
}
