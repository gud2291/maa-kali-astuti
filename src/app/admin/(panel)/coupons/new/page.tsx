import { requireAdminPage } from "@/server/auth/guards";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { CouponForm } from "@/components/admin/coupons/CouponForm";

export default async function NewCouponPage(): Promise<React.JSX.Element> {
  await requireAdminPage("coupons.edit");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Coupon"
        description="Set up a new discount code with custom percentage or flat savings."
        backHref="/admin/coupons"
        backLabel="Coupons"
      />

      <CouponForm />
    </div>
  );
}
