import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { isConfigured } from "@/server/env";
import { shiprocketStatus } from "@/server/shipping/shiprocket";
import { listPayments, paymentSummary, PAYMENTS_PAGE_SIZE, type PaymentListRow } from "@/server/payments/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { FilterSelect } from "@/components/admin/ui/FilterSelect";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { StatusBadge, type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";

const TONE: Record<string, BadgeTone> = {
  captured: "ok",
  created: "muted",
  failed: "danger",
  refunded: "danger",
  partially_refunded: "warn",
};

function Tile({ title, value, sub }: { title: string; value: string; sub?: string }): React.JSX.Element {
  return (
    <div className="rounded-field border border-s2 bg-iv p-4 shadow-sm">
      <div className="font-sans text-[11px] font-semibold uppercase tracking-wide text-ink6">{title}</div>
      <div className="mt-1 font-serif text-xl font-bold text-ink">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-ink6">{sub}</div>}
    </div>
  );
}

function Integration({ name, ok, hint }: { name: string; ok: boolean; hint: string }): React.JSX.Element {
  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <div className="font-sans text-[13px] font-semibold text-ink">{name}</div>
        <div className="text-[11.5px] text-ink6">{hint}</div>
      </div>
      <StatusBadge tone={ok ? "ok" : "warn"}>{ok ? "Connected" : "Not set"}</StatusBadge>
    </li>
  );
}

export default async function PaymentsPage(props: {
  searchParams: Promise<{ status?: string; entity?: string; page?: string }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("orders.view");
  const sp = await props.searchParams;
  const page = Number(sp.page) || 1;

  const [summary, { rows, total, totalPages }] = await Promise.all([
    paymentSummary(),
    listPayments({ status: sp.status, entity: sp.entity, page }),
  ]);
  const sr = shiprocketStatus();

  const columns: DataTableColumn<PaymentListRow>[] = [
    {
      key: "for",
      header: "For",
      mobile: "title",
      cell: (r) =>
        r.orderId && r.orderNumber ? (
          <Link href={`/admin/orders/${r.orderId}`} className="font-mono text-[13px] font-bold text-em7 hover:underline">
            {r.orderNumber}
          </Link>
        ) : (
          <span className="text-[13px] capitalize text-ink">
            {r.entity} #{r.entityId}
          </span>
        ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (r) => <span className="text-[13.5px] font-bold text-ink">{fmt(r.amountInr)}</span>,
    },
    {
      key: "method",
      header: "Method",
      mobile: "meta",
      cell: (r) => <span className="text-[12.5px] uppercase text-ink6">{r.method || r.provider}</span>,
    },
    {
      key: "ref",
      header: "Razorpay ID",
      mobile: "hide",
      cell: (r) => <span className="font-mono text-[11.5px] text-ink6">{r.rzpPaymentId ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      mobile: "badge",
      cell: (r) => (
        <div className="flex flex-col gap-0.5">
          <StatusBadge tone={TONE[r.status] ?? "muted"}>{r.status.replace("_", " ")}</StatusBadge>
          {r.error && <span className="max-w-[220px] truncate text-[11px] text-sin">{r.error}</span>}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      mobile: "meta",
      cell: (r) => <span className="text-[12.5px] text-ink6">{formatIst(r.createdAt, { time: true })}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Payments"
        description="Every online payment attempt, verified by Razorpay on the server. Refunds are issued from the order page."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile title="Captured today" value={fmt(summary.capturedTodayInr)} />
        <Tile title="Captured this month" value={fmt(summary.capturedMonthInr)} />
        <Tile title="Failed (7 days)" value={String(summary.failed7d)} sub={summary.awaiting ? `${summary.awaiting} awaiting payment` : undefined} />
        <Tile title="Refunded this month" value={fmt(summary.refundedMonthInr)} />
      </div>

      <section className="rounded-field border border-s2 bg-iv p-5 shadow-sm">
        <h3 className="mb-1 font-sans text-sm font-bold text-ink">Connections</h3>
        <ul className="divide-y divide-s2">
          <Integration name="Razorpay (payments)" ok={isConfigured("razorpay")} hint="Key ID, key secret and webhook secret" />
          <Integration name="Email (Resend)" ok={isConfigured("email")} hint="Needed for order emails and admin sign-in codes" />
          <Integration name="Shiprocket (shipping)" ok={sr.enabled} hint={sr.enabled ? (sr.webhookTokenSet ? "Live tracking webhook token set" : "Set SHIPROCKET_WEBHOOK_TOKEN for live tracking") : "Add the API user email and password"} />
          <Integration name="Images (Cloudflare R2)" ok={isConfigured("r2")} hint="Product and media uploads" />
          <Integration name="Bot check (Turnstile)" ok={isConfigured("turnstile")} hint="Protects sign-in and forms" />
          <Integration name="Daily jobs (cron)" ok={isConfigured("cron")} hint="CRON_SECRET for reminders and cleanups" />
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          param="status"
          label="All statuses"
          options={[
            { value: "captured", label: "Captured" },
            { value: "created", label: "Created / unpaid" },
            { value: "failed", label: "Failed" },
            { value: "refunded", label: "Refunded" },
            { value: "partially_refunded", label: "Partially refunded" },
          ]}
        />
        <FilterSelect
          param="entity"
          label="All types"
          options={[
            { value: "order", label: "Shop orders" },
            { value: "booking", label: "Consultations" },
            { value: "kundali", label: "Kundali" },
            { value: "link", label: "Payment links" },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="tag" title="No payments yet" body="Payments appear here as customers pay online." />
      ) : (
        <>
          <DataTable rows={rows} columns={columns} empty={null} />
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAYMENTS_PAGE_SIZE} />
        </>
      )}
    </div>
  );
}
