import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { listRegistered, listGuests, type CustomerListItem, type GuestListItem } from "@/server/customers/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { CustomerExportButton } from "@/components/admin/customers/CustomerSummary";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("customers.view");

  const sp = await searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "registered";
  const search = typeof sp.search === "string" ? sp.search : "";
  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const isGuests = tab === "guests";

  const [registeredData, guestsData] = await Promise.all([
    !isGuests ? listRegistered({ search, page }) : Promise.resolve(null),
    isGuests ? listGuests({ search, page }) : Promise.resolve(null),
  ]);

  const registeredColumns: DataTableColumn<CustomerListItem>[] = [
    {
      key: "name",
      header: "Customer",
      mobile: "title",
      cell: (c) => (
        <div>
          <Link
            href={`/admin/customers/${c.key}`}
            className="font-sans text-[13.5px] font-semibold text-em7 hover:underline"
          >
            {c.name || "Unnamed Customer"}
          </Link>
          <div className="font-sans text-[12px] text-ink6">
            {c.email}
            {c.phone && <span> · {c.phone}</span>}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      mobile: "badge",
      cell: (c) => (
        <StatusBadge tone={c.status === "blocked" ? "danger" : "ok"}>
          {c.status}
        </StatusBadge>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      mobile: "meta",
      cell: (c) => (
        <span className="font-sans text-[13px] font-medium text-ink">
          {c.ordersCount}
        </span>
      ),
    },
    {
      key: "spent",
      header: "Total Spent",
      mobile: "meta",
      cell: (c) => (
        <span className="font-sans text-[13px] font-bold text-g7">
          {fmt(c.totalSpentInr)}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      mobile: "meta",
      cell: (c) => (
        <span className="font-sans text-[12px] text-ink6">
          {formatIst(c.createdAt, { date: true })}
        </span>
      ),
    },
  ];

  const guestColumns: DataTableColumn<GuestListItem>[] = [
    {
      key: "email",
      header: "Customer",
      mobile: "title",
      cell: (g) => (
        <div>
          <Link
            href={`/admin/customers/${g.key}`}
            className="font-sans text-[13.5px] font-semibold text-em7 hover:underline"
          >
            {g.email}
          </Link>
          <div className="font-sans text-[12px] text-ink6">
            {g.name || "Guest buyer"}
            {g.phone && <span> · {g.phone}</span>}
          </div>
        </div>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      mobile: "meta",
      cell: (g) => (
        <span className="font-sans text-[13px] font-medium text-ink">
          {g.ordersCount}
        </span>
      ),
    },
    {
      key: "spent",
      header: "Total Spent",
      mobile: "meta",
      cell: (g) => (
        <span className="font-sans text-[13px] font-bold text-g7">
          {fmt(g.totalSpentInr)}
        </span>
      ),
    },
    {
      key: "lastOrder",
      header: "Last Order",
      mobile: "meta",
      cell: (g) => (
        <span className="font-sans text-[12px] text-ink6">
          {formatIst(g.lastOrderAt, { date: true })}
        </span>
      ),
    },
  ];

  const currentData = isGuests ? guestsData! : registeredData!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Browse registered accounts and guest buyer history"
        actions={
          <div className="flex items-center gap-3">
            <CustomerExportButton />
          </div>
        }
      />

      {/* Tabs and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tab switcher */}
        <div className="flex items-center rounded-btn bg-s1/60 p-1 border border-s2">
          <Link
            href={`/admin/customers?tab=registered${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className={`rounded-btn px-4 py-1.5 font-sans text-[13px] font-semibold transition-colors no-underline ${
              !isGuests
                ? "bg-cream text-ink shadow-sm"
                : "text-ink6 hover:text-ink"
            }`}
          >
            Registered
          </Link>
          <Link
            href={`/admin/customers?tab=guests${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className={`rounded-btn px-4 py-1.5 font-sans text-[13px] font-semibold transition-colors no-underline ${
              isGuests
                ? "bg-cream text-ink shadow-sm"
                : "text-ink6 hover:text-ink"
            }`}
          >
            Guest Buyers
          </Link>
        </div>

        {/* Search form */}
        <form
          method="GET"
          action="/admin/customers"
          className="relative max-w-sm flex-1"
        >
          <input type="hidden" name="tab" value={tab} />
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-ink6">
            <AdminIcon name="search" className="size-4" />
          </span>
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder={
              isGuests
                ? "Search guests by email, name, phone..."
                : "Search customers by name, email, phone..."
            }
            className="w-full rounded-btn border border-s2 bg-cream py-1.5 pl-9 pr-3 font-sans text-[13px] text-ink placeholder:text-ink6 focus:border-g5 focus:outline-none"
          />
        </form>
      </div>

      {/* Data Table */}
      {!isGuests ? (
        <DataTable
          rows={registeredData!.items}
          columns={registeredColumns}
          empty={
            <EmptyState
              icon="user"
              title="No registered customers found"
              body={
                search
                  ? `No customers matched "${search}".`
                  : "No registered customers in the database yet."
              }
            />
          }
        />
      ) : (
        <DataTable
          rows={guestsData!.items}
          columns={guestColumns}
          empty={
            <EmptyState
              icon="user"
              title="No guest buyers found"
              body={
                search
                  ? `No guest orders matched "${search}".`
                  : "No guest orders recorded yet."
              }
            />
          }
        />
      )}

      {/* Pagination */}
      {currentData.totalPages > 1 && (
        <Pagination
          currentPage={currentData.page}
          totalPages={currentData.totalPages}
        />
      )}
    </div>
  );
}
