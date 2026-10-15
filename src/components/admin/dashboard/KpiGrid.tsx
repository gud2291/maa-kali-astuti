import type { DashboardKpis } from "@/server/dashboard/queries";
import { StatCard } from "@/components/admin/ui/StatCard";
import { fmt } from "@/lib/core/format";

export type KpiGridProps = {
  kpis: DashboardKpis;
};

export function KpiGrid({ kpis }: KpiGridProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Today's Revenue"
        value={fmt(kpis.revenueToday)}
        hint={`${kpis.ordersToday} order${kpis.ordersToday === 1 ? "" : "s"} today`}
        icon="report"
        href={`/admin/orders?from=${kpis.todayKey}&to=${kpis.todayKey}`}
      />

      <StatCard
        label="Month Revenue"
        value={fmt(kpis.revenueMonth)}
        hint="This calendar month"
        icon="report"
        href={`/admin/orders?from=${kpis.monthStartKey}&to=${kpis.todayKey}`}
      />

      <StatCard
        label="Pending Energization"
        value={kpis.pendingEnergization}
        hint="Placed & energizing"
        icon="package"
        href="/admin/orders?tab=energizing"
      />

      <StatCard
        label="Consultations Today"
        value={kpis.bookingsToday}
        hint="Confirmed for today"
        icon="calendar"
        href="/admin/bookings"
      />

      <StatCard
        label="Kundali Sales (Month)"
        value={`${kpis.kundaliSalesCount} (${fmt(kpis.kundaliSalesInr)})`}
        hint="Free reports this month"
        icon="kundali"
        href="/admin/kundali"
      />

      <StatCard
        label="Open Inquiries"
        value={kpis.openInquiries}
        hint="New & scheduled"
        icon="chat"
        href="/admin/inquiries"
      />

      <StatCard
        label="Needs Attention"
        value={
          <span className={kpis.needsAttentionOrders > 0 ? "text-sin" : undefined}>
            {kpis.needsAttentionOrders}
          </span>
        }
        hint="Orders flagged for action"
        icon="alert"
        href="/admin/orders?tab=attention"
      />

      <StatCard
        label="Low Stock Items"
        value={
          <span className={kpis.lowStockCount > 0 ? "text-g7 font-bold" : undefined}>
            {kpis.lowStockCount}
          </span>
        }
        hint="At or below threshold"
        icon="tag"
        href="/admin/products?stock=low"
      />
    </div>
  );
}
