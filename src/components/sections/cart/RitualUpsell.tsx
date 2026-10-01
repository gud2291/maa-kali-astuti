"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { ProductImage } from "@/components/commerce/ProductImage";
import { flyToCart } from "@/components/commerce/fx";
import { fmt } from "@/lib/core/format";
import { productHref } from "@/lib/routes";
import { useCart, useCartLines } from "@/stores/cart";
import { useCatalog } from "@/stores/catalog";
import { useUi } from "@/stores/ui";
import type { ProductLite } from "@/lib/domain/types";

const UPSELL = ["havan", "r5", "b-rose", "a-child", "b-tourmaline"];

export function RitualUpsell() {
  const t = useTranslations("cartPage");
  const hi = useLocale() === "hi";
  const imgs = useRef<Record<string, HTMLSpanElement | null>>({});
  const byId = useCatalog((s) => s.byId);
  const lines = useCartLines();
  const inCart = lines.map((l) => l.pid);

  const items = UPSELL.filter((id) => !inCart.includes(id))
    .slice(0, 4)
    .map((id) => byId.get(id))
    .filter((p): p is ProductLite => !!p);

  if (!items.length) return null;

  const add = (p: ProductLite) => {
    if (p.sizes) {
      useUi.getState().openQuick(p.id);
      return;
    }
    useCart.getState().add(p.id);
    flyToCart(imgs.current[p.id] ?? null);
  };

  return (
    <div className="mt-8 rounded-btn border border-s2 bg-iv p-5 md:p-6">
      <div className="flex items-center gap-2">
        <span className="block size-4 text-g5">
          <Icon name="sparkles" />
        </span>
        <h2 className="m-0 font-title text-[18px] md:text-[20px] leading-tight font-normal text-em9">
          {t("upsellTitle")}
        </h2>
      </div>
      <p className="mt-1 font-sans text-[13px] leading-normal font-medium text-ink6">
        {t("upsellSub")}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => {
          const name = hi ? p.hi : p.name;
          return (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-field border border-s2 bg-cream p-3 transition-shadow hover:shadow-ring-sand"
            >
              <div className="flex gap-3">
                <Link
                  href={productHref(p)}
                  tabIndex={-1}
                  className="relative block h-[70px] w-[60px] flex-none overflow-hidden rounded-3 bg-s1"
                >
                  <span
                    ref={(el) => {
                      imgs.current[p.id] = el;
                    }}
                    className="absolute inset-0 block"
                  >
                    <ProductImage p={{ ...p, date: 0, pop: 0 }} sizes="60px" alt="" />
                  </span>
                </Link>
                <div className="flex min-w-0 flex-col">
                  <Link
                    href={productHref(p)}
                    className="line-clamp-2 font-title text-[14px] leading-[1.25] font-normal text-em9 hover:text-em7 no-underline"
                  >
                    {name}
                  </Link>
                  <span className="mt-1 font-sans text-[13px] leading-none font-bold text-ink tabular">
                    {fmt(p.price)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => add(p)}
                className="mt-3 flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-field border border-em7 bg-iv font-sans text-[12px] leading-none font-semibold text-em7 hover:bg-em1"
              >
                <span className="block size-3.5">
                  <Icon name="plus" />
                </span>
                {t("add")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
