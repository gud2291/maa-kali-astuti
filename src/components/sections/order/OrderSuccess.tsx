"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { OrderView } from "@/server/orders/queries";
import type { Locale } from "@/lib/domain/enums";
import { fmt } from "@/lib/core/format";
import { waLink } from "@/lib/core/commerce";
import { formatIst } from "@/lib/core/ist";
import { OrderTimeline } from "./OrderTimeline";
import { PayNow } from "./PayNow";
import { Icon } from "@/components/icons/Icon";
import { Price } from "@/components/ui/Price";

export function OrderSuccess({
  order,
  locale = "en",
  accessKey,
}: {
  order: OrderView;
  locale?: Locale;
  accessKey?: string;
}): React.JSX.Element {
  const t = useTranslations("order");
  const searchParams = useSearchParams();
  const effectiveKey = accessKey || searchParams?.get("k") || "";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(order.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPending = order.status === "pending_payment";
  const formattedEnergDate = order.energizationOn
    ? formatIst(new Date(order.energizationOn), { locale: locale === "hi" ? "hi" : "en", weekday: true })
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Scoped Keyframes for Gold Circle and Checkmark Draw Animation */}
      <style>{`
        @keyframes drawSuccessCircle {
          from { stroke-dashoffset: 230; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawSuccessCheck {
          from { stroke-dashoffset: 50; }
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .animate-draw-circle {
            stroke-dasharray: 230;
            stroke-dashoffset: 230;
            animation: drawSuccessCircle 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-draw-check {
            stroke-dasharray: 50;
            stroke-dashoffset: 50;
            animation: drawSuccessCheck 0.4s 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        }
      `}</style>

      {/* Top Banner / Celebration */}
      <div className="text-center">
        <div className="relative mx-auto mb-4 size-20 sm:size-24">
          <svg
            className="size-full text-g5"
            viewBox="0 0 80 80"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="2.5"
              className="animate-draw-circle"
            />
            <path
              d="M25 41L35 51L55 31"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-draw-check"
            />
          </svg>
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight text-em9 sm:text-3xl lg:text-4xl">
          {isPending ? t("pendingPayment") : t("confirmed")}
        </h1>

        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="font-sans text-sm text-ink6">{t("orderNumber")}:</span>
          <span className="font-mono text-sm font-bold text-ink sm:text-base">
            {order.number}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded p-1 text-ink6 transition hover:bg-s2 hover:text-ink focus:outline-none focus:ring-1 focus:ring-g5"
            title="Copy order number"
            aria-label="Copy order number"
          >
            <Icon name={copied ? "check" : "share"} className="size-4" />
          </button>
        </div>

        {/* Payment Pending Banner + Pay Now */}
        {isPending && effectiveKey && (
          <div className="mx-auto mt-6 max-w-md rounded-btn border border-g5/40 bg-s1/60 p-5 text-center shadow-sm sm:p-6">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-pill bg-em1 text-em9">
              <Icon name="card" className="size-6 text-em7" />
            </div>
            <h2 className="font-sans text-base font-bold text-em9">
              {t("paymentPending")}
            </h2>
            <p className="mt-1 mb-4 font-sans text-xs leading-relaxed text-ink6 sm:text-sm">
              {t("paymentPendingDesc")}
            </p>
            <PayNow number={order.number} accessKey={effectiveKey} />
          </div>
        )}

        {/* Energization Notice */}
        {formattedEnergDate && (
          <div className="mx-auto mt-4 max-w-lg rounded-field border border-g5/30 bg-g1/25 p-3 text-center sm:p-4">
            <div className="flex items-center justify-center gap-1.5 text-g7">
              <Icon name="bolt" className="size-4 shrink-0 text-g5" />
              <p className="font-sans text-xs font-semibold leading-relaxed sm:text-sm">
                {t("energizationNotice", { date: formattedEnergDate })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Order Timeline */}
      <div className="mt-8 rounded-field border border-s2 bg-cream p-4 shadow-sm sm:mt-10 sm:p-6">
        <OrderTimeline status={order.status} locale={locale} />
      </div>

      {/* Main Grid: Details + Summary */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Items, Address, Payment Info (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Items Card */}
          <div className="rounded-field border border-s2 bg-cream p-5 shadow-sm sm:p-6">
            <h2 className="font-sans text-base font-bold text-ink sm:text-lg">
              {t("items")}
            </h2>
            <div className="mt-4 divide-y divide-s2">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="size-16 shrink-0 overflow-hidden rounded-field border border-s2 bg-iv sm:size-20">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name[locale] ?? item.name.en}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-g5/50">
                        <Icon name="bag" className="size-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-sans text-sm font-bold text-ink hover:text-em7 hover:underline sm:text-base"
                      >
                        {item.name[locale] ?? item.name.en}
                      </Link>
                      {item.variant && (
                        <p className="font-sans text-xs text-ink6">
                          Size: {item.variant}
                        </p>
                      )}
                      {item.energName && (
                        <p className="mt-0.5 font-sans text-xs text-g7">
                          Sankalp: {item.energName} ({item.energGotra || "Kashyap"})
                        </p>
                      )}
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="font-sans text-xs text-ink6 sm:text-sm">
                        {t("qty")}: {item.qty} × {fmt(item.priceInr)}
                      </span>
                      <Price price={item.lineTotalInr} mrp={item.mrpInr * item.qty} hi={locale === "hi"} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Card */}
          <div className="grid grid-cols-1 gap-6 rounded-field border border-s2 bg-cream p-5 shadow-sm sm:grid-cols-2 sm:p-6">
            <div>
              <h3 className="flex items-center gap-1.5 font-sans text-sm font-bold text-ink">
                <Icon name="pin" className="size-4 text-g5" />
                {t("address")}
              </h3>
              <p className="mt-2 font-sans text-xs leading-relaxed text-ink6 sm:text-sm">
                <span className="font-semibold text-ink">{order.address.name}</span><br />
                {order.address.line1}<br />
                {order.address.line2 && <>{order.address.line2}<br /></>}
                {order.address.landmark && <>{order.address.landmark}, </>}
                {order.address.city}, {order.address.state} — {order.address.pincode}<br />
                Phone: {order.address.phone}
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-1.5 font-sans text-sm font-bold text-ink">
                <Icon name="card" className="size-4 text-g5" />
                {t("payment")}
              </h3>
              <p className="mt-2 font-sans text-xs leading-relaxed text-ink6 sm:text-sm">
                <span className="font-semibold text-ink">
                  {order.paymentMethod === "cod" ? t("cod") : t("online")}
                </span>
                <br />
                Status: <span className="uppercase text-em7">{order.paymentStatus}</span>
                {order.invoiceNo && (
                  <>
                    <br />
                    Invoice: <span className="font-mono text-ink">{order.invoiceNo}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Actions (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-field border border-s2 bg-cream p-5 shadow-sm sm:p-6">
            <h2 className="font-sans text-base font-bold text-ink sm:text-lg">
              {t("summary")}
            </h2>

            <div className="mt-4 space-y-2.5 font-sans text-xs sm:text-sm">
              <div className="flex justify-between text-ink6">
                <span>{t("subtotal")}</span>
                <span className="text-ink">{fmt(order.totals.items)}</span>
              </div>

              {order.totals.energ > 0 && (
                <div className="flex justify-between text-ink6">
                  <span>{t("energization")}</span>
                  <span className="text-ink">{fmt(order.totals.energ)}</span>
                </div>
              )}

              {order.totals.discount > 0 && (
                <div className="flex justify-between text-sin">
                  <span>{t("discount")}</span>
                  <span>−{fmt(order.totals.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-ink6">
                <span>{order.totals.express > 0 ? t("express") : t("shipping")}</span>
                <span className="text-ink">
                  {order.totals.shipping === 0 && order.totals.express === 0
                    ? t("free")
                    : fmt(order.totals.shipping + order.totals.express)}
                </span>
              </div>

              {order.totals.cod > 0 && (
                <div className="flex justify-between text-ink6">
                  <span>{t("codFee")}</span>
                  <span className="text-ink">{fmt(order.totals.cod)}</span>
                </div>
              )}

              <div className="border-t border-s2 pt-3">
                <div className="flex justify-between font-sans text-base font-bold text-ink sm:text-lg">
                  <span>{t("total")}</span>
                  <span className="text-em7">{fmt(order.totals.total)}</span>
                </div>
              </div>
            </div>

            {/* WhatsApp Updates Button */}
            <div className="mt-6">
              <a
                href={waLink(`Namaste, I want to track my order ${order.number}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-btn bg-em7 px-4 py-3 font-sans text-sm font-semibold text-iv shadow-sm transition hover:bg-em5 focus:outline-none focus:ring-2 focus:ring-g5 focus:ring-offset-2"
              >
                <Icon name="whatsapp" className="size-4 shrink-0 text-g3" />
                {t("whatsapp")}
              </a>
            </div>

            {/* Download Invoice Link if exists */}
            {order.invoiceNo && (
              <div className="mt-3 text-center">
                <Link
                  href={`/invoice/${order.number}${effectiveKey ? `?k=${encodeURIComponent(effectiveKey)}` : ""}`}
                  className="font-sans text-xs text-em7 underline hover:text-em9"
                >
                  {t("viewInvoice")} ({order.invoiceNo})
                </Link>
              </div>
            )}
          </div>

          {/* While you wait banner */}
          <div className="rounded-field border border-g5/30 bg-iv p-5 text-center shadow-sm sm:p-6">
            <h3 className="font-display text-lg font-bold text-em9 sm:text-xl">
              {t("whileYouWait")}
            </h3>
            <p className="mt-2 font-sans text-xs leading-relaxed text-ink6 sm:text-sm">
              {t("consultationRecommendation")}
            </p>
            <div className="mt-4">
              <Link
                href="/consult"
                className="inline-flex items-center gap-1.5 rounded-btn border border-g5 bg-cream px-4 py-2 font-sans text-xs font-semibold text-em9 shadow-sm transition hover:bg-g1/30 sm:text-sm"
              >
                {t("exploreConsultations")}
                <Icon name="arrowR" className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
