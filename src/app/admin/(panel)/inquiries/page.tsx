import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { listInquiries, type InquiryAdminListItem } from "@/server/inquiries/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { SearchBox } from "@/components/admin/ui/SearchBox";
import { LinkTabs, type LinkTab } from "@/components/admin/ui/Tabs";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { statusTone, statusLabel } from "@/components/admin/inquiries/InquiryPipeline";
import { formatIst } from "@/lib/core/ist";
import { INQUIRY_STATUS, type InquiryStatus } from "@/lib/domain/enums";

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    kind?: string;
    search?: string;
    page?: string;
  }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("inquiries.view");

  const params = await searchParams;
  const currentStatus = params.status || "all";
  const currentKind = params.kind || "all";
  const search = params.search || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const data = await listInquiries({
    status: currentStatus,
    kind: currentKind,
    search,
    page,
    pageSize: 20,
  });

  // Helper to build URL preserving filters
  const buildUrl = (updates: Partial<{ status: string; kind: string; search: string; page: number }>): string => {
    const q = new URLSearchParams();
    const s = updates.status !== undefined ? updates.status : currentStatus;
    const k = updates.kind !== undefined ? updates.kind : currentKind;
    const qStr = updates.search !== undefined ? updates.search : search;
    const p = updates.page !== undefined ? updates.page : 1;

    if (s && s !== "all") q.set("status", s);
    if (k && k !== "all") q.set("kind", k);
    if (qStr) q.set("search", qStr);
    if (p > 1) q.set("page", String(p));

    const qs = q.toString();
    return qs ? `/admin/inquiries?${qs}` : "/admin/inquiries";
  };

  // Status Tabs
  const tabs: LinkTab[] = [
    {
      href: buildUrl({ status: "all", page: 1 }),
      label: "All",
      active: currentStatus === "all",
      count: data.counts.all,
    },
    ...INQUIRY_STATUS.map((s) => ({
      href: buildUrl({ status: s, page: 1 }),
      label: statusLabel(s),
      active: currentStatus === s,
      count: data.counts[s],
    })),
  ];

  const columns: DataTableColumn<InquiryAdminListItem>[] = [
    {
      key: "ref",
      header: "Reference",
      mobile: "title",
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-ink hover:text-em7 transition-colors">
            {row.ref}
          </span>
          <div className="md:hidden text-[12px] text-ink6">
            {row.name} · +91 {row.phone}
          </div>
        </div>
      ),
    },
    {
      key: "name",
      header: "Seeker",
      mobile: "meta",
      cell: (row) => (
        <div>
          <div className="font-semibold text-ink">{row.name}</div>
          <div className="font-mono text-[12px] text-ink6">+91 {row.phone}</div>
        </div>
      ),
    },
    {
      key: "target",
      header: "Course / Ritual",
      mobile: "meta",
      cell: (row) => {
        const title =
          row.kind === "course"
            ? row.courseKey
              ? `${row.courseKey.charAt(0).toUpperCase() + row.courseKey.slice(1)} Sadhana`
              : "Sadhana Course"
            : `Ritual (${row.area || "General"})`;
        return (
          <div>
            <span className="font-medium text-ink">{title}</span>
            <span className="block text-[11px] text-ink6 capitalize">{row.kind}</span>
          </div>
        );
      },
    },
    {
      key: "city",
      header: "City",
      mobile: "meta",
      cell: (row) => <span className="text-ink">{row.city}</span>,
    },
    {
      key: "created",
      header: "Submitted",
      mobile: "meta",
      cell: (row) => (
        <span className="font-mono text-[12px] text-ink6">
          {formatIst(row.createdAt)}
        </span>
      ),
    },
    {
      key: "nextAction",
      header: "Next Action",
      mobile: "meta",
      cell: (row) => (
        <span className="text-[12px] text-ink">
          {row.nextActionAt ? formatIst(row.nextActionAt) : "—"}
        </span>
      ),
    },
    {
      key: "assignee",
      header: "Assignee",
      mobile: "meta",
      cell: (row) => (
        <span className="text-[12px] text-ink6">
          {row.assigneeName || "Unassigned"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      mobile: "badge",
      cell: (row) => (
        <StatusBadge tone={statusTone(row.status)}>
          {statusLabel(row.status)}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inquiries"
        description="Course enrollment applications and special ritual requests pipeline."
      />

      {/* Status Filter Tabs */}
      <LinkTabs tabs={tabs} />

      {/* Toolbar: Search + Kind Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchBox
            placeholder="Search by ref, name, phone, city…"
            defaultValue={search}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-medium text-ink6">Filter Kind:</span>
          <div className="flex rounded-field border border-s2 bg-cream p-0.5 text-[12.5px]">
            <Link
              href={buildUrl({ kind: "all", page: 1 })}
              className={`rounded-sm px-2.5 py-1 font-semibold transition-colors ${
                currentKind === "all" ? "bg-em7 text-iv" : "text-ink6 hover:text-ink"
              }`}
            >
              All
            </Link>
            <Link
              href={buildUrl({ kind: "course", page: 1 })}
              className={`rounded-sm px-2.5 py-1 font-semibold transition-colors ${
                currentKind === "course" ? "bg-em7 text-iv" : "text-ink6 hover:text-ink"
              }`}
            >
              Courses
            </Link>
            <Link
              href={buildUrl({ kind: "ritual", page: 1 })}
              className={`rounded-sm px-2.5 py-1 font-semibold transition-colors ${
                currentKind === "ritual" ? "bg-em7 text-iv" : "text-ink6 hover:text-ink"
              }`}
            >
              Rituals
            </Link>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        rows={data.items}
        columns={columns}
        rowHref={(row) => `/admin/inquiries/${row.id}`}
        empty={
          <EmptyState
            icon="chat"
            title="No inquiries found"
            description={
              search
                ? `No inquiries matching "${search}".`
                : "No inquiries currently in this status tab."
            }
          />
        }
      />

      {/* Pagination */}
      {data.totalPages > 1 && (
        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          baseUrl={buildUrl({ page: 1 })}
        />
      )}
    </div>
  );
}
