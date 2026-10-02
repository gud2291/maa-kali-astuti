import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { can } from "@/lib/domain/permissions";
import { formatIst } from "@/lib/core/ist";
import { navFor } from "@/components/admin/nav";
import { AdminIcon } from "@/components/admin/AdminIcon";
import {
  getKpis,
  getRevenueSeries,
  getRecentOrders,
  getUpcomingBookings,
  getTopProducts,
  getLowStockProducts,
} from "@/server/dashboard/queries";
import { KpiGrid } from "@/components/admin/dashboard/KpiGrid";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders";
import { UpcomingBookings } from "@/components/admin/dashboard/UpcomingBookings";
import { TopProducts } from "@/components/admin/dashboard/TopProducts";
import { LowStockList } from "@/components/admin/dashboard/LowStockList";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const admin = await requireAdminPage("dashboard.view");
  const sp = await searchParams;
  const isDenied = sp.denied === "1";

  const todayDate = formatIst(new Date(), { date: true, weekday: true });
  const hasOrdersView = can(admin.role, "orders.view");

  // Content-only roles (e.g. editor) see only quick links
  if (!hasOrdersView) {
    const permittedItems = navFor(admin.role);

    return (
      <div className="space-y-6">
        {/* Denied Notice */}
        {isDenied && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-btn border border-sin/30 bg-rose/40 px-4 py-3 font-sans text-[14px] font-medium text-sin"
          >
            <span className="block size-5 flex-none">
              <AdminIcon name="alert" />
            </span>
            <span>You don't have access to that page.</span>
          </div>
        )}

        {/* Greeting Card */}
        <div className="rounded-xl border border-s2 bg-cream p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Namaste, {admin.name || "Admin"}
              </h2>
              <p className="mt-1 font-sans text-[14px] text-ink6">
                Welcome to the Maa Kali Astuti admin workspace.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-pill bg-s1 px-3.5 py-1.5 font-sans text-[12.5px] font-medium text-ink">
              <span className="block size-4 text-g7 flex-none">
                <AdminIcon name="calendar" />
              </span>
              <span>{todayDate}</span>
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-ink">Quick Access</h3>
            <span className="font-sans text-[12px] text-ink6">
              {permittedItems.length} section{permittedItems.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {permittedItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col justify-between rounded-xl border border-s2 bg-cream p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-g5/50 hover:shadow-md no-underline"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="grid size-10 place-items-center rounded-btn bg-s1 text-em7 transition-colors group-hover:bg-em7 group-hover:text-iv">
                      <AdminIcon name={item.icon} className="size-5" />
                    </span>
                    <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-g7">
                      {item.group}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="font-serif text-[18px] font-bold text-ink transition-colors group-hover:text-em7">
                      {item.label}
                    </div>
                    <p className="mt-1 font-sans text-[12.5px] text-ink6">
                      Manage {item.label.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-1 font-sans text-[12.5px] font-semibold text-em7 group-hover:text-em5">
                  <span>Open</span>
                  <AdminIcon
                    name="arrowR"
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Full dashboard for roles with orders.view
  const [kpis, series, recentOrders, upcomingBookings, topProducts, lowStock] =
    await Promise.all([
      getKpis(),
      getRevenueSeries(30),
      getRecentOrders(8),
      getUpcomingBookings(8),
      getTopProducts(30, 5),
      getLowStockProducts(8),
    ]);

  return (
    <div className="space-y-6">
      {/* Denied Notice */}
      {isDenied && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-btn border border-sin/30 bg-rose/40 px-4 py-3 font-sans text-[14px] font-medium text-sin"
        >
          <span className="block size-5 flex-none">
            <AdminIcon name="alert" />
          </span>
          <span>You don't have access to that page.</span>
        </div>
      )}

      {/* Greeting Card */}
      <div className="rounded-xl border border-s2 bg-cream p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Namaste, {admin.name || "Admin"}
            </h2>
            <p className="mt-1 font-sans text-[14px] text-ink6">
              Welcome to the Maa Kali Astuti operational dashboard.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-pill bg-s1 px-3.5 py-1.5 font-sans text-[12.5px] font-medium text-ink">
            <span className="block size-4 text-g7 flex-none">
              <AdminIcon name="calendar" />
            </span>
            <span>{todayDate}</span>
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <KpiGrid kpis={kpis} />

      {/* 30-Day Revenue Chart */}
      <RevenueChart data={series} />

      {/* Two columns: Recent Orders & Upcoming Bookings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentOrders orders={recentOrders} />
        <UpcomingBookings bookings={upcomingBookings} />
      </div>

      {/* Two columns: Top Products & Low Stock Items */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopProducts products={topProducts} />
        <LowStockList products={lowStock} />
      </div>
    </div>
  );
}
