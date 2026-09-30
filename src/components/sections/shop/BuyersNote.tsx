"use client";
import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { seoKey, type ShopCat } from "./shop-data";

/** "Buyer's note" SEO block (Shop.dc.html 213–224, seoMap 350–355): clipped to 96px with a fade, "Read more" opens. */
export function BuyersNote({ cat }: { cat: ShopCat }) {
  const t = useTranslations("shop");
  const [open, setOpen] = useState(false);
  const id = useId();
  const k = seoKey(cat);
  return (
    <section className="mx-auto max-w-[1480px] px-[clamp(16px,3vw,24px)] pb-[clamp(56px,7vw,96px)]">
      <div className="max-w-[760px] border-t border-s2 pt-8">
        <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase hi:tracking-normal">
          {t("note")}
        </span>
        <h2 className="mt-2.5 mb-3 font-display text-[26px] leading-[1.2] font-normal text-em9 hi:font-deva hi:leading-[1.4]">
          {t(`seo.${k}.h`)}
        </h2>
        <div
          id={id}
          className="relative overflow-hidden transition-[max-height] duration-500 ease-mka"
          style={{ maxHeight: open ? 600 : 96 }}
        >
          <p className="mb-3 font-sans text-[15px] leading-[1.7] text-ink6">{t(`seo.${k}.p1`)}</p>
          <p className="m-0 font-sans text-[15px] leading-[1.7] text-ink6">{t(`seo.${k}.p2`)}</p>
          {!open && (
            <div className="absolute inset-x-0 bottom-0 h-14 bg-[linear-gradient(rgba(251,247,238,0),#FBF7EE)]" />
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={id}
          className="mt-2.5 cursor-pointer border-0 bg-transparent py-1 font-sans text-[13px] leading-none font-semibold text-em7"
        >
          {open ? t("readLess") : t("readMore")}
        </button>
      </div>
    </section>
  );
}
