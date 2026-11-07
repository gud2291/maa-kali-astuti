import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { ProductImage } from "@/components/commerce/ProductImage";
import { productHref } from "@/lib/routes";
import type { Product } from "@/types/product";

/* Featured book: the cover (always whole, never cropped), the title block and a direct "Buy on Flipkart"
   button. The book is sold on Flipkart, so there is no cart here and no price is shown. */
export async function BookSpotlight({ product: p }: { product: Product }) {
  const t = await getTranslations("home.book");
  const locale = await getLocale();
  const hi = locale === "hi";
  const author = p.long?.split(" by ")[1];

  return (
    <section data-screen-label="Featured book" className="bg-s1 shadow-[inset_0_1px_0_rgba(184,146,58,.3),inset_0_-1px_0_rgba(184,146,58,.3)]">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(48px,7vw,96px)]">
        <div className="grid items-center gap-[clamp(28px,5vw,72px)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Link
            href={productHref(p)}
            aria-label={p.long ?? p.name}
            className="relative mx-auto block aspect-[4/5] w-full max-w-[380px] overflow-hidden rounded-btn bg-iv shadow-[inset_0_0_0_1px_rgba(184,146,58,.45),0_24px_48px_-28px_rgba(14,59,48,.45)]"
          >
            <ProductImage p={p} sizes="(min-width: 768px) 32vw, 90vw" />
          </Link>

          <div className="flex flex-col items-start gap-4">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase hi:tracking-normal">
              {t("eyebrow")}
            </span>
            <h2 lang="hi-IN" className="m-0 font-deva text-[clamp(40px,6vw,76px)] leading-[1.15] font-normal text-em9">
              {p.name}
            </h2>
            <p lang="hi-IN" className="m-0 font-deva text-[clamp(18px,2vw,24px)] leading-[1.45] text-g7">
              {p.hi.includes("–") ? p.hi.split("–")[1].trim() : p.hi}
            </p>
            {author && (
              <p lang="hi-IN" className="m-0 font-deva text-[clamp(16px,1.6vw,19px)] leading-[1.4] font-medium text-em9">
                {hi ? `लेखक: ${author}` : `by ${author}`}
              </p>
            )}
            <p lang="hi-IN" className="m-0 font-deva text-[15px] leading-[1.5] tracking-[.04em] text-ink6">
              सत्य • साधना • संघर्ष
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <a
                href={p.buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[54px] items-center gap-2.5 rounded-btn bg-em7 px-7 font-sans text-[15.5px] leading-none font-semibold text-iv no-underline shadow-ring-gold transition-colors hover:bg-em5 hover:text-iv"
              >
                {t("buy")}
                <span className="block size-[17px]">
                  <Icon name="arrowR" />
                </span>
              </a>
              <Link
                href={productHref(p)}
                className="inline-flex h-[54px] items-center gap-2 rounded-btn bg-iv px-6 font-sans text-[15px] leading-none font-semibold text-em7 no-underline shadow-ring-em transition-colors duration-150 hover:bg-em1 hover:text-em7"
              >
                {t("details")}
              </Link>
            </div>
            <span className="font-sans text-[12.5px] leading-[1.5] text-ink6">{t("note")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
