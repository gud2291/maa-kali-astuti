"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useHistory } from "@/stores/history";
import { useCatalog } from "@/stores/catalog";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/commerce/ProductCard";
import type { Product } from "@/types/product";

type Props = {
  currentProductId: string;
};

export function RecentlyViewed({ currentProductId }: Props) {
  const t = useTranslations("pdp");
  const recentIds = useHistory((s) => s.recent);
  const byId = useCatalog((s) => s.byId);
  const snap = useCatalog((s) => s.snap);
  const status = useCatalog((s) => s.status);

  useEffect(() => {
    if (status === "idle") {
      void useCatalog.getState().load();
    }
  }, [status]);

  const products: Product[] = useMemo(() => {
    const list: Product[] = [];
    const filteredIds = recentIds.filter((id) => id !== currentProductId);

    for (const id of filteredIds) {
      const lite = byId.get(id);
      if (!lite) continue;

      const catObj = snap?.categories.find((c) => c.key === lite.cat);
      const prod: Product = {
        ...lite,
        catName: catObj?.name.en || "",
        catShort: catObj?.short.en || "",
        date: 0,
        pop: (lite.reviews || 0) * (lite.rating || 0),
      };
      list.push(prod);
    }

    return list;
  }, [recentIds, currentProductId, byId, snap]);

  if (products.length === 0) return null;

  return (
    <section className="flex flex-col gap-6 py-6 border-t border-s2">
      <SectionHeader title={t("recentTitle")} size="sm" />

      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3">
        {products.map((p) => (
          <div key={p.id} className="w-[260px] md:w-[280px] flex-none snap-start">
            <ProductCard product={p} size="std" />
          </div>
        ))}
      </div>
    </section>
  );
}
