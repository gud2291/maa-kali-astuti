"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { fmt } from "@/lib/core/format";
import { useCart, useCartTotals } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { cn } from "@/lib/utils/cn";
import type { CouponResult } from "@/types/cart";

export type CouponFieldProps = {
  disc?: number;
  initialOpen?: boolean;
  onApplied?: () => void;
  className?: string;
};

export function CouponField({ disc: propDisc, initialOpen = false, onApplied, className }: CouponFieldProps) {
  const t = useTranslations("drawer");
  const tc = useTranslations("cart.coupon");
  const applied = useCart((s) => s.coupon);
  const tot = useCartTotals();
  const disc = propDisc !== undefined ? propDisc : tot.disc;

  const [open, setOpen] = useState(initialOpen);
  const [code, setCode] = useState("");
  const [err, setErr] = useState<CouponResult | null>(null);
  const [pending, setPending] = useState(false);

  const msg = (r: CouponResult): string => {
    return tc(r.msg, {
      code: r.code ?? code.trim().toUpperCase(),
      off: r.off ?? "",
      min: r.min ?? "",
    });
  };

  const apply = async (withToast: boolean): Promise<void> => {
    if (pending) return;
    setPending(true);
    try {
      const r = await useCart.getState().applyCoupon(code);
      setErr(r.ok ? null : r);
      setOpen(!r.ok);
      if (r.ok) {
        if (withToast) {
          useUi.getState().toast({ msg: msg(r), tone: "ok" });
        }
        onApplied?.();
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={cn("pt-2.5 pb-5", className)}>
      {applied ? (
        <div className="flex h-11 items-center justify-between gap-2.5 rounded-btn bg-em1 px-3 font-sans text-[13px] leading-none font-semibold text-em7">
          <span className="flex items-center gap-2">
            <span className="block size-4">
              <Icon name="tag" />
            </span>
            {applied.code} · −{fmt(disc)}
          </span>
          <button
            type="button"
            onClick={() => useCart.getState().removeCoupon()}
            className="cursor-pointer border-0 bg-transparent font-sans text-[12px] leading-none font-semibold text-ink6 underline"
          >
            {t("couponRemove")}
          </button>
        </div>
      ) : open ? (
        <>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setErr(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !pending) void apply(false);
              }}
              disabled={pending}
              aria-label={t("couponAria")}
              aria-invalid={err ? true : undefined}
              aria-describedby={err ? "coupon-err" : undefined}
              placeholder={t("couponPh")}
              autoComplete="off"
              autoFocus
              className={cn(
                "h-11 min-w-0 flex-1 rounded-field border bg-cream px-3 font-sans text-[14px] leading-none font-semibold tracking-[.06em] text-ink uppercase outline-none focus:border-em5",
                err ? "border-sin" : "border-s2",
                pending && "opacity-60",
              )}
            />
            <button
              type="button"
              onClick={() => void apply(true)}
              disabled={pending}
              className="h-11 cursor-pointer rounded-btn border border-em7 bg-iv px-4 font-sans text-[13px] leading-none font-semibold text-em7 hover:bg-em1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "…" : t("apply")}
            </button>
          </div>
          {err && (
            <span
              id="coupon-err"
              role="alert"
              className="mt-2 flex items-center gap-1.5 font-sans text-[12.5px] leading-[1.3] font-medium text-sin"
            >
              <span className="block size-3.5">
                <Icon name="alert" />
              </span>
              {msg(err)}
            </span>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex cursor-pointer items-center gap-2 border-0 bg-transparent px-0 py-1 font-sans text-[13px] leading-none font-semibold text-em7"
        >
          <span className="block size-4">
            <Icon name="tag" />
          </span>
          {t("couponLink")}
        </button>
      )}
    </div>
  );
}
