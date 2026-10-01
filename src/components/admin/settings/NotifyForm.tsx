"use client";

import { useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { SwitchField } from "@/components/admin/form/SwitchField";
import { FormBar } from "@/components/admin/form/FormBar";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { useActionForm, useLeaveGuard } from "@/components/admin/form/useActionForm";
import { updateSettingAction } from "@/server/settings/admin-actions";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { SettingsMap } from "@/lib/validation/settings";

const notifyFormSchema = z.object({
  adminEmails: z
    .array(
      z.object({
        email: z.string().trim().email("Please enter a valid email address").max(120),
      }),
    )
    .min(1, "At least one recipient email is required")
    .max(5, "Maximum 5 alert recipient emails allowed"),
  orderAlerts: z.boolean(),
  bookingAlerts: z.boolean(),
  inquiryAlerts: z.boolean(),
});

type NotifyFormData = z.infer<typeof notifyFormSchema>;

export type NotifyFormProps = {
  initialValues: SettingsMap["notify"];
};

export function NotifyForm({ initialValues }: NotifyFormProps): React.JSX.Element {
  const defaultEmails =
    initialValues.adminEmails.length > 0
      ? initialValues.adminEmails.map((e) => ({ email: e }))
      : [{ email: "" }];

  const { form, submit, pending } = useActionForm({
    schema: notifyFormSchema,
    defaultValues: {
      adminEmails: defaultEmails,
      orderAlerts: initialValues.orderAlerts,
      bookingAlerts: initialValues.bookingAlerts,
      inquiryAlerts: initialValues.inquiryAlerts,
    },
    action: async (values: NotifyFormData) => {
      const emailList = values.adminEmails
        .map((item) => item.email.trim().toLowerCase())
        .filter((e) => e !== "");

      return await updateSettingAction({
        key: "notify",
        value: {
          adminEmails: emailList,
          orderAlerts: values.orderAlerts,
          bookingAlerts: values.bookingAlerts,
          inquiryAlerts: values.inquiryAlerts,
        },
      });
    },
    successMessage: "Notification settings saved successfully",
  });

  const { control, formState: { isDirty, errors }, register } = form;
  useLeaveGuard(isDirty);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "adminEmails",
  });

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      {/* ── Alert Recipient Emails ─────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Admin Notification Recipients"
          description="Designate up to 5 team email addresses to receive real-time operational notifications."
        />
        <CardBody className="space-y-4">
          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    {...register(`adminEmails.${idx}.email` as const)}
                    type="email"
                    placeholder="admin@example.com"
                    className="w-full rounded-field border border-s2 bg-cream/30 px-3.5 py-2 font-sans text-[14px] text-ink outline-none transition-colors focus:border-em7 focus:bg-cream"
                  />
                  {errors.adminEmails?.[idx]?.email && (
                    <p className="mt-1 text-[12px] text-sin font-medium">
                      {errors.adminEmails[idx]?.email?.message}
                    </p>
                  )}
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="p-2 text-ink6 hover:text-sin transition-colors cursor-pointer rounded-btn"
                    title="Remove recipient"
                    aria-label="Remove recipient"
                  >
                    <div className="size-4">
                      <AdminIcon name="trash" />
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>

          {errors.adminEmails && !Array.isArray(errors.adminEmails) && (
            <p className="text-[12px] text-sin font-medium">
              {errors.adminEmails.message}
            </p>
          )}

          {fields.length < 5 && (
            <div>
              <button
                type="button"
                onClick={() => append({ email: "" })}
                className={cn(
                  buttonClass("outline", "xs"),
                  "flex items-center gap-1.5 h-8 text-[12.5px] cursor-pointer",
                )}
              >
                <div className="size-3.5">
                  <AdminIcon name="plus" />
                </div>
                <span>Add Email Address</span>
              </button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Notification Toggles ────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="System Event Triggers"
          description="Toggle which store and consultation events send alert emails to the recipients above."
        />
        <CardBody className="space-y-4">
          <div className="space-y-4">
            <SwitchField
              name="orderAlerts"
              control={control}
              label="New Store Orders"
              description="Receive an email when a customer places an order or completes payment"
            />
            <div className="pt-2 border-t border-s2">
              <SwitchField
                name="bookingAlerts"
                control={control}
                label="New Consultation Bookings"
                description="Receive an email when a devotee books an appointment with Sadhak Ji"
              />
            </div>
            <div className="pt-2 border-t border-s2">
              <SwitchField
                name="inquiryAlerts"
                control={control}
                label="Sadhana & Ritual Inquiries"
                description="Receive an email when a student or devotee submits a course or ritual inquiry"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <FormBar
        pending={pending}
        dirty={isDirty}
        cancelHref="/admin/settings?tab=notify"
        saveLabel="Save Notification Settings"
      />
    </form>
  );
}
