"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { OrderTimeline } from "@/components/sections/order/OrderTimeline";
import { loc } from "@/lib/domain/loc";
import { formatIst } from "@/lib/core/ist";
import type { OrderTrackingView } from "@/server/orders/queries";
import type { Locale } from "@/lib/domain/enums";

type Props = {
  order: OrderTrackingView;
  onReset: () => void;
};

export function TrackResult({ order, onReset }: Props): React.JSX.Element {
  const t = useTranslations("track");
  const locale = useLocale() as Locale;

  return (
    <div className="flex flex-col gap-6">
      {/* Header with order number & location */}
      <div className="rounded-btn border border-s2 bg-cream p-5 md:p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-sans text-[11px] font-semibold tracking-wider text-g7 uppercase">
              {t("orderStatus")}
            </span>
            <h2 className="font-title text-2xl font-bold text-em9 sm:text-3xl">
              {order.number}
            </h2>
          </div>
          {(order.city || order.state) && (
            <div className="flex items-center gap-1.5 text-xs text-ink6">
              <Icon name="pin" className="size-4 text-g5" />
              <span>
                {t("deliveryTo")}:{" "}
                <strong className="font-medium text-ink">
                  {[order.city, order.state].filter(Boolean).join(", ")}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Energization notice */}
        {order.energizationOn && (order.status === "placed" || order.status === "energizing") && (
          <div className="mt-4 flex items-center gap-2.5 rounded-field border border-g5/30 bg-g1/40 px-3.5 py-2.5 text-xs text-em9">
            <span className="flex size-6 flex-none items-center justify-center rounded-full bg-em7 text-iv">
              <Icon name="bolt" className="size-3.5" />
            </span>
            <span>
              {t("energizationNote", { date: order.energizationOn })}
            </span>
          </div>
        )}

        {/* Timeline */}
        <div className="mt-6 border-t border-s2 pt-4">
          <OrderTimeline status={order.status} locale={locale} />
        </div>

        {/* Courier tracking info */}
        {(order.courier || order.awb || order.trackingUrl) && (
          <div className="mt-4 flex flex-col gap-3 rounded-field border border-s2 bg-iv p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-9 flex-none items-center justify-center rounded-pill bg-cream text-em7">
                <Icon name="truck" className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-sans text-[11px] font-semibold text-g7 uppercase">
                  {order.courier ?? t("courier")}
                </span>
                {order.awb && (
                  <span className="font-sans text-xs text-ink">
                    {t("awb")}: <strong className="font-mono">{order.awb}</strong>
                  </span>
                )}
              </div>
            </div>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-btn bg-em7 px-4 font-sans text-xs font-semibold text-iv transition-colors hover:bg-em5"
              >
                <span>{t("trackCourier")}</span>
                <Icon name="arrowUR" className="size-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="rounded-btn border border-s2 bg-cream p-5 md:p-6 shadow-sm">
        <h3 className="mb-3 font-title text-lg font-bold text-em9">
          {t("items")}
        </h3>
        <ul className="divide-y divide-s2">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {item.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.image}
                    alt=""
                    className="size-12 rounded-3 object-cover border border-s2 bg-iv"
                  />
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-3 border border-s2 bg-iv text-g5">
                    <Icon name="lotus" className="size-6" />
                  </span>
                )}
                <div>
                  <p className="font-sans text-sm font-semibold text-em9">
                    {loc(item.name, locale)}
                  </p>
                  {item.variant && (
                    <p className="font-sans text-xs text-ink6">
                      Size: {item.variant}
                    </p>
                  )}
                </div>
              </div>
              <span className="font-sans text-xs font-bold text-ink6">
                Qty: {item.qty}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Public event updates */}
      {order.events.length > 0 && (
        <div className="rounded-btn border border-s2 bg-cream p-5 md:p-6 shadow-sm">
          <h3 className="mb-3 font-title text-lg font-bold text-em9">
            {t("recentUpdates")}
          </h3>
          <ul className="space-y-3">
            {order.events.map((ev) => (
              <li key={ev.id} className="flex gap-3 text-xs">
                <span className="mt-1 size-2 flex-none rounded-full bg-g5" />
                <div className="flex flex-col">
                  <span className="font-semibold text-em9">
                    {ev.message || ev.type}
                  </span>
                  <span className="text-ink6">
                    {formatIst(ev.createdAt, { date: true, time: true, locale })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action links */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="flex h-10 items-center justify-center gap-2 rounded-btn border border-s2 bg-cream px-5 font-sans text-xs font-semibold text-em7 transition-colors hover:bg-s1 cursor-pointer"
        >
          <Icon name="search" className="size-3.5" />
          <span>{t("trackAnother")}</span>
        </button>

        <Link
          href="/account"
          className="font-sans text-xs font-semibold text-em7 underline underline-offset-4 hover:text-em5"
        >
          {t("signInFull")} →
        </Link>
      </div>
    </div>
  );
}
