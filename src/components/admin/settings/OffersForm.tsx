"use client";

import { z } from "zod";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { MoneyField } from "@/components/admin/form/MoneyField";
import { NumberField } from "@/components/admin/form/NumberField";
import { SwitchField } from "@/components/admin/form/SwitchField";
import { FormBar } from "@/components/admin/form/FormBar";
import { useActionForm, useLeaveGuard } from "@/components/admin/form/useActionForm";
import { updateSettingAction } from "@/server/settings/admin-actions";
import type { SettingsMap } from "@/lib/validation/settings";

const kundaliFormSchema = z.object({
  enabled: z.boolean(),
  priceInr: z.number().int().min(0, "Price must be 0 or more"),
  mrpInr: z.number().int().min(0, "MRP must be 0 or more"),
});

const coursesFormSchema = z.object({
  feeInr: z.number().int().min(0, "Fee must be 0 or more"),
  instalmentsEnabled: z.boolean(),
  instalmentCount: z.number().int().min(1, "Must be at least 1").default(3),
  instalmentAmount: z.number().int().min(0, "Instalment amount must be 0 or more").default(0),
});

export type OffersFormProps = {
  initialKundali: SettingsMap["kundali"];
  initialCourses: SettingsMap["courses"];
};

export function OffersForm({
  initialKundali,
  initialCourses,
}: OffersFormProps): React.JSX.Element {
  /* ── Kundali Form ────────────────────────────────────────────────── */
  const kundaliForm = useActionForm({
    schema: kundaliFormSchema,
    defaultValues: {
      enabled: initialKundali.enabled,
      priceInr: initialKundali.priceInr,
      mrpInr: initialKundali.mrpInr,
    },
    action: async (values) => {
      return await updateSettingAction({
        key: "kundali",
        value: {
          enabled: values.enabled,
          priceInr: values.priceInr,
          mrpInr: values.mrpInr,
        },
      });
    },
    successMessage: "Kundali settings saved successfully",
  });

  /* ── Courses Form ────────────────────────────────────────────────── */
  const coursesForm = useActionForm({
    schema: coursesFormSchema,
    defaultValues: {
      feeInr: initialCourses.feeInr,
      instalmentsEnabled: Boolean(initialCourses.instalments),
      instalmentCount: initialCourses.instalments?.count ?? 3,
      instalmentAmount: initialCourses.instalments?.amountInr ?? Math.round(initialCourses.feeInr / 3),
    },
    action: async (values) => {
      return await updateSettingAction({
        key: "courses",
        value: {
          feeInr: values.feeInr,
          instalments: values.instalmentsEnabled
            ? {
                count: values.instalmentCount,
                amountInr: values.instalmentAmount,
              }
            : null,
        },
      });
    },
    successMessage: "Course fee settings saved successfully",
  });

  const kundaliDirty = kundaliForm.form.formState.isDirty;
  const coursesDirty = coursesForm.form.formState.isDirty;
  useLeaveGuard(kundaliDirty || coursesDirty);

  const instalmentsEnabled = coursesForm.form.watch("instalmentsEnabled");

  return (
    <div className="space-y-10 pb-24">
      {/* ── Kundali Pricing ─────────────────────────────────────────── */}
      <form onSubmit={kundaliForm.submit} className="space-y-6">
        <Card>
          <CardHeader
            title="Kundali Report Service"
            description="Enable or disable automated Vedic Kundali report generation and configure customer pricing."
          />
          <CardBody className="space-y-4">
            <SwitchField
              name="enabled"
              control={kundaliForm.form.control}
              label="Enable Kundali Purchase"
              description="Allow visitors to calculate birth charts and purchase PDF reports"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-s2">
              <MoneyField
                name="priceInr"
                control={kundaliForm.form.control}
                label="Offer Price (₹)"
                hint="Actual amount charged at checkout (e.g. ₹99)"
                required
              />
              <MoneyField
                name="mrpInr"
                control={kundaliForm.form.control}
                label="Original MRP (₹)"
                hint="Strikethrough reference price (e.g. ₹499)"
                required
              />
            </div>
          </CardBody>
        </Card>

        <FormBar
          pending={kundaliForm.pending}
          dirty={kundaliDirty}
          cancelHref="/admin/settings?tab=offers"
          saveLabel="Save Kundali Settings"
        />
      </form>

      {/* ── Sadhana Courses Pricing ─────────────────────────────────── */}
      <form onSubmit={coursesForm.submit} className="space-y-6">
        <Card>
          <CardHeader
            title="Sadhana & Tantra Courses"
            description="Default admission tuition fee and optional instalment breakdown plan for discipleship courses."
          />
          <CardBody className="space-y-4">
            <div className="max-w-md">
              <MoneyField
                name="feeInr"
                control={coursesForm.form.control}
                label="Standard Course Fee (₹)"
                hint="Total full-payment course fee"
                required
              />
            </div>

            <div className="pt-2 border-t border-s2 space-y-4">
              <SwitchField
                name="instalmentsEnabled"
                control={coursesForm.form.control}
                label="Enable Flexible Instalments"
                description="Allow enrolled students to split course fees across multiple payments"
              />

              {instalmentsEnabled && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-cream/40 p-4 rounded-field border border-s2">
                  <NumberField
                    name="instalmentCount"
                    control={coursesForm.form.control}
                    label="Number of Instalments"
                    hint="e.g. 3 payments"
                    required
                  />
                  <MoneyField
                    name="instalmentAmount"
                    control={coursesForm.form.control}
                    label="Per-Instalment Amount (₹)"
                    hint="e.g. ₹16,667 per instalment"
                    required
                  />
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <FormBar
          pending={coursesForm.pending}
          dirty={coursesDirty}
          cancelHref="/admin/settings?tab=offers"
          saveLabel="Save Course Fee Settings"
        />
      </form>
    </div>
  );
}
