"use client";

import { useSearchParams } from "next/navigation";
import { LinkTabs, type LinkTab } from "@/components/admin/ui/Tabs";
import type { OrderAdminTab } from "@/lib/validation/order-admin";

export type OrderTabsProps = {
  counts: Record<OrderAdminTab, number>;
  activeTab: OrderAdminTab;
};

const TAB_CONFIG: { tab: OrderAdminTab; label: string }[] = [
  { tab: "all", label: "All Orders" },
  { tab: "new", label: "New" },
  { tab: "energizing", label: "Energizing" },
  { tab: "packed", label: "Packed" },
  { tab: "shipped", label: "Shipped" },
  { tab: "delivered", label: "Delivered" },
  { tab: "pending_payment", label: "Pending Payment" },
  { tab: "cancelled", label: "Cancelled" },
  { tab: "attention", label: "Needs Attention" },
];

export function OrderTabs({ counts, activeTab }: OrderTabsProps): React.JSX.Element {
  const searchParams = useSearchParams();

  const tabs: LinkTab[] = TAB_CONFIG.map(({ tab, label }) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    params.delete("page"); // reset page on tab switch

    const qs = params.toString();
    const href = qs ? `/admin/orders?${qs}` : "/admin/orders";

    return {
      href,
      label,
      active: activeTab === tab,
      count: counts[tab],
    };
  });

  return (
    <div className="overflow-x-auto pb-1">
      <LinkTabs tabs={tabs} />
    </div>
  );
}
