"use client";

import { z } from "zod";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { MoneyField } from "@/components/admin/form/MoneyField";
import { NumberField } from "@/components/admin/form/NumberField";
import { SwitchField } from "@/components/admin/form/SwitchField";
import { DateField } from "@/components/admin/form/DateField";
import { FormBar } from "@/components/admin/form/FormBar";
import { useActionForm, useLeaveGuard } from "@/components/admin/form/useActionForm";
import { updateSettingAction } from "@/server/settings/admin-actions";
import type { SettingsMap } from "@/lib/validation/settings";

const storeFormSchema = z.object({
  freeShippingInr: z.number().int().min(0, "Must be 0 or more"),
  shippingInr: z.number().int().min(0, "Must be 0 or more"),
  expressInr: z.number().int().min(0, "Must be 0 or more"),
  codEnabled: z.boolean(),
  codFeeInr: z.number().int().min(0, "Must be 0 or more"),
  codMaxInr: z.number().int().min(0, "Must be 0 or more"),
  giftWrapInr: z.number().int().min(0, "Must be 0 or more"),
  energizationInr: z.number().int().min(0, "Must be 0 or more"),
  maxLineQty: z.number().int().min(1, "Must be at least 1"),
  standardDaysMin: z.number().int().min(0, "Must be 0 or more"),
  standardDaysMax: z.number().int().min(0, "Must be 0 or more"),
  expressDaysMin: z.number().int().min(0, "Must be 0 or more"),
  expressDaysMax: z.number().int().min(0, "Must be 0 or more"),
  onlinePayments: z.boolean(),
  nextMahapuja: z.string().nullable().optional(),
});

type StoreFormData = z.infer<typeof storeFormSchema>;

export type StoreFormProps = {
  initialValues: SettingsMap["store"];
};

export function StoreForm({ initialValues }: StoreFormProps): React.JSX.Element {
  const { form, submit, pending } = useActionForm({
    schema: storeFormSchema,
    defaultValues: {
      freeShippingInr: initialValues.freeShippingInr,
      shippingInr: initialValues.shippingInr,
      expressInr: initialValues.expressInr,
      codEnabled: initialValues.codEnabled,
      codFeeInr: initialValues.codFeeInr,
      codMaxInr: initialValues.codMaxInr,
      giftWrapInr: initialValues.giftWrapInr,
      energizationInr: initialValues.energizationInr,
      maxLineQty: initialValues.maxLineQty,
      standardDaysMin: initialValues.standardDays[0],
      standardDaysMax: initialValues.standardDays[1],
      expressDaysMin: initialValues.expressDays[0],
      expressDaysMax: initialValues.expressDays[1],
      onlinePayments: initialValues.onlinePayments,
      nextMahapuja: initialValues.nextMahapuja ?? "",
    },
    action: async (values: StoreFormData) => {
      const mahapuja =
        values.nextMahapuja && values.nextMahapuja.trim() !== ""
          ? values.nextMahapuja.trim()
          : null;

      return await updateSettingAction({
        key: "store",
        value: {
          freeShippingInr: values.freeShippingInr,
          shippingInr: values.shippingInr,
          expressInr: values.expressInr,
          codEnabled: values.codEnabled,
          codFeeInr: values.codFeeInr,
          codMaxInr: values.codMaxInr,
          giftWrapInr: values.giftWrapInr,
          energizationInr: values.energizationInr,
          maxLineQty: values.maxLineQty,
          standardDays: [values.standardDaysMin, values.standardDaysMax],
          expressDays: [values.expressDaysMin, values.expressDaysMax],
          onlinePayments: values.onlinePayments,
          nextMahapuja: mahapuja,
        },
      });
    },
    successMessage: "Store settings saved successfully",
  });

  const { control, formState: { isDirty } } = form;
  useLeaveGuard(isDirty);

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      {/* ── Shipping & Delivery ─────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Shipping & Delivery Fees"
          description="Configure thresholds, standard and express courier pricing, and estimated transit days."
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MoneyField
              name="freeShippingInr"
              control={control}
              label="Free Shipping Threshold (₹)"
              hint="Free shipping on cart totals above this"
              required
            />
            <MoneyField
              name="shippingInr"
              control={control}
              label="Standard Shipping Fee (₹)"
              hint="Standard delivery charge"
              required
            />
            <MoneyField
              name="expressInr"
              control={control}
              label="Express Shipping Fee (₹)"
              hint="Speed courier delivery surcharge"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-s2">
            <div>
              <p className="text-[13px] font-semibold text-ink mb-2">Standard Delivery Days (Min–Max)</p>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  name="standardDaysMin"
                  control={control}
                  label="Min Days"
                  required
                />
                <NumberField
                  name="standardDaysMax"
                  control={control}
                  label="Max Days"
                  required
                />
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink mb-2">Express Delivery Days (Min–Max)</p>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  name="expressDaysMin"
                  control={control}
                  label="Min Days"
                  required
                />
                <NumberField
                  name="expressDaysMax"
                  control={control}
                  label="Max Days"
                  required
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Payment Options ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Payment Methods & Cash on Delivery (COD)"
          description="Control online checkout through Razorpay and COD availability."
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SwitchField
              name="onlinePayments"
              control={control}
              label="Enable Online Payments"
              description="Allow UPI, Cards, NetBanking via Razorpay"
            />
            <SwitchField
              name="codEnabled"
              control={control}
              label="Enable Cash on Delivery (COD)"
              description="Allow customers to pay cash upon parcel receipt"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-s2">
            <MoneyField
              name="codFeeInr"
              control={control}
              label="COD Handling Fee (₹)"
              hint="Added to order total for COD payments"
              required
            />
            <MoneyField
              name="codMaxInr"
              control={control}
              label="Max COD Order Value (₹)"
              hint="COD will be unavailable above this order value"
              required
            />
          </div>
        </CardBody>
      </Card>

      {/* ── Product & Checkout Extras ────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Cart Extras & Mahapuja Date"
          description="Gift wrap fee, Vedic energization ritual pricing, max line quantities, and upcoming Mahapuja date."
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MoneyField
              name="giftWrapInr"
              control={control}
              label="Gift Wrap Fee (₹)"
              hint="Per order premium packaging"
              required
            />
            <MoneyField
              name="energizationInr"
              control={control}
              label="Energization Fee (₹)"
              hint="Per energized item puja charge"
              required
            />
            <NumberField
              name="maxLineQty"
              control={control}
              label="Max Quantity Per Line"
              hint="Limit per cart line item"
              required
            />
          </div>

          <div className="pt-2 border-t border-s2">
            <DateField
              name="nextMahapuja"
              control={control}
              label="Next Mahapuja Date (Leave empty for automatic)"
              hint="Date shown to customers for item energization. When empty, next muhurat is calculated automatically."
            />
          </div>
        </CardBody>
      </Card>

      <FormBar
        pending={pending}
        dirty={isDirty}
        cancelHref="/admin/settings"
        saveLabel="Save Store Settings"
      />
    </form>
  );
}
