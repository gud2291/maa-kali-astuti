import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { listKundaliOrders, type KundaliAdminListItem } from "@/server/kundali/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { SearchBox } from "@/components/admin/ui/SearchBox";
import { StatusBadge, type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";
import type { KundaliStatus } from "@/lib/domain/enums";

function getStatusBadge(status: KundaliStatus): {
  tone: BadgeTone;
  label: string;
} {
  switch (status) {
    case "ready":
      return { tone: "ok", label: "Ready" };
    case "generating":
      return { tone: "info", label: "Generating" };
    case "paid":
      return { tone: "warn", label: "Paid (Queued)" };
    case "failed":
      return { tone: "danger", label: "Failed" };
    case "pending_payment":
      return { tone: "muted", label: "Pending Payment" };
    default:
      return { tone: "muted", label: status };
  }
}

export default async function AdminKundaliPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("kundali.view");
  const params = await searchParams;

  const currentStatus = params.status || "all";
  const search = params.search || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const { items, total, totalPages } = await listKundaliOrders({
    status: currentStatus,
    search: search || undefined,
    page,
  });

  const columns: DataTableColumn<KundaliAdminListItem>[] = [
    {
      key: "ref",
      header: "Reference",
      mobile: "title",
      cell: (row) => (
        <div>
          <span className="font-mono text-[13px] font-bold text-em7">
            {row.ref}
          </span>
          <div className="font-mono text-[11px] text-ink6">
            {formatIst(row.createdAt, { date: true })}
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (row) => (
        <div>
          <div className="font-sans text-[13.5px] font-semibold text-ink">
            {row.name}
          </div>
          <div className="font-sans text-[12px] text-ink6">{row.phone}</div>
          {row.email && (
            <div className="font-sans text-[11.5px] text-ink6 truncate max-w-[160px]">
              {row.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "birth",
      header: "Birth Data",
      cell: (row) => (
        <div>
          <div className="font-sans text-[13px] text-ink">{row.dob}</div>
          <div className="font-sans text-[11.5px] text-ink6 truncate max-w-[140px]">
            {row.place}
          </div>
        </div>
      ),
    },
    {
      key: "lang",
      header: "Language",
      cell: (row) => (
        <span className="font-sans text-[12.5px] font-medium text-ink">
          {row.reportLang === "hi" ? "Hindi" : "English"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row) => (
        <span className="font-mono text-[13px] font-bold text-em9">
          {fmt(row.priceInr)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      mobile: "badge",
      cell: (row) => {
        const badge = getStatusBadge(row.status);
        return <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>;
      },
    },
    {
      key: "actions",
      header: "",
      cell: (row) => (
        <Link
          href={`/admin/kundali/${row.id}`}
          className="inline-flex h-[32px] items-center rounded-btn border border-s2 bg-iv px-3 font-sans text-[12.5px] font-semibold text-em7 no-underline hover:bg-s1"
        >
          View
        </Link>
      ),
    },
  ];

  const tabs = [
    { key: "all", label: "All Orders" },
    { key: "ready", label: "Ready" },
    { key: "generating", label: "Generating" },
    { key: "paid", label: "Paid" },
    { key: "failed", label: "Failed" },
    { key: "pending_payment", label: "Pending Payment" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kundali Orders"
        description="Free Janam Kundali reports, chart generation status, and report delivery."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-s2 pb-2">
        {tabs.map((tab) => {
          const active = currentStatus === tab.key;
          const href = tab.key === "all" ? "/admin/kundali" : `/admin/kundali?status=${tab.key}`;
          return (
            <Link
              key={tab.key}
              href={href}
              className={`rounded-btn px-3 py-1.5 font-sans text-[13px] font-semibold transition ${
                active
                  ? "bg-em7 text-iv"
                  : "bg-iv text-ink6 hover:bg-s1 hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Search & Table */}
      <div className="flex flex-col gap-4">
        <div className="max-w-md">
          <SearchBox placeholder="Search by ref, name, phone, email..." />
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="No Kundali orders found"
            body={
              search
                ? `No orders matching "${search}"`
                : "No orders found in this status category."
            }
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={items}
            empty={null}
          />
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={20} />
          </>
        )}
      </div>
    </div>
  );
}
