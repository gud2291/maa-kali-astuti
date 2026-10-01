import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { can } from "@/lib/domain/permissions";
import { listOrders, countByTab, type AdminOrderListItem } from "@/server/orders/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { StatusBadge, type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { OrderTabs } from "@/components/admin/orders/OrderTabs";
import { OrderFilters } from "@/components/admin/orders/OrderFilters";
import { ExportButton } from "@/components/admin/orders/ExportButton";
import { EnergizationBulk } from "@/components/admin/orders/EnergizationBulk";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";
import type { OrderAdminTab } from "@/lib/validation/order-admin";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/domain/enums";

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

export default async function OrdersPage(props: {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    method?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}): Promise<React.JSX.Element> {
  const admin = await requireAdminPage("orders.view");
  const canExport = can(admin.role, "exports.run");

  const sp = await props.searchParams;
  const tab = (sp.tab as OrderAdminTab) || "all";
  const search = sp.q;
  const method = sp.method as PaymentMethod | undefined;
  const from = sp.from;
  const to = sp.to;
  const page = Number(sp.page) || 1;

  const filters = { tab, search, method, from, to, page };

  const [counts, { rows, total, totalPages }] = await Promise.all([
    countByTab(),
    listOrders(filters),
  ]);

  const columns: DataTableColumn<AdminOrderListItem>[] = [
    {
      key: "number",
      header: "Order Number",
      render: (o) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/orders/${o.id}`}
            className="font-mono text-xs font-bold text-em7 hover:underline hover:text-em9"
          >
            {o.number}
          </Link>
          {o.needsAttention && (
            <span
              title={o.attentionReason || "Needs Attention"}
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose text-sin text-[10px] font-bold"
            >
              !
            </span>
          )}
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (o) => (
        <div>
          <div className="font-sans text-xs font-semibold text-ink">{o.name}</div>
          <div className="font-mono text-[11px] text-ink6">{o.phone}</div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (o) => (
        <span className="font-sans text-xs text-ink6">{o.itemsCount} units</span>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (o) => (
        <span className="font-sans text-xs font-bold text-ink">
          {fmt(o.totalInr)}
        </span>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (o) => {
        const pb = getPaymentBadge(o.paymentStatus);
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="font-sans text-[11px] uppercase tracking-wider text-ink6">
              {o.paymentMethod}
            </span>
            <StatusBadge tone={pb.tone}>{pb.label}</StatusBadge>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Order Status",
      render: (o) => {
        const sb = getStatusBadge(o.status);
        return <StatusBadge tone={sb.tone}>{sb.label}</StatusBadge>;
      },
    },
    {
      key: "date",
      header: "Date (IST)",
      render: (o) => (
        <span className="font-sans text-[11px] text-ink6 whitespace-nowrap">
          {formatIst(o.createdAt, { time: true })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Fulfillment pipeline, sacred energization, tracking and payments."
        actions={canExport ? <ExportButton filters={filters} /> : undefined}
      />

      <OrderTabs counts={counts} activeTab={tab} />

      {tab === "new" && <EnergizationBulk placedCount={counts.new} />}

      <OrderFilters search={search} method={method} from={from} to={to} />

      {rows.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={
            search || method || from || to
              ? "Try adjusting your search filters."
              : "No orders are currently in this pipeline tab."
          }
          icon="package"
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop / Tablet Table */}
          <div className="hidden md:block">
            <DataTable columns={columns} data={rows} keyField="id" />
          </div>

          {/* Mobile Card List */}
          <div className="space-y-3 md:hidden">
            {rows.map((o) => {
              const sb = getStatusBadge(o.status);
              const pb = getPaymentBadge(o.paymentStatus);
              return (
                <div
                  key={o.id}
                  className="rounded-field border border-s2 bg-iv p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-mono text-sm font-bold text-em7 hover:underline"
                        >
                          {o.number}
                        </Link>
                        {o.needsAttention && (
                          <span
                            title={o.attentionReason || "Needs Attention"}
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose text-sin text-[10px] font-bold"
                          >
                            !
                          </span>
                        )}
                      </div>
                      <div className="font-sans text-xs font-semibold text-ink mt-0.5">
                        {o.name}
                      </div>
                    </div>
                    <StatusBadge tone={sb.tone}>{sb.label}</StatusBadge>
                  </div>

                  <div className="flex items-center justify-between border-t border-s2 pt-2 text-xs">
                    <div>
                      <span className="text-ink6">Total: </span>
                      <strong className="text-ink font-bold">{fmt(o.totalInr)}</strong>
                      <span className="text-ink6 ml-1">({o.itemsCount} units)</span>
                    </div>
                    <StatusBadge tone={pb.tone}>{pb.label}</StatusBadge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-ink6 pt-1">
                    <span>{formatIst(o.createdAt, { time: true })}</span>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-semibold text-em7 hover:underline"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={20}
          />
        </div>
      )}
    </div>
  );
}
