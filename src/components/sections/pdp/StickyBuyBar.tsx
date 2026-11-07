"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Price } from "@/components/ui/Price";
import { ProductImage } from "@/components/commerce/ProductImage";
import { MediaImg } from "@/components/media/MediaImg";
import { Icon } from "@/components/icons/Icon";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
  targetId?: string;
};

export function StickyBuyBar({ product, targetId = product.buyUrl ? "pdp-flipkart-button" : "pdp-main-add-button" }: Props) {
  const t = useTranslations("pdp");
  const tt = useTranslations("toast");
  const locale = useLocale();
  const hi = locale === "hi";
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"idle" | "loading" | "added">("idle");
  const reduced = isReduced();

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Appears when the main Add-to-cart button leaves the viewport (scrolled past it)
        const scrolledPast = entry.boundingClientRect.top < 0 && !entry.isIntersecting;
        setVisible(scrolledPast);
      },
      { threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  const external = !!product.buyUrl;
  const oos = product.stock === 0 && !external;

  const handleAdd = () => {
    if (oos || phase !== "idle") return;

    if (product.sizes && product.sizes.length > 0) {
      useUi.getState().openQuick(product.id);
      return;
    }

    setPhase("loading");
    setTimeout(() => {
      useCart.getState().add(product.id, { variant: null });
      const ui = useUi.getState();
      const displayName = hi ? product.hi : product.name;
      ui.toast({
        msg: tt("added", { name: displayName }),
        tone: "ok",
        action: { kind: "cart", label: tt("viewCart") },
      });
      setPhase("added");
      setTimeout(() => setPhase("idle"), 1500);
    }, 350);
  };

  if (!visible) return null;

  return (
    <>
      {/* Desktop Bar: Top sticky (≥ 768px) */}
      <div
        className={cn(
          "hidden md:block fixed top-0 inset-x-0 z-40 bg-iv/95 backdrop-blur-md border-b border-s2 px-6 py-2.5 shadow-[0_4px_20px_rgba(10,31,26,.08)]",
          !reduced && "animate-in slide-in-from-top duration-200",
        )}
      >
        <div className="mx-auto max-w-[1480px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative aspect-[4/5] w-10 flex-none overflow-hidden rounded-[3px] bg-s1">
              {product.images && product.images.length > 0 ? (
                <MediaImg media={product.images[0]} sizes="40px" alt={product.name} fill className="object-cover" />
              ) : (
                <ProductImage p={product} slot="main" sizes="40px" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title text-[15px] leading-tight text-em9 truncate">
                {product.name}
              </span>
              {!external && <Price price={product.price} mrp={product.mrp} hi={hi} size="card" />}
            </div>
          </div>

          {external ? (
            <a
              href={product.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 px-5 text-[14px] items-center justify-center gap-2 rounded-btn bg-em7 font-sans font-semibold text-iv no-underline shadow-ring-gold transition-colors hover:bg-em5 hover:text-iv"
            >
              <span>{t("buyFlipkart")}</span>
              <Icon name="arrowR" className="size-4" />
            </a>
          ) : (
            <button
              type="button"
              disabled={oos || phase === "loading"}
              onClick={handleAdd}
              className={cn(
                "flex h-10 px-5 cursor-pointer items-center justify-center gap-2 rounded-btn font-sans text-[14px] font-semibold transition-all select-none border-0",
                phase === "added"
                  ? "bg-ok text-iv shadow-ring-gold"
                  : "bg-em7 text-iv shadow-ring-gold hover:bg-em5",
                oos && "opacity-50 cursor-not-allowed",
              )}
            >
              <Icon name={phase === "added" ? "check" : "bag"} className="size-4" />
              <span>
                {oos ? t("stockOut") : phase === "loading" ? t("adding") : phase === "added" ? t("added") : t("stickyAdd")}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bar: Bottom sticky (< 768px, safe-area aware) */}
      <div
        className={cn(
          "md:hidden fixed bottom-0 inset-x-0 z-50 bg-iv/95 backdrop-blur-md border-t border-s2 px-4 py-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgba(10,31,26,.12)]",
          !reduced && "animate-in slide-in-from-bottom duration-200",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative aspect-[4/5] w-9 flex-none overflow-hidden rounded-[3px] bg-s1">
              {product.images && product.images.length > 0 ? (
                <MediaImg media={product.images[0]} sizes="36px" alt={product.name} fill className="object-cover" />
              ) : (
                <ProductImage p={product} slot="main" sizes="36px" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title text-[14px] leading-tight text-em9 truncate">
                {product.name}
              </span>
              {!external && <Price price={product.price} mrp={product.mrp} hi={hi} size="card" />}
            </div>
          </div>

          {external ? (
            <a
              href={product.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 px-4 text-[13.5px] flex-none items-center justify-center gap-2 rounded-btn bg-em7 font-sans font-semibold text-iv no-underline shadow-ring-gold transition-colors hover:bg-em5 hover:text-iv"
            >
              <span>{t("buyFlipkart")}</span>
              <Icon name="arrowR" className="size-4" />
            </a>
          ) : (
            <button
              type="button"
              disabled={oos || phase === "loading"}
              onClick={handleAdd}
              className={cn(
                "flex h-10 px-4 cursor-pointer items-center justify-center gap-1.5 rounded-btn font-sans text-[13.5px] font-semibold transition-all select-none border-0 flex-none",
                phase === "added"
                  ? "bg-ok text-iv shadow-ring-gold"
                  : "bg-em7 text-iv shadow-ring-gold hover:bg-em5",
                oos && "opacity-50 cursor-not-allowed",
              )}
            >
              <Icon name={phase === "added" ? "check" : "bag"} className="size-4" />
              <span>
                {oos ? t("stockOut") : phase === "loading" ? t("adding") : phase === "added" ? t("added") : t("stickyAdd")}
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
