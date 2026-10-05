import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth/guards";
import { can } from "@/lib/domain/permissions";
import { getOrderAdmin } from "@/server/orders/admin";
import { StatusBadge, type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { CustomerCard } from "@/components/admin/orders/CustomerCard";
import { OrderActions, AttentionBanner } from "@/components/admin/orders/OrderActions";
import { OrderTimelineAdmin } from "@/components/admin/orders/OrderTimelineAdmin";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";
import type { OrderStatus, PaymentStatus } from "@/lib/domain/enums";

function getStatusBadge(status: OrderStatus): { tone: BadgeTone; label: string } {
  switch (status) {
    case "placed":
      return { tone: "warn", label: "Placed" };
    case "energizing":
      return { tone: "info", label: "Energizing" };
    case "packed":
      return { tone: "info", label: "Packed" };
    case "shipped":
      return { tone: "ok", label: "Shipped" };
    case "delivered":
      return { tone: "ok", label: "Delivered" };
    case "pending_payment":
      return { tone: "muted", label: "Pending Payment" };
    case "cancelled":
      return { tone: "danger", label: "Cancelled" };
    case "returned":
      return { tone: "danger", label: "Returned" };
    default:
      return { tone: "muted", label: status };
  }
}

function getPaymentBadge(status: PaymentStatus): { tone: BadgeTone; label: string } {
  switch (status) {
    case "paid":
      return { tone: "ok", label: "Paid" };
    case "cod_pending":
      return { tone: "warn", label: "COD Due" };
    case "unpaid":
      return { tone: "muted", label: "Unpaid" };
    case "failed":
      return { tone: "danger", label: "Failed" };
    case "refunded":
      return { tone: "danger", label: "Refunded" };
    case "partially_refunded":
      return { tone: "warn", label: "Partially Refunded" };
    default:
      return { tone: "muted", label: status };
  }
}

export default async function OrderDetailPage(props: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const admin = await requireAdminPage("orders.view");
  const canRefund = can(admin.role, "orders.refund");

  const p = await props.params;
  const orderId = Number(p.id);
  if (!orderId || isNaN(orderId)) {
    notFound();
  }

  const detail = await getOrderAdmin(orderId);
  if (!detail) {
    notFound();
  }

  const { order, items, events, payments, refunds } = detail;
  const sb = getStatusBadge(order.status);
  const pb = getPaymentBadge(order.paymentStatus);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Back button & Title header */}
      <div className="space-y-2">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-ink6 hover:text-em7 transition-colors"
        >
          <span>&larr;</span>
          <span>Back to All Orders</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-s2 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">
                {order.number}
              </h1>
              <StatusBadge tone={sb.tone}>{sb.label}</StatusBadge>
              <StatusBadge tone={pb.tone}>{pb.label}</StatusBadge>
            </div>
            <p className="font-sans text-xs text-ink6 mt-1">
              Placed on {formatIst(order.createdAt, { time: true })} IST &bull; Method:{" "}
              <strong className="uppercase text-ink">{order.paymentMethod}</strong>
              {order.invoiceNo && (
                <>
                  {" "}&bull; Invoice:{" "}
                  <span className="font-mono text-ink font-semibold">
                    {order.invoiceNo}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/orders/${order.id}/invoice`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-btn border border-s2 bg-iv px-3 py-1.5 font-sans text-xs font-semibold text-ink shadow-xs hover:bg-cream"
            >
              <div className="h-3.5 w-3.5 text-em7">
                <AdminIcon name="download" sw={2} />
              </div>
              Invoice
            </Link>

            <Link
              href={`/admin/orders/${order.id}/packing-slip`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-btn border border-s2 bg-iv px-3 py-1.5 font-sans text-xs font-semibold text-ink shadow-xs hover:bg-cream"
            >
              <div className="h-3.5 w-3.5 text-g7">
                <AdminIcon name="package" sw={2} />
              </div>
              Packing Slip
            </Link>
          </div>
        </div>
      </div>

      {/* Attention Banner with resolve trigger */}
      {order.needsAttention && (
        <AttentionBanner orderId={order.id} reason={order.attentionReason} />
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Card */}
          <div className="rounded-field border border-s2 bg-iv shadow-sm overflow-hidden">
            <div className="border-b border-s2 px-5 py-3.5 bg-cream/40 flex items-center justify-between">
              <h3 className="font-sans text-sm font-bold text-ink">
                Ordered Items ({items.reduce((acc, it) => acc + it.qty, 0)} units)
              </h3>
              {order.energizationOn && (
                <span className="inline-flex items-center gap-1 text-xs text-g7 font-semibold">
                  <div className="h-3.5 w-3.5">
                    <AdminIcon name="flame" sw={2} />
                  </div>
                  Energization Date: {order.energizationOn}
                </span>
              )}
            </div>

            <div className="divide-y divide-s2">
              {items.map((it) => (
                <div key={it.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                  {/* Thumbnail */}
                  <div className="h-16 w-16 shrink-0 rounded-field bg-cream/60 border border-s2 overflow-hidden flex items-center justify-center">
                    {it.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={it.image}
                        alt={it.nameEn}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-6 w-6 text-s2">
                        <AdminIcon name="package" sw={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-serif text-sm font-bold text-ink">
                          {it.nameEn}
                        </h4>
                        <p className="font-deva text-xs text-ink6">{it.nameHi}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-sans text-sm font-bold text-ink">
                          {fmt(it.lineTotalInr)}
                        </span>
                        <div className="font-sans text-[11px] text-ink6">
                          {fmt(it.priceInr + it.energInr)} &times; {it.qty}
                        </div>
                      </div>
                    </div>

                    {it.variant && (
                      <span className="inline-block rounded-pill bg-cream px-2 py-0.5 font-sans text-[11px] font-semibold text-ink6">
                        Wrist Size: {it.variant}
                      </span>
                    )}

                    {/* Energization Devotee & Gotra Highlight */}
                    {(it.energName || it.energGotra) && (
                      <div className="mt-2 rounded-field bg-g1/40 border border-g3/30 p-2 text-xs text-g7 flex items-center gap-1.5">
                        <div className="h-3.5 w-3.5 shrink-0 text-g7">
                          <AdminIcon name="flame" sw={2} />
                        </div>
                        <div>
                          <strong>Vedic Energization (Pran-Pratishtha):</strong>{" "}
                          <span>Devotee: <strong>{it.energName || "Self"}</strong></span>
                          {it.energGotra && (
                            <span className="ml-2">Gotra: <strong>{it.energGotra}</strong></span>
                          )}
                          {it.energInr > 0 && (
                            <span className="ml-2 font-mono text-[11px]">
                              (+{fmt(it.energInr)}/unit)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Summary Table */}
            <div className="border-t border-s2 bg-cream/20 p-5 space-y-2 text-xs">
              <div className="flex justify-between text-ink6">
                <span>Items Subtotal</span>
                <span>{fmt(order.itemsInr)}</span>
              </div>

              {order.energInr > 0 && (
                <div className="flex justify-between text-ink6">
                  <span>Pran-Pratishtha Energization Fee</span>
                  <span>+{fmt(order.energInr)}</span>
                </div>
              )}

              {order.discountInr > 0 && (
                <div className="flex justify-between text-ok font-medium">
                  <span>Coupon Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>&minus;{fmt(order.discountInr)}</span>
                </div>
              )}

              {order.giftInr > 0 && (
                <div className="flex justify-between text-ink6">
                  <span>Sacred Gift Wrap</span>
                  <span>+{fmt(order.giftInr)}</span>
                </div>
              )}

              {order.shippingInr > 0 && (
                <div className="flex justify-between text-ink6">
                  <span>Standard Shipping</span>
                  <span>+{fmt(order.shippingInr)}</span>
                </div>
              )}

              {order.expressInr > 0 && (
                <div className="flex justify-between text-ink6">
                  <span>Express Muhurat Delivery</span>
                  <span>+{fmt(order.expressInr)}</span>
                </div>
              )}

              {order.codInr > 0 && (
                <div className="flex justify-between text-ink6">
                  <span>Cash on Delivery Handling</span>
                  <span>+{fmt(order.codInr)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-s2 pt-2 font-sans text-sm font-bold text-ink">
                <span>Grand Total</span>
                <span>{fmt(order.totalInr)}</span>
              </div>

              {order.refundedInr > 0 && (
                <div className="flex justify-between border-t border-rose/30 pt-1 text-sin font-bold">
                  <span>Total Refunded</span>
                  <span>&minus;{fmt(order.refundedInr)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer / Gift Notes */}
          {(order.customerNote || order.giftMessage || order.adminNote) && (
            <div className="rounded-field border border-s2 bg-iv p-5 shadow-sm space-y-3">
              <h3 className="font-sans text-sm font-bold text-ink border-b border-s2 pb-2">
                Order Notes
              </h3>

              {order.customerNote && (
                <div>
                  <span className="font-sans text-xs font-semibold text-ink6">
                    Customer Instructions:
                  </span>
                  <p className="mt-0.5 rounded-field bg-cream/40 p-2.5 text-xs text-ink whitespace-pre-wrap">
                    {order.customerNote}
                  </p>
                </div>
              )}

              {order.giftMessage && (
                <div>
                  <span className="font-sans text-xs font-semibold text-ink6">
                    Gift Message:
                  </span>
                  <p className="mt-0.5 rounded-field bg-cream/40 p-2.5 text-xs text-ink italic whitespace-pre-wrap">
                    &ldquo;{order.giftMessage}&rdquo;
                  </p>
                </div>
              )}

              {order.adminNote && (
                <div>
                  <span className="font-sans text-xs font-semibold text-ink6">
                    Internal Staff Notes:
                  </span>
                  <p className="mt-0.5 rounded-field bg-cream/40 p-2.5 text-xs text-ink font-mono whitespace-pre-wrap">
                    {order.adminNote}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Payments & Refunds History */}
          {(payments.length > 0 || refunds.length > 0) && (
            <div className="rounded-field border border-s2 bg-iv p-5 shadow-sm space-y-4">
              <h3 className="font-sans text-sm font-bold text-ink border-b border-s2 pb-2">
                Payment Transactions & Refunds
              </h3>

              {payments.length > 0 && (
                <div className="space-y-2">
                  <span className="font-sans text-xs font-bold text-ink6 block">
                    Payments ({payments.length})
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[11px] font-bold text-ink6 uppercase border-b border-s2">
                        <tr>
                          <th className="py-2">Provider</th>
                          <th className="py-2">Payment ID</th>
                          <th className="py-2">Amount</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-s2">
                        {payments.map((p) => (
                          <tr key={p.id}>
                            <td className="py-2 uppercase font-medium">{p.provider}</td>
                            <td className="py-2 font-mono text-[11px]">
                              {p.rzpPaymentId || p.method || "—"}
                            </td>
                            <td className="py-2 font-bold">{fmt(p.amountInr)}</td>
                            <td className="py-2">
                              <span className="font-semibold text-ok capitalize">
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2 text-ink6">
                              {formatIst(p.createdAt, { time: true })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {refunds.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-s2">
                  <span className="font-sans text-xs font-bold text-sin block">
                    Refunds ({refunds.length})
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[11px] font-bold text-ink6 uppercase border-b border-s2">
                        <tr>
                          <th className="py-2">Refund ID</th>
                          <th className="py-2">Amount</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Reason</th>
                          <th className="py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-s2">
                        {refunds.map((r) => (
                          <tr key={r.id}>
                            <td className="py-2 font-mono text-[11px]">
                              {r.rzpRefundId || "Manual/COD"}
                            </td>
                            <td className="py-2 font-bold text-sin">{fmt(r.amountInr)}</td>
                            <td className="py-2">
                              <span
                                className={`font-semibold capitalize ${
                                  r.status === "processed"
                                    ? "text-ok"
                                    : r.status === "failed"
                                      ? "text-sin"
                                      : "text-g7"
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="py-2 text-ink6">{r.reason || "—"}</td>
                            <td className="py-2 text-ink6">
                              {formatIst(r.createdAt, { time: true })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Customer Card, Actions, Timeline */}
        <div className="space-y-6">
          <CustomerCard
            name={order.name}
            phone={order.phone}
            email={order.email}
            shipAddress={order.shipAddress}
            orderNumber={order.number}
            status={order.status}
            locale={order.locale}
            energizationDate={order.energizationOn}
            courier={order.courier}
            awb={order.awb}
            trackingUrl={order.trackingUrl}
          />

          <OrderActions
            order={{
              id: order.id,
              number: order.number,
              status: order.status,
              paymentStatus: order.paymentStatus,
              paymentMethod: order.paymentMethod,
              totalInr: order.totalInr,
              refundedInr: order.refundedInr || 0,
              courier: order.courier,
              awb: order.awb,
              trackingUrl: order.trackingUrl,
            }}
            canRefund={canRefund}
          />

          <OrderTimelineAdmin events={events} />
        </div>
      </div>
    </div>
  );
}
