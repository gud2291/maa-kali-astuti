import Link from "next/link";
import type { RecentOrderItem } from "@/server/dashboard/queries";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";
import { StatusBadge, type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/AdminIcon";
import type { OrderStatus } from "@/lib/domain/enums";

export type RecentOrdersProps = {
  orders: RecentOrderItem[];
};

function getOrderStatusBadge(status: OrderStatus): { tone: BadgeTone; label: string } {
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
    case "cancelled":
      return { tone: "danger", label: "Cancelled" };
    default:
      return { tone: "muted", label: status };
  }
}

export function RecentOrders({ orders }: RecentOrdersProps): React.JSX.Element {
  return (
    <div className="rounded-btn bg-cream p-5 shadow-ring-sand border border-s2 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-s2 pb-3">
          <div>
            <h3 className="font-serif text-[17px] font-bold text-ink">
              Recent Orders
            </h3>
            <p className="font-sans text-[11.5px] text-ink6">
              Latest store purchases
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 font-sans text-[12px] font-semibold text-em7 hover:text-em5 no-underline"
          >
            <span>All orders</span>
            <AdminIcon name="arrowR" className="size-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center font-sans text-[13px] text-ink6">
            No orders found.
          </div>
        ) : (
          <div className="divide-y divide-s2/60">
            {orders.map((o) => {
              const badge = getOrderStatusBadge(o.status);
              const timeStr = formatIst(o.createdAt, { date: true, time: true });

              return (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="group flex items-center justify-between gap-3 py-3 no-underline transition-colors hover:bg-s1/30 px-2 rounded -mx-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12.5px] font-bold text-em7 group-hover:underline">
                        {o.number}
                      </span>
                      {o.needsAttention && (
                        <span
                          title={o.attentionReason || "Needs Attention"}
                          className="inline-flex size-4 items-center justify-center rounded-full bg-rose text-sin text-[10px] font-bold flex-none"
                        >
                          !
                        </span>
                      )}
                    </div>
                    <p className="truncate font-sans text-[12px] text-ink font-medium mt-0.5">
                      {o.name} <span className="text-ink6">({o.phone})</span>
                    </p>
                    <p className="font-sans text-[11px] text-ink6">
                      {timeStr}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-none text-right">
                    <span className="font-sans text-[13.5px] font-bold text-ink">
                      {fmt(o.totalInr)}
                    </span>
                    <StatusBadge tone={badge.tone}>
                      {badge.label}
                    </StatusBadge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
