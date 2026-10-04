"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { TextField } from "@/components/admin/form/TextField";
import { TextArea } from "@/components/admin/form/TextArea";
import { NumberField } from "@/components/admin/form/NumberField";
import { MoneyField } from "@/components/admin/form/MoneyField";
import { SelectField } from "@/components/admin/form/SelectField";
import { SwitchField } from "@/components/admin/form/SwitchField";
import { DateField } from "@/components/admin/form/DateField";
import { FormBar } from "@/components/admin/form/FormBar";
import { useActionForm, useLeaveGuard } from "@/components/admin/form/useActionForm";
import { createCouponAction, updateCouponAction } from "@/server/coupons/admin-actions";
import { couponInputSchema, type CouponInput } from "@/lib/validation/coupon";
import type { CouponRow } from "@/server/coupons/admin";
import { istDayKey } from "@/lib/core/ist";

export type CouponFormProps = {
  coupon?: CouponRow | null;
};

/** IST calendar day for the date input (coupon days are IST days). */
function toDateString(d: Date | null | undefined): string {
  if (!d) return "";
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? "" : istDayKey(t);
}

export function CouponForm({ coupon }: CouponFormProps): React.JSX.Element {
  const router = useRouter();
  const isEditing = Boolean(coupon);

  const defaultValues: CouponInput = {
    code: coupon?.code ?? "",
    kind: coupon?.kind ?? "percent",
    value: coupon?.value ?? 10,
    minCartInr: coupon?.minCartInr ?? 0,
    maxDiscountInr: coupon?.maxDiscountInr ?? null,
    startsAt: coupon?.startsAt ? new Date(coupon.startsAt) : null,
    endsAt: coupon?.endsAt ? new Date(coupon.endsAt) : null,
    usageLimit: coupon?.usageLimit ?? null,
    perCustomerLimit: coupon?.perCustomerLimit ?? null,
    firstOrderOnly: coupon?.firstOrderOnly ?? false,
    active: coupon?.active ?? true,
    note: coupon?.note ?? null,
  };

  const { form, submit, pending } = useActionForm({
    schema: couponInputSchema,
    defaultValues: {
      ...defaultValues,
      // For the DateField input value strings
      startsAt: toDateString(coupon?.startsAt) as unknown as Date,
      endsAt: toDateString(coupon?.endsAt) as unknown as Date,
    },
    action: async (values: CouponInput) => {
      if (isEditing && coupon) {
        return await updateCouponAction({
          id: coupon.id,
          ...values,
        });
      }
      return await createCouponAction(values);
    },
    onSuccess: () => {
      router.push("/admin/coupons");
      router.refresh();
    },
    successMessage: isEditing ? "Coupon updated successfully" : "Coupon created successfully",
  });

  const { control, formState: { isDirty }, watch } = form;
  useLeaveGuard(isDirty);

  const kind = watch("kind");

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      {/* ── Coupon Identity & Discount ──────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Coupon Code & Discount Rule"
          description="Unique uppercase coupon code and discount calculation parameters."
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField
              name="code"
              control={control}
              label="Coupon Code"
              hint="Uppercase alphanumeric code (e.g. DIWALI15)"
              maxLength={30}
              required
            />
            <SelectField
              name="kind"
              control={control}
              label="Discount Type"
              options={[
                { value: "percent", label: "Percentage Discount (%)" },
                { value: "flat", label: "Flat Rupee Discount (₹)" },
              ]}
              required
            />
            {kind === "percent" ? (
              <NumberField
                name="value"
                control={control}
                label="Discount Percentage (%)"
                hint="Between 1% and 90%"
                min={1}
                max={90}
                required
              />
            ) : (
              <MoneyField
                name="value"
                control={control}
                label="Discount Amount (₹)"
                hint="Whole rupees up to ₹1,00,000"
                required
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-s2">
            <MoneyField
              name="minCartInr"
              control={control}
              label="Minimum Cart Value (₹)"
              hint="Cart subtotal required to apply this coupon"
              required
            />
            {kind === "percent" ? (
              <MoneyField
                name="maxDiscountInr"
                control={control}
                label="Maximum Discount Cap (₹)"
                hint="Maximum discount amount (leave empty for uncapped)"
              />
            ) : (
              <div className="rounded-field border border-dashed border-s2 p-3.5 bg-cream/30 text-[13px] text-ink6 flex items-center">
                Maximum discount caps only apply to percentage discounts.
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── Validity & Limits ───────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Usage Limits & Validity Period"
          description="Control promotion dates, customer usage eligibility, and total redemption limits."
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DateField
              name="startsAt"
              control={control}
              label="Valid From Date"
              hint="Start date (leave empty for immediate activation)"
            />
            <DateField
              name="endsAt"
              control={control}
              label="Valid Until Date"
              hint="Expiry date (leave empty for no expiration)"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-s2">
            <NumberField
              name="usageLimit"
              control={control}
              label="Total Redemptions Limit"
              hint="Maximum times this coupon can be redeemed store-wide"
            />
            <NumberField
              name="perCustomerLimit"
              control={control}
              label="Per-Customer Limit"
              hint="Maximum redemptions per customer email"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-s2">
            <SwitchField
              name="firstOrderOnly"
              control={control}
              label="First-Time Orders Only"
              description="Restrict coupon strictly to new customers without prior orders"
            />
            <SwitchField
              name="active"
              control={control}
              label="Coupon Active"
              description="Temporarily deactivate to prevent redemptions"
            />
          </div>
        </CardBody>
      </Card>

      {/* ── Internal Notes ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Internal Reference Note"
          description="Notes visible only to administrators explaining the campaign or customer target."
        />
        <CardBody>
          <TextArea
            name="note"
            control={control}
            label="Internal Note"
            hint="Campaign context or special terms (max 200 characters)"
            maxLength={200}
            showCount
            rows={2}
          />
        </CardBody>
      </Card>

      <FormBar
        pending={pending}
        dirty={isDirty}
        cancelHref="/admin/coupons"
        saveLabel={isEditing ? "Update Coupon" : "Create Coupon"}
      />
    </form>
  );
}
