"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart, useCartLines } from "@/stores/cart";
import { useFees } from "@/stores/catalog";
import { useCheckout } from "./useCheckout";
import { placeOrderAction } from "@/server/orders/actions";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { Icon } from "@/components/icons/Icon";
import { fmt } from "@/lib/core/format";
import { routes } from "@/lib/routes";
import { ProductImage } from "@/components/commerce/ProductImage";
import { ErrorRow } from "@/components/sections/booking/ui";
import { Link } from "@/i18n/navigation";
import type { Quote } from "@/server/cart/quote";

export function StepReview({
  quote,
  refetchQuote,
  onGoToStep,
  onBack,
}: {
  quote: Quote | null;
  refetchQuote: () => Promise<void>;
  onGoToStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  onBack: () => void;
}) {
  const t = useTranslations("checkout");
  const locale = (useLocale() === "hi" ? "hi" : "en") as "en" | "hi";
  const router = useRouter();

  const lines = useCartLines();
  const coupon = useCart((s) => s.coupon);
  const fees = useFees();
  const {
    contact,
    address,
    delivery,
    method,
    payPref,
    gift,
    setGift,
    giftMessage,
    setGiftMessage,
    note,
    setNote,
    draftToken,
  } = useCheckout();

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const hasStockIssues = (quote?.issues && quote.issues.length > 0) || false;
  const isBlocked = hasStockIssues || (quote && !quote.codAllowed);

  const handlePlaceOrder = async () => {
    if (placing || isBlocked) return;
    setPlacing(true);
    setGeneralError(null);

    try {
      const input = {
        locale,
        lines: lines.map((l) => ({
          pid: l.pid,
          qty: l.qty,
          variant: l.variant ?? null,
          energ: l.energ ?? null,
        })),
        contact,
        address,
        delivery,
        method,
        payPref,
        gift,
        giftMessage: gift && giftMessage ? giftMessage.trim() : null,
        note: note ? note.trim() : null,
        couponCode: coupon?.code ?? null,
        draftToken,
        turnstileToken: turnstileToken || undefined,
      };

      const res = await placeOrderAction(input);

      if (res.ok) {
        useCart.getState().clear();
        useCheckout.getState().reset();
        router.replace(
          `${routes.orderSuccess}?no=${encodeURIComponent(res.data.number)}&k=${encodeURIComponent(res.data.accessKey)}`,
        );
      } else {
        if (res.error === "OUT_OF_STOCK") {
          await refetchQuote();
          setGeneralError(t("errors.OUT_OF_STOCK"));
        } else {
          const errMap: Record<string, string> = {
            CART_EMPTY: t("errors.CART_EMPTY"),
            COUPON_INVALID: t("errors.COUPON_INVALID"),
            RATE_LIMITED: t("errors.RATE_LIMITED"),
            TURNSTILE_FAILED: t("errors.TURNSTILE_FAILED"),
            NOT_CONFIGURED: t("errors.NOT_CONFIGURED"),
          };
          setGeneralError(errMap[res.error] ?? res.error);
        }
      }
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : t("errors.GENERIC"));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="m-0 font-title text-[22px] leading-tight font-normal text-em9">
          {t("reviewTitle")}
        </h2>
        <p className="mt-1 font-sans text-[13px] leading-normal font-medium text-ink6">
          {t("reviewSub")}
        </p>
      </div>

      {/* Stock warning banner if any */}
      {hasStockIssues && (
        <div className="flex flex-col gap-2 rounded-btn border border-sin/30 bg-sin/5 p-4 text-sin">
          <div className="flex items-center gap-2 font-sans text-[14px] font-bold">
            <Icon name="alert" className="size-4 flex-none" />
            <span>{t("stockIssueTitle")}</span>
          </div>
          <p className="m-0 font-sans text-[13px] leading-relaxed text-ink6">
            {t("stockIssueDesc")}
          </p>
          <div className="mt-1">
            <Link
              href={routes.cart}
              className="inline-flex h-9 items-center justify-center rounded-btn bg-sin px-4 font-sans text-[13px] font-semibold text-iv no-underline hover:opacity-90"
            >
              {t("updateCart")}
            </Link>
          </div>
        </div>
      )}

      {/* General error message */}
      {generalError && (
        <div className="rounded-btn border border-sin/40 bg-cream p-3.5">
          <ErrorRow>{generalError}</ErrorRow>
        </div>
      )}

      {/* Review details sections */}
      <div className="flex flex-col divide-y divide-s2 rounded-btn border border-s2 bg-cream">
        {/* Contact */}
        <div className="flex items-start justify-between p-4">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[12px] font-bold uppercase tracking-wider text-g7">
              {t("reviewContact")}
            </span>
            <span className="font-sans text-[14px] font-semibold text-ink">{contact.name}</span>
            <span className="font-sans text-[13px] text-ink6">
              +91 {contact.phone} · {contact.email}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(1)}
            className="cursor-pointer border-0 bg-transparent font-sans text-[13px] font-semibold text-em7 hover:underline"
          >
            {t("edit")}
          </button>
        </div>

        {/* Address */}
        <div className="flex items-start justify-between p-4">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[12px] font-bold uppercase tracking-wider text-g7">
              {t("reviewAddress")}
            </span>
            <span className="font-sans text-[14px] leading-snug text-ink">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              {address.landmark ? ` (Near ${address.landmark})` : ""}
            </span>
            <span className="font-sans text-[13px] text-ink6">
              {address.city}, {address.state} — {address.pincode}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(2)}
            className="cursor-pointer border-0 bg-transparent font-sans text-[13px] font-semibold text-em7 hover:underline"
          >
            {t("edit")}
          </button>
        </div>

        {/* Delivery */}
        <div className="flex items-start justify-between p-4">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[12px] font-bold uppercase tracking-wider text-g7">
              {t("reviewDelivery")}
            </span>
            <span className="font-sans text-[14px] font-semibold text-ink">
              {delivery === "express" ? t("expressDelivery") : t("standardDelivery")}
            </span>
            <span className="font-sans text-[13px] text-ink6">
              {delivery === "express" ? t("expressDaysDefault") : t("standardDaysDefault")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(3)}
            className="cursor-pointer border-0 bg-transparent font-sans text-[13px] font-semibold text-em7 hover:underline"
          >
            {t("edit")}
          </button>
        </div>

        {/* Payment */}
        <div className="flex items-start justify-between p-4">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[12px] font-bold uppercase tracking-wider text-g7">
              {t("reviewPayment")}
            </span>
            <span className="font-sans text-[14px] font-semibold text-ink">
              {t("cashOnDelivery")}
            </span>
            <span className="font-sans text-[13px] text-ink6">
              {t("payUponDelivery")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(4)}
            className="cursor-pointer border-0 bg-transparent font-sans text-[13px] font-semibold text-em7 hover:underline"
          >
            {t("edit")}
          </button>
        </div>
      </div>

      {/* Gift Wrap Toggle & Message */}
      <div className="rounded-btn border border-s2 bg-cream p-4">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={gift}
              onChange={(e) => setGift(e.target.checked)}
              className="size-4.5 rounded text-em7 accent-em7 cursor-pointer"
            />
            <div className="flex items-center gap-2">
              <span className="block size-4 text-g5">
                <Icon name="sparkles" />
              </span>
              <span className="font-sans text-[14px] font-semibold text-ink">
                {t("giftWrapOption")}
              </span>
            </div>
          </div>
          <span className="font-sans text-[13.5px] font-bold text-ink tabular">
            +{fmt(fees.giftWrapInr)}
          </span>
        </label>

        {gift && (
          <div className="mt-3 pl-7">
            <textarea
              maxLength={200}
              rows={2}
              value={giftMessage || ""}
              onChange={(e) => setGiftMessage(e.target.value)}
              placeholder={t("giftMessagePlaceholder")}
              className="w-full rounded-field border border-s2 bg-iv p-2.5 font-sans text-[13px] text-ink outline-none focus:border-em5"
            />
            <span className="mt-0.5 block text-right font-sans text-[11px] text-ink6">
              {(giftMessage || "").length}/200
            </span>
          </div>
        )}
      </div>

      {/* Order note */}
      <div className="rounded-btn border border-s2 bg-cream p-4">
        <label htmlFor="chk-order-note" className="block font-sans text-[13px] font-semibold text-ink">
          {t("orderNote")}
        </label>
        <textarea
          id="chk-order-note"
          maxLength={300}
          rows={2}
          value={note || ""}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("orderNotePlaceholder")}
          className="mt-2 w-full rounded-field border border-s2 bg-iv p-2.5 font-sans text-[13px] text-ink outline-none focus:border-em5"
        />
      </div>

      {/* Read-only items list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="m-0 font-sans text-[14px] font-bold uppercase tracking-wider text-g7">
            {t("itemsInOrder")} ({lines.length})
          </h3>
          <Link
            href={routes.cart}
            className="font-sans text-[13px] font-semibold text-em7 hover:underline no-underline"
          >
            {t("editCart")}
          </Link>
        </div>

        <div className="divide-y divide-s2 rounded-btn border border-s2 bg-cream px-4">
          {lines.map((l) => {
            const name = locale === "hi" ? l.p.hi : l.p.name;
            const energFee = l.energ ? fees.energizationInr : 0;
            const linePrice = (l.p.price + energFee) * l.qty;

            return (
              <div key={l.key} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative size-12 flex-none overflow-hidden rounded bg-s1">
                    <ProductImage p={{ ...l.p, date: 0, pop: 0 }} sizes="48px" alt="" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title text-[14px] font-normal text-em9">{name}</span>
                    <span className="font-sans text-[12px] text-ink6">
                      Qty: {l.qty} {l.variant ? `· Size ${l.variant}` : ""}
                    </span>
                    {l.energ && (
                      <span className="font-sans text-[11px] text-g7">
                        {t("energizedFor", { name: l.energ.name })}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-sans text-[14px] font-bold text-ink tabular">
                  {fmt(linePrice)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Turnstile verification widget */}
      <div className="flex justify-center py-1">
        <TurnstileWidget action="order" onToken={(tok) => setTurnstileToken(tok)} />
      </div>

      {/* Place order CTA */}
      <div className="mt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={placing}
          className="flex h-[52px] items-center gap-1.5 rounded-btn px-4 font-sans text-[14px] font-semibold text-em7 hover:bg-em1 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span className="block size-4">
            <Icon name="arrowL" />
          </span>
          {t("back")}
        </button>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={placing || isBlocked}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-btn bg-em7 sheen font-sans text-[15px] leading-none font-semibold tracking-[.03em] text-iv shadow-ring-gold hover:bg-em9 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {placing ? (
            <span>{t("placingOrder")}</span>
          ) : (
            <>
              <Icon name="lock" className="size-4" />
              <span>
                {t("placeOrderCta", { amount: fmt(quote?.totals.total ?? 0) })}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
