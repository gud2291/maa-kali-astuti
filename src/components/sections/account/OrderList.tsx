import Link from "next/link";
import type { OrderSummaryItem } from "@/server/account/queries";
import type { Locale } from "@/lib/domain/enums";
import { Icon } from "@/components/icons/Icon";
import { Badge } from "@/components/ui/Badge";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";

export function OrderList({
  orders,
  totalCount,
  page,
  totalPages,
  locale = "en",
}: {
  orders: OrderSummaryItem[];
  totalCount: number;
  page: number;
  totalPages: number;
  locale?: Locale;
}): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-s2 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-title text-2xl font-normal text-em9 sm:text-3xl">
            {locale === "hi" ? "मेरे ऑर्डर" : "My Orders"}
          </h1>
          <p className="mt-1 font-sans text-xs text-ink6 sm:text-sm">
            {locale === "hi"
              ? `कुल ${totalCount} ऑर्डर पाए गए`
              : `Found ${totalCount} total orders`}
          </p>
        </div>
      </div>

      {/* Orders Cards Grid/List */}
      {orders.length === 0 ? (
        <div className="rounded-xl border border-s2 bg-cream p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-pill bg-s1 text-ink6">
            <Icon name="bag" className="size-6" />
          </div>
          <h2 className="font-sans text-base font-bold text-ink">
            {locale === "hi" ? "कोई ऑर्डर नहीं मिला" : "No orders found"}
          </h2>
          <p className="mt-1 font-sans text-xs text-ink6">
            {locale === "hi"
              ? "आपने अभी तक कोई ऑर्डर नहीं दिया है।"
              : "You haven't placed any orders with this account yet."}
          </p>
          <div className="mt-5">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-btn bg-em7 px-4 py-2 font-sans text-xs font-semibold text-iv hover:bg-em9 transition-colors"
            >
              <span>{locale === "hi" ? "दुकान देखें" : "Explore Sacred Offerings"}</span>
              <Icon name="arrowR" className="size-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="overflow-hidden rounded-xl border border-s2 bg-cream shadow-sm transition-all duration-200 hover:border-g5 hover:shadow-card"
            >
              {/* Order Card Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-s2 bg-iv px-5 py-3.5 text-xs">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <span className="text-ink6">
                      {locale === "hi" ? "ऑर्डर सं:" : "Order:"}
                    </span>{" "}
                    <span className="font-mono font-bold text-ink">
                      {ord.number}
                    </span>
                  </div>

                  <div>
                    <span className="text-ink6">
                      {locale === "hi" ? "दिनांक:" : "Placed:"}
                    </span>{" "}
                    <span className="font-medium text-ink">
                      {formatIst(new Date(ord.createdAt), { time: false })}
                    </span>
                  </div>

                  <div>
                    <span className="text-ink6">
                      {locale === "hi" ? "कुल:" : "Total:"}
                    </span>{" "}
                    <span className="font-bold text-em7">{fmt(ord.totalInr)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge tone="gold" size="sm">
                    {ord.status.replace("_", " ")}
                  </Badge>
                  <Link
                    href={`/account/orders/${ord.number}`}
                    className="rounded-btn bg-em7 px-3 py-1 font-sans text-xs font-semibold text-iv hover:bg-em9 transition-colors"
                  >
                    {locale === "hi" ? "विवरण देखें" : "View Details"}
                  </Link>
                </div>
              </div>

              {/* Order Card Body / Item Previews */}
              <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-3">
                  {ord.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center gap-3 rounded-field border border-s2 bg-iv p-2 pr-4 text-xs"
                    >
                      <div className="size-12 shrink-0 overflow-hidden rounded border border-s2 bg-cream">
                        {it.image ? (
                          <img
                            src={it.image}
                            alt={it.name[locale] ?? it.name.en}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-g5">
                            <Icon name="bag" className="size-5" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="max-w-[180px] truncate font-sans font-bold text-ink sm:max-w-[220px]">
                          {it.name[locale] ?? it.name.en}
                        </p>
                        <p className="text-[11px] text-ink6">
                          Qty: {it.qty} · {fmt(it.priceInr)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-ink6">
                    Payment: <span className="uppercase text-ink font-medium">{ord.paymentMethod}</span> ({ord.paymentStatus})
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-s2 pt-4">
              {page > 1 ? (
                <Link
                  href={`/account/orders?page=${page - 1}`}
                  className="inline-flex items-center gap-1 rounded-btn border border-s2 bg-iv px-3 py-1.5 font-sans text-xs font-semibold text-em7 hover:bg-s2"
                >
                  <Icon name="arrowL" className="size-3.5" />
                  <span>Previous</span>
                </Link>
              ) : (
                <div />
              )}

              <span className="font-sans text-xs text-ink6">
                Page {page} of {totalPages}
              </span>

              {page < totalPages && (
                <Link
                  href={`/account/orders?page=${page + 1}`}
                  className="inline-flex items-center gap-1 rounded-btn border border-s2 bg-iv px-3 py-1.5 font-sans text-xs font-semibold text-em7 hover:bg-s2"
                >
                  <span>Next</span>
                  <Icon name="arrowR" className="size-3.5" />
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
