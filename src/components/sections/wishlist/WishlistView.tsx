"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { ProductCard } from "@/components/commerce/ProductCard";
import { useWishlist } from "@/stores/wishlist";
import { useCatalog } from "@/stores/catalog";
import type { ProductLite } from "@/lib/domain/types";
import { routes } from "@/lib/routes";

export function WishlistView(): React.JSX.Element {
  const t = useTranslations("wishlistPage");
  const [mounted, setMounted] = useState(false);
  const ids = useWishlist((s) => s.ids);
  const snap = useCatalog((s) => s.snap);
  const status = useCatalog((s) => s.status);
  const load = useCatalog((s) => s.load);

  useEffect(() => {
    setMounted(true);
    if (status === "idle") {
      load();
    }
  }, [status, load]);

  const isLoading = !mounted || status === "idle" || status === "loading";

  const wishedProducts: ProductLite[] =
    mounted && snap
      ? ids
          .map((id) => snap.products.find((p) => p.id === id))
          .filter((p): p is ProductLite => !!p)
      : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between border-b border-s2 pb-5">
        <div>
          <span className="font-sans text-[11px] font-semibold tracking-widest text-g7 uppercase">
            {t("title")}
          </span>
          <h1 className="mt-1 font-title text-2xl font-bold text-em9 sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-xs text-ink6 sm:text-sm">
            {t("subtitle")}
          </p>
        </div>
        {mounted && wishedProducts.length > 0 && (
          <span className="font-sans text-xs font-semibold text-em7">
            {t("itemCount", { count: wishedProducts.length })}
          </span>
        )}
      </div>

      {/* Skeletons while loading */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3.5 animate-pulse">
              <div className="aspect-[4/5] w-full rounded-btn bg-s2" />
              <div className="h-3.5 w-1/3 rounded bg-s2" />
              <div className="h-5 w-3/4 rounded bg-s2" />
              <div className="h-4 w-1/2 rounded bg-s2" />
            </div>
          ))}
        </div>
      ) : wishedProducts.length === 0 ? (
        /* Empty State */
        <div className="my-12 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-cream text-g5 shadow-ring-sand">
            <Icon name="heart" className="size-8" />
          </div>
          <h2 className="font-title text-xl font-bold text-em9 sm:text-2xl">
            {t("emptyTitle")}
          </h2>
          <p className="mt-2 max-w-md text-xs text-ink6 sm:text-sm">
            {t("emptySubtitle")}
          </p>
          <Link
            href={routes.shop}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-em7 px-6 font-sans text-xs font-semibold tracking-wider text-iv shadow-md transition-colors hover:bg-em5"
          >
            <span>{t("exploreBestsellers")}</span>
            <Icon name="arrowR" className="size-3.5" />
          </Link>
        </div>
      ) : (
        /* Grid of ProductCards */
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {wishedProducts.map((p) => (
            <ProductCard key={p.id} product={p} mode="wish" />
          ))}
        </div>
      )}
    </div>
  );
}
