import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { listSubscribers, countSubscribers } from "@/server/messages/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Pagination } from "@/components/admin/ui/Pagination";
import { SearchBox } from "@/components/admin/ui/SearchBox";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import type { SubscriberAdminItem } from "@/server/messages/admin";
import { formatIst } from "@/lib/core/ist";
import { SubscriberActions } from "@/components/admin/messages/SubscriberActions";

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("messages.view");

  const params = await searchParams;
  const search = params.search || "";
  const currentStatus = params.status || "all";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const [data, counts] = await Promise.all([
    listSubscribers({ search, status: currentStatus, page, pageSize: 20 }),
    countSubscribers(),
  ]);

  const buildUrl = (updates: Partial<{ search: string; status: string; page: number }>): string => {
    const q = new URLSearchParams();
    const s = updates.status !== undefined ? updates.status : currentStatus;
    const sr = updates.search !== undefined ? updates.search : search;
    const p = updates.page !== undefined ? updates.page : 1;
    if (s && s !== "all") q.set("status", s);
    if (sr) q.set("search", sr);
    if (p > 1) q.set("page", String(p));
    const qs = q.toString();
    return qs ? `/admin/subscribers?${qs}` : "/admin/subscribers";
  };

  const columns: DataTableColumn<SubscriberAdminItem>[] = [
    {
      key: "email",
      header: "Email",
      mobile: "title",
      cell: (row) => (
        <span className="font-sans text-[14px] font-semibold text-ink">{row.email}</span>
      ),
    },
    {
      key: "source",
      header: "Source",
      mobile: "meta",
      cell: (row) => (
        <span className="rounded-sm bg-cream px-2 py-0.5 font-mono text-[11px] font-semibold text-ink6 uppercase">
          {row.source}
        </span>
      ),
    },
    {
      key: "locale",
      header: "Locale",
      mobile: "meta",
      cell: (row) => (
        <span className="font-mono text-[12px] text-ink6 uppercase">{row.locale}</span>
      ),
    },
    {
      key: "subscribed",
      header: "Subscribed",
      mobile: "meta",
      cell: (row) => (
        <span className="font-mono text-[12px] text-ink6">{formatIst(row.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      mobile: "badge",
      cell: (row) => (
        <StatusBadge tone={row.status === "subscribed" ? "ok" : "muted"}>
          {row.status === "subscribed" ? "Active" : "Unsubscribed"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      mobile: "meta",
      cell: (row) => <SubscriberActions subscriberId={row.id} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscribers"
        description={`${counts.subscribed} active · ${counts.unsubscribed} unsubscribed · ${counts.total} total`}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchBox placeholder="Search by email…" />
        </div>

        <div className="flex items-center gap-3">
          {/* Status filter */}
          <div className="flex rounded-field border border-s2 bg-cream p-0.5 text-[12.5px]">
            <Link
              href={buildUrl({ status: "all", page: 1 })}
              className={`rounded-sm px-2.5 py-1 font-semibold transition-colors ${
                currentStatus === "all" ? "bg-em7 text-iv" : "text-ink6 hover:text-ink"
              }`}
            >
              All
            </Link>
            <Link
              href={buildUrl({ status: "subscribed", page: 1 })}
              className={`rounded-sm px-2.5 py-1 font-semibold transition-colors ${
                currentStatus === "subscribed" ? "bg-em7 text-iv" : "text-ink6 hover:text-ink"
              }`}
            >
              Active
            </Link>
            <Link
              href={buildUrl({ status: "unsubscribed", page: 1 })}
              className={`rounded-sm px-2.5 py-1 font-semibold transition-colors ${
                currentStatus === "unsubscribed" ? "bg-em7 text-iv" : "text-ink6 hover:text-ink"
              }`}
            >
              Unsubscribed
            </Link>
          </div>

          {/* Export */}
          <SubscriberActions exportMode />
        </div>
      </div>

      <DataTable
        rows={data.items}
        columns={columns}
        empty={
          <EmptyState
            icon="bell"
            title="No subscribers found"
            body={search ? `No subscribers matching "${search}".` : "Newsletter subscribers will appear here."}
          />
        }
      />

      {data.totalPages > 1 && (
        <Pagination page={data.page} totalPages={data.totalPages} />
      )}
    </div>
  );
}
