import Link from "next/link";
import type { OrderView } from "@/server/orders/queries";
import type { Locale } from "@/lib/domain/enums";
import { OrderTimeline } from "@/components/sections/order/OrderTimeline";
import { ReorderButton } from "./ReorderButton";
import { Icon } from "@/components/icons/Icon";
import { Badge } from "@/components/ui/Badge";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";

export function OrderDetail({
  order,
  locale = "en",
}: {
  order: OrderView;
  locale?: Locale;
}): React.JSX.Element {
  const isHi = locale === "hi";

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col gap-4 border-b border-s2 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-em7 hover:text-em9 hover:underline mb-2"
          >
            <Icon name="arrowL" className="size-3.5" />
            <span>{isHi ? "वापस मेरे ऑर्डर पर जाएं" : "Back to My Orders"}</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-title text-2xl font-normal text-em9 sm:text-3xl">
              {isHi ? `ऑर्डर ${order.number}` : `Order ${order.number}`}
            </h1>
            <Badge tone="gold" size="sm">
              {order.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="mt-1 font-sans text-xs text-ink6">
            {isHi ? "दिनांक: " : "Placed on "}
            {formatIst(new Date(order.createdAt), { weekday: true })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {order.invoiceNo && (
            <Link
              href={`/invoice/${order.number}`}
              className="inline-flex items-center gap-1.5 rounded-btn border border-s2 bg-iv px-3.5 py-2 font-sans text-xs font-semibold text-ink hover:border-g5 hover:text-em7 transition-colors shadow-sm"
            >
              <Icon name="bolt" className="size-3.5 text-g5" />
              <span>{isHi ? "इनवॉयस देखें" : "View Invoice"}</span>
            </Link>
          )}

          <ReorderButton
            items={order.items.map((it) => ({
              productId: it.productId,
              variant: it.variant,
              qty: it.qty,
              energName: it.energName,
              energGotra: it.energGotra,
            }))}
            locale={locale}
          />
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="rounded-xl border border-s2 bg-cream p-6 shadow-sm">
        <h2 className="mb-2 font-sans text-sm font-bold uppercase tracking-wider text-ink6">
          {isHi ? "ऑर्डर ट्रैकिंग स्थिति" : "Order Journey & Tracking"}
        </h2>
        <OrderTimeline status={order.status} locale={locale} />

        {order.energizationOn && (
          <div className="mt-4 rounded-field border border-g5/30 bg-g1/25 p-3 text-center sm:text-left">
            <div className="flex items-center gap-2 text-g7 text-xs font-semibold">
              <Icon name="bolt" className="size-4 shrink-0 text-g5" />
              <span>
                {isHi
                  ? `महापूजा प्राण प्रतिष्ठा दिवस: ${order.energizationOn}`
                  : `Vedic Sanctification & Mahapuja Date: ${order.energizationOn}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Courier & Tracking Link (if available) */}
      {(order.courier || order.awb || order.trackingUrl) && (
        <div className="rounded-xl border border-s2 bg-cream p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-field bg-iv text-em7">
                <Icon name="truck" className="size-5" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-ink">
                  {order.courier || "Courier Partner"}
                </span>
                {order.awb && (
                  <p className="font-mono text-ink6">
                    AWB / Tracking No: <span className="font-bold text-ink">{order.awb}</span>
                  </p>
                )}
              </div>
            </div>

            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-btn bg-em7 px-4 py-2 font-sans text-xs font-semibold text-iv hover:bg-em9 transition-colors"
              >
                <span>{isHi ? "कूरियर पर ट्रैक करें" : "Track with Courier"}</span>
                <Icon name="arrowR" className="size-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Two column grid: Items on Left, Summary + Details on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Items List (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-xl border border-s2 bg-cream p-5 sm:p-6 shadow-sm">
            <h2 className="font-title text-xl font-normal text-em9 mb-4">
              {isHi ? "ऑर्डर की गई सामग्री" : "Consecrated Items"}
            </h2>

            <div className="divide-y divide-s2">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="size-20 shrink-0 overflow-hidden rounded-field border border-s2 bg-iv">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name[locale] ?? item.name.en}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-g5">
                        <Icon name="bag" className="size-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-sans text-sm font-bold text-ink hover:text-em7 hover:underline"
                      >
                        {item.name[locale] ?? item.name.en}
                      </Link>
                      {item.variant && (
                        <p className="font-sans text-xs text-ink6">
                          Size: {item.variant}
                        </p>
                      )}
                      {item.energName && (
                        <p className="mt-1 font-sans text-xs text-g7">
                          Sankalp: {item.energName} ({item.energGotra || "Kashyap"})
                        </p>
                      )}
                    </div>

                    <div className="mt-2 flex items-baseline justify-between text-xs">
                      <span className="text-ink6">
                        Qty: {item.qty} × {fmt(item.priceInr)}
                      </span>
                      <span className="font-bold text-ink sm:text-sm">
                        {fmt(item.lineTotalInr)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Totals & Addresses (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Summary Card */}
          <div className="rounded-xl border border-s2 bg-cream p-5 sm:p-6 shadow-sm space-y-3 text-xs sm:text-sm">
            <h2 className="font-title text-xl font-normal text-em9 pb-1 border-b border-s2">
              {isHi ? "ऑर्डर का विवरण" : "Payment Summary"}
            </h2>

            <div className="flex justify-between text-ink6">
              <span>Items Subtotal:</span>
              <span className="text-ink">{fmt(order.totals.items)}</span>
            </div>

            {order.totals.energ > 0 && (
              <div className="flex justify-between text-ink6">
                <span>Vedic Energization:</span>
                <span className="text-ink">{fmt(order.totals.energ)}</span>
              </div>
            )}

            {order.totals.discount > 0 && (
              <div className="flex justify-between text-sin">
                <span>Coupon Discount:</span>
                <span>−{fmt(order.totals.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-ink6">
              <span>Shipping & Transit:</span>
              <span className="text-ink">
                {order.totals.shipping === 0 && order.totals.express === 0
                  ? "FREE"
                  : fmt(order.totals.shipping + order.totals.express)}
              </span>
            </div>

            {order.totals.cod > 0 && (
              <div className="flex justify-between text-ink6">
                <span>COD Handling Fee:</span>
                <span className="text-ink">{fmt(order.totals.cod)}</span>
              </div>
            )}

            <div className="border-t border-s2 pt-3 flex justify-between font-sans text-base font-bold text-ink">
              <span>Total Paid / Payable:</span>
              <span className="text-em7">{fmt(order.totals.total)}</span>
            </div>

            <div className="pt-2 text-[11px] text-ink6">
              <span>Payment Mode: </span>
              <span className="uppercase font-semibold text-ink">
                {order.paymentMethod}
              </span>{" "}
              ({order.paymentStatus})
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="rounded-xl border border-s2 bg-cream p-5 sm:p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-wider text-ink6 mb-2">
              <Icon name="pin" className="size-4 text-g5" />
              <span>{isHi ? "डिलीवरी का पता" : "Shipping Address"}</span>
            </h3>
            <p className="font-sans text-xs leading-relaxed text-ink6">
              <span className="font-semibold text-ink">{order.address.name}</span><br />
              {order.address.line1}<br />
              {order.address.line2 && <>{order.address.line2}<br /></>}
              {order.address.landmark && <>{order.address.landmark}, </>}
              {order.address.city}, {order.address.state} — {order.address.pincode}<br />
              Phone: {order.address.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
