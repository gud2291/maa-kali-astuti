"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { Icon } from "@/components/icons/Icon";
import { stockNote } from "@/lib/core/stock";
import { useFees } from "@/stores/catalog";
import { useCart, getCartCount } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { flyToCart } from "@/components/commerce/fx";
import { cn } from "@/lib/utils/cn";
import { EnergizationFields } from "./EnergizationFields";
import { PincodeCheck } from "./PincodeCheck";
import { SizeGuide } from "./SizeGuide";
import type { Product, WristSize } from "@/types/product";

type Props = {
  product: Product & { energizable?: boolean };
};

export function ProductInfo({ product }: Props) {
  const t = useTranslations("pdp");
  const tt = useTranslations("toast");
  const locale = useLocale();
  const hi = locale === "hi";
  const router = useRouter();
  const fees = useFees();

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<WristSize>(product.sizes?.[0] ?? "M");
  const [guideOpen, setGuideOpen] = useState(false);

  const [energEnabled, setEnergEnabled] = useState(false);
  const [energName, setEnergName] = useState("");
  const [energGotra, setEnergGotra] = useState("");

  const [phase, setPhase] = useState<"idle" | "loading" | "added">("idle");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const oos = product.stock === 0;
  const sn = stockNote(product, hi);
  const energFee = fees.energizationInr || 251;

  const buildEnerg = () => {
    if (!energEnabled) return null;
    return {
      name: energName.trim() || (hi ? "स्वयं" : "Self"),
      gotra: energGotra.trim() || "Kashyap",
    };
  };

  const handleAddToCart = () => {
    if (oos || phase !== "idle") return;

    setPhase("loading");
    setTimeout(() => {
      const variant = product.sizes ? size : null;
      const energ = buildEnerg();

      useCart.getState().add(product.id, {
        variant,
        qty,
        energ,
      });

      flyToCart(buttonRef.current);

      const ui = useUi.getState();
      const displayName = hi ? product.hi : product.name;
      ui.toast({
        msg: tt("added", { name: displayName }),
        tone: "ok",
        action: { kind: "cart", label: tt("viewCart") },
      });

      if (getCartCount() === 1) {
        ui.openCart();
      }

      setPhase("added");
      setTimeout(() => setPhase("idle"), 1500);
    }, 380);
  };

  const handleBuyNow = () => {
    if (oos) return;
    const variant = product.sizes ? size : null;
    const energ = buildEnerg();

    useCart.getState().add(product.id, {
      variant,
      qty,
      energ,
    });

    router.push("/checkout");
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({
        title: product.name,
        text: hi ? product.hi : product.name,
        url: window.location.href,
      });
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href);
      useUi.getState().toast({ msg: t("linkCopied"), tone: "ok" });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Badges row */}
      {product.badges && product.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.badges.map((b) => (
            <Badge key={b} k={b} hi={hi} />
          ))}
        </div>
      )}

      {/* Title & Hindi line */}
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-title text-[clamp(24px,2.6vw,34px)] leading-[1.2] font-normal text-em9">
          {product.name}
        </h1>
        {product.hi && (
          <p className="m-0 font-deva text-[18px] leading-[1.35] text-g7">
            {product.hi}
          </p>
        )}
      </div>

      {/* Rating & reviews */}
      <div className="flex items-center gap-3">
        <a href="#reviews" className="no-underline hover:opacity-80 transition-opacity">
          <Rating rating={product.rating} reviews={product.reviews} hi={hi} />
        </a>
      </div>

      {/* Price block */}
      <div className="flex flex-col gap-1 border-y border-s2 py-3.5">
        <div className="flex items-baseline gap-3">
          <Price price={product.price} mrp={product.mrp} hi={hi} size="row" className="text-[24px]" />
        </div>
        <span className="font-sans text-[12px] text-ink6">
          {t("inclTaxes")}
        </span>
      </div>

      {/* Stock warning */}
      {sn && (
        <div
          className={cn(
            "flex items-center gap-1.5 font-sans text-[13px] font-semibold",
            oos ? "text-sin" : "text-amber-700",
          )}
        >
          <Icon name={oos ? "alert" : "clock"} className="size-4" />
          <span>{sn}</span>
        </div>
      )}

      {/* Size picker (for bracelets) */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[13px] font-semibold tracking-wide text-em9 uppercase">
              {t("sizeLabel")}: <span className="font-bold text-g7">{size}</span>
            </span>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 font-sans text-[12.5px] font-semibold text-em7 hover:text-em5"
            >
              <Icon name="ruler" className="size-3.5" />
              <span>{t("sizeGuide")}</span>
            </button>
          </div>

          <div className="flex gap-2">
            {product.sizes.map((s) => {
              const on = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={cn(
                    "flex h-11 w-14 cursor-pointer items-center justify-center rounded-btn border text-[14px] font-bold transition-all",
                    on
                      ? "border-em7 bg-em7 text-iv shadow-ring-gold"
                      : "border-s2 bg-cream text-em9 hover:bg-s1",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>

          <SizeGuide open={guideOpen} onOpenChange={setGuideOpen} />
        </div>
      )}

      {/* Energization add-on */}
      {product.energizable !== false && (
        <EnergizationFields
          enabled={energEnabled}
          onToggle={setEnergEnabled}
          name={energName}
          onNameChange={setEnergName}
          gotra={energGotra}
          onGotraChange={setEnergGotra}
          fee={energFee}
        />
      )}

      {/* Quantity & Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <QtyStepper
            value={qty}
            onChange={setQty}
            min={1}
            max={Math.max(1, Math.min(fees.maxLineQty || 10, product.stock))}
            labels={{ dec: "Decrease quantity", inc: "Increase quantity" }}
          />

          {/* Add to cart button */}
          <button
            id="pdp-main-add-button"
            ref={buttonRef}
            type="button"
            disabled={oos || phase === "loading"}
            onClick={handleAddToCart}
            className={cn(
              "flex-1 flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-btn font-sans text-[15px] font-semibold tracking-wide transition-all select-none border-0",
              phase === "added"
                ? "bg-ok text-iv shadow-ring-gold"
                : "bg-em7 text-iv shadow-ring-gold hover:bg-em5",
              oos && "opacity-50 cursor-not-allowed",
            )}
          >
            <Icon name={phase === "added" ? "check" : "bag"} className="size-5" />
            <span>
              {oos ? t("stockOut") : phase === "loading" ? t("adding") : phase === "added" ? t("added") : t("addToCart")}
            </span>
          </button>
        </div>

        {/* Buy now button */}
        {!oos && (
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-btn border border-g5 bg-g3 font-sans text-[15px] font-bold text-n9 transition-transform duration-150 hover:-translate-y-px hover:bg-g4 select-none"
          >
            <Icon name="bolt" className="size-4" />
            <span>{t("buyNow")}</span>
          </button>
        )}
      </div>

      {/* Delivery pincode checker */}
      <PincodeCheck />

      {/* Trust row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-btn bg-s1/60 p-3 border border-s2/60 text-center">
        <div className="flex flex-col items-center gap-1">
          <Icon name="shield" className="size-4 text-em7" />
          <span className="font-sans text-[11px] leading-[1.3] font-medium text-ink6">{t("trustSecure")}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon name="returns" className="size-4 text-em7" />
          <span className="font-sans text-[11px] leading-[1.3] font-medium text-ink6">{t("trustReturn")}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon name="cash" className="size-4 text-em7" />
          <span className="font-sans text-[11px] leading-[1.3] font-medium text-ink6">{t("trustCod")}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon name="truck" className="size-4 text-em7" />
          <span className="font-sans text-[11px] leading-[1.3] font-medium text-ink6">{t("trustShipping")}</span>
        </div>
      </div>

      {/* Share button */}
      <button
        type="button"
        onClick={handleShare}
        aria-label={t("shareAria")}
        className="flex cursor-pointer items-center gap-2 self-start border-0 bg-transparent p-1 font-sans text-[13px] font-semibold text-em7 hover:text-em5"
      >
        <Icon name="share" className="size-4" />
        <span>{t("share")}</span>
      </button>
    </div>
  );
}
