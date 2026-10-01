import dynamic from "next/dynamic";
import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { listBookings, getWeek, type BookingAdminListItem } from "@/server/bookings/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { SearchBox } from "@/components/admin/ui/SearchBox";
import { StatusBadge, type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { DayList } from "@/components/admin/bookings/DayList";
import { fmt } from "@/lib/core/format";
import { formatIst, istDayKey, weekdayOfKey, addDaysKey } from "@/lib/core/ist";
import type { BookingStatus } from "@/lib/domain/enums";
import type { BookingAdminView } from "@/lib/validation/consult-admin";

const WeekCalendar = dynamic(
  () =>
    import("@/components/admin/bookings/WeekCalendar").then(
      (m) => m.WeekCalendar,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full rounded-btn border border-s2 bg-cream animate-pulse" />
    ),
  },
);

function getStatusBadge(status: BookingStatus): {
  tone: BadgeTone;
  label: string;
} {
  switch (status) {
    case "confirmed":
      return { tone: "ok", label: "Confirmed" };
    case "pending_payment":
      return { tone: "warn", label: "Pending Payment" };
    case "completed":
      return { tone: "info", label: "Completed" };
    case "no_show":
      return { tone: "danger", label: "No Show" };
    case "cancelled":
      return { tone: "danger", label: "Cancelled" };
    case "expired":
      return { tone: "muted", label: "Expired" };
    default:
      return { tone: "muted", label: status };
  }
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    tab?: string;
    search?: string;
    page?: string;
    week?: string;
  }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("bookings.view");
  const params = await searchParams;

  const currentView = params.view === "list" ? "list" : "calendar";
  const currentTab = (params.tab as BookingAdminView) || "upcoming";
  const search = params.search || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  // Compute Monday for calendar view
  const now = new Date();
  const todayKey = istDayKey(now);
  const dow = weekdayOfKey(todayKey);
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  const currentMondayKey = addDaysKey(todayKey, diffToMonday);
  const weekStart = params.week || currentMondayKey;

  let weekData = null;
  let listData = null;

  if (currentView === "calendar") {
    weekData = await getWeek(weekStart);
  } else {
    listData = await listBookings({
      view: currentTab,
      search: search || undefined,
      page,
    });
  }

  const columns: DataTableColumn<BookingAdminListItem>[] = [
    {
      key: "ref",
      header: "Booking Ref",
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
        </div>
      ),
    },
    {
      key: "service",
      header: "Service & Package",
      cell: (row) => (
        <div>
          <div className="font-sans text-[13px] font-semibold text-ink capitalize">
            {row.serviceKey}
          </div>
          <div className="font-mono text-[11px] text-ink6 capitalize">
            {row.tierKey} package
          </div>
        </div>
      ),
    },
    {
      key: "mode",
      header: "Mode",
      cell: (row) => (
        <span className="rounded-field border border-s2 bg-cream/70 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase text-ink6">
          {row.mode}
        </span>
      ),
    },
    {
      key: "scheduled",
      header: "Scheduled Time (IST)",
      cell: (row) => (
        <div>
          {row.startAt ? (
            <>
              <div className="font-sans text-[13px] font-semibold text-ink">
                {formatIst(row.startAt, { date: true, weekday: true })}
              </div>
              <div className="font-mono text-[11.5px] text-ink6">
                {formatIst(row.startAt, { time: true, date: false })}
              </div>
            </>
          ) : (
            <span className="font-sans text-[12.5px] text-ink6 italic">
              Written Report
            </span>
          )}
        </div>
      ),
    },
    {
      key: "price",
      header: "Amount",
      cell: (row) => (
        <span className="font-mono text-[13px] font-bold text-ink">
          ₹{fmt(row.priceInr)}
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
      className: "text-right",
      cell: (row) => (
        <Link
          href={`/admin/bookings/${row.id}`}
          className="inline-flex h-7 items-center gap-1 rounded-field border border-s2 bg-cream px-2.5 font-sans text-[12px] font-semibold text-em7 hover:border-em7 hover:bg-cream no-underline"
        >
          <span>View</span>
          <span className="size-3">
            <AdminIcon name="arrowR" />
          </span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Consultation Bookings"
          description="View schedule, join links, client birth profiles, palm photos, and manage appointments."
        />

        {/* View Switcher: Calendar | List */}
        <div className="flex items-center rounded-btn border border-s2 bg-s1/40 p-1">
          <Link
            href={`/admin/bookings?view=calendar${params.week ? `&week=${params.week}` : ""}`}
            className={`flex items-center gap-1.5 rounded-btn px-3 py-1.5 font-sans text-[13px] font-semibold transition-colors no-underline ${
              currentView === "calendar"
                ? "bg-cream text-em7 shadow-2xs"
                : "text-ink6 hover:text-ink"
            }`}
          >
            <span className="size-4">
              <AdminIcon name="calendar" />
            </span>
            <span>Calendar</span>
          </Link>

          <Link
            href="/admin/bookings?view=list"
            className={`flex items-center gap-1.5 rounded-btn px-3 py-1.5 font-sans text-[13px] font-semibold transition-colors no-underline ${
              currentView === "list"
                ? "bg-cream text-em7 shadow-2xs"
                : "text-ink6 hover:text-ink"
            }`}
          >
            <span className="size-4">
              <AdminIcon name="menu" />
            </span>
            <span>List</span>
          </Link>
        </div>
      </div>

      {currentView === "calendar" && weekData && (
        <div className="space-y-4">
          <div className="hidden md:block">
            <WeekCalendar data={weekData} />
          </div>
          <DayList data={weekData} />
        </div>
      )}

      {currentView === "list" && listData && (
        <div className="space-y-4">
          {/* Tabs and Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-s2 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {(["upcoming", "pending", "past", "all"] as const).map((t) => {
                const isActive = currentTab === t;
                return (
                  <Link
                    key={t}
                    href={`/admin/bookings?view=list&tab=${t}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                    className={`rounded-btn px-3.5 py-1.5 font-sans text-[13px] font-semibold capitalize transition-colors no-underline ${
                      isActive
                        ? "bg-em7 text-cream"
                        : "text-ink6 hover:bg-s1/60 hover:text-ink"
                    }`}
                  >
                    {t === "pending" ? "Pending Payment" : t}
                  </Link>
                );
              })}
            </div>

            <div className="w-full sm:w-64">
              <SearchBox placeholder="Search by name, phone, ref..." />
            </div>
          </div>

          <DataTable
            rows={listData.items}
            columns={columns}
            rowHref={(r) => `/admin/bookings/${r.id}`}
            empty={
              <EmptyState
                icon="calendar"
                title="No bookings found"
                description={
                  search
                    ? `No bookings matching "${search}".`
                    : "No bookings in this tab view."
                }
              />
            }
          />

          {listData.totalPages > 1 && (
            <div className="flex justify-end pt-2">
              <Pagination
                page={listData.page}
                totalPages={listData.totalPages}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
