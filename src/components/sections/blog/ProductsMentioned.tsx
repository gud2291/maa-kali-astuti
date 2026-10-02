"use client";

import { useTranslations } from "next-intl";
import { ProductCard, type ProductCardData } from "@/components/commerce/ProductCard";

export type ProductsMentionedProps = {
  products: ProductCardData[];
};

export function ProductsMentioned({
  products,
}: ProductsMentionedProps): React.JSX.Element | null {
  const t = useTranslations("blog");

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="my-10 rounded-field border border-s2 bg-cream/30 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-s2/60 pb-3">
        <h3 className="font-display text-[18px] sm:text-[20px] font-normal text-em9 font-soft">
          {t("productsMentioned")}
        </h3>
        <span className="font-sans text-[11px] font-semibold tracking-wider uppercase text-g7">
          {products.length} {products.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            size="compact"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 100vw"
          />
        ))}
      </div>
    </section>
  );
}
