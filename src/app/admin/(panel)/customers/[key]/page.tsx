import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth/guards";
import { getCustomer } from "@/server/customers/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { CustomerSummary } from "@/components/admin/customers/CustomerSummary";
import { CustomerHistory } from "@/components/admin/customers/CustomerHistory";
import { AppError } from "@/server/result";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("customers.view");

  const { key } = await params;

  let data;
  try {
    data = await getCustomer(key);
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/customers"
        backLabel="All Customers"
        title={data.profile.name || data.profile.email}
        description={
          data.profile.kind === "registered"
            ? `Registered customer account #${data.profile.userId}`
            : "Guest buyer history"
        }
      />

      {/* Customer Summary & Action bar */}
      <CustomerSummary
        profile={data.profile}
        ltv={data.ltv}
        ordersCount={data.ordersCount}
        firstOrderAt={data.firstOrderAt}
        lastOrderAt={data.lastOrderAt}
      />

      {/* Customer History across Orders, Consultations, Kundali, and Inquiries */}
      <div className="space-y-3">
        <h3 className="font-serif text-[18px] font-bold text-ink">
          Customer Activity & History
        </h3>
        <CustomerHistory
          orders={data.orders}
          bookings={data.bookings}
          kundaliOrders={data.kundaliOrders}
          inquiries={data.inquiries}
        />
      </div>
    </div>
  );
}
