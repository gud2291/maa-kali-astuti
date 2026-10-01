import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth/guards";
import { getCoupon } from "@/server/coupons/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { CouponForm } from "@/components/admin/coupons/CouponForm";

export default async function CouponDetailPage(props: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("coupons.edit");

  const { id } = await props.params;
  const couponId = Number(id);
  if (!couponId || isNaN(couponId)) {
    notFound();
  }

  const coupon = await getCoupon(couponId);
  if (!coupon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Coupon: ${coupon.code}`}
        description="Update discount parameters, expiration dates, and usage limits."
        backHref="/admin/coupons"
        backLabel="Coupons"
      />

      <CouponForm coupon={coupon} />
    </div>
  );
}
