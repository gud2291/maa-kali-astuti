import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { listCoupons, type CouponRow } from "@/server/coupons/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchBox } from "@/components/admin/ui/SearchBox";
import { FilterSelect } from "@/components/admin/ui/FilterSelect";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { fmt } from "@/lib/core/format";

export default async function CouponsListPage(props: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("coupons.edit");

  const sp = await props.searchParams;
  const search = sp.q;
  const status = sp.status as "active" | "inactive" | "expired" | undefined;
  const page = Number(sp.page) || 1;

  const { rows, total, totalPages } = await listCoupons({
    search,
    status,
    page,
  });

  const now = new Date().getTime();

  const columns: DataTableColumn<CouponRow>[] = [
    {
      key: "code",
      header: "Code",
      cell: (row) => (
        <div className="flex flex-col">
          <Link
            href={`/admin/coupons/${row.id}`}
            className="font-mono text-[14px] font-bold text-em7 hover:underline tracking-wide"
          >
            {row.code}
          </Link>
          {row.note && (
            <span className="text-[12px] text-ink6 line-clamp-1">{row.note}</span>
          )}
        </div>
      ),
    },
    {
      key: "rule",
      header: "Discount Rule",
      cell: (row) => {
        if (row.kind === "percent") {
          return (
            <div className="text-[13.5px] font-medium text-ink">
              <span>{row.value}% off</span>
              {row.maxDiscountInr && (
                <span className="text-ink6 text-[12px] block">
                  (Capped at {fmt(row.maxDiscountInr)})
                </span>
              )}
            </div>
          );
        }
        return (
          <div className="text-[13.5px] font-medium text-ink">
            <span>{fmt(row.value)} flat discount</span>
          </div>
        );
      },
    },
    {
      key: "minCart",
      header: "Min Cart",
      cell: (row) => (
        <span className="text-[13px] text-ink6">
          {row.minCartInr > 0 ? fmt(row.minCartInr) : "No minimum"}
        </span>
      ),
    },
    {
      key: "usage",
      header: "Usage",
      cell: (row) => (
        <div className="text-[13px] text-ink">
          <span>{row.usedCount}</span>
          <span className="text-ink6">
            {" "}
            / {row.usageLimit != null ? row.usageLimit : "∞"}
          </span>
          {row.firstOrderOnly && (
            <span className="block text-[11px] font-medium text-em7">
              First order only
            </span>
          )}
        </div>
      ),
    },
    {
      key: "dates",
      header: "Validity",
      cell: (row) => {
        const starts = row.startsAt
          ? new Date(row.startsAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })
          : null;
        const ends = row.endsAt
          ? new Date(row.endsAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : null;

        if (!starts && !ends) {
          return <span className="text-[13px] text-ink6">Always valid</span>;
        }

        return (
          <div className="text-[12.5px] text-ink6">
            {starts && <div>From {starts}</div>}
            {ends ? <div>Until {ends}</div> : <div>No expiry</div>}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      mobile: "badge",
      cell: (row) => {
        const isExpired = row.endsAt && new Date(row.endsAt).getTime() < now;
        if (!row.active) {
          return <StatusBadge tone="muted">Inactive</StatusBadge>;
        }
        if (isExpired) {
          return <StatusBadge tone="warn">Expired</StatusBadge>;
        }
        return <StatusBadge tone="ok">Active</StatusBadge>;
      },
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-16",
      cell: (row) => (
        <Link
          href={`/admin/coupons/${row.id}`}
          className="text-ink6 hover:text-em7 font-sans text-[13px] font-medium hover:underline"
        >
          Edit
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons & Promotions"
        description="Create discount codes, set cart restrictions, and monitor usage limits."
        actions={
          <Link
            href="/admin/coupons/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-btn bg-em7 px-3.5 font-sans text-[13px] font-semibold text-iv shadow-sm transition-colors hover:bg-em9"
          >
            <div className="size-4">
              <AdminIcon name="plus" />
            </div>
            <span>New Coupon</span>
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <SearchBox
            placeholder="Search code or note..."
            defaultValue={search}
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect
            paramName="status"
            label="Status"
            allLabel="All Statuses"
            defaultValue={status}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "expired", label: "Expired" },
            ]}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="gift"
          title="No coupons found"
          description="Create your first promotional discount code to reward customers."
          actionHref="/admin/coupons/new"
          actionLabel="Create Coupon"
        />
      ) : (
        <>
          <DataTable
            data={rows}
            columns={columns}
            keyField="id"
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={20}
          />
        </>
      )}
    </div>
  );
}
