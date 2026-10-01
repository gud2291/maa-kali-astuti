"use client";

import { z } from "zod";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { TextField } from "@/components/admin/form/TextField";
import { TextArea } from "@/components/admin/form/TextArea";
import { FormBar } from "@/components/admin/form/FormBar";
import { useActionForm, useLeaveGuard } from "@/components/admin/form/useActionForm";
import { updateSettingAction } from "@/server/settings/admin-actions";
import type { SettingsMap } from "@/lib/validation/settings";

const gstinRegex = /^[0-9A-Z]{15}$/;

const invoiceFormSchema = z.object({
  legalName: z.string().min(1, "Legal business name is required").max(200),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => val === "" || gstinRegex.test(val), {
      message: "GSTIN must be a 15-character alphanumeric code or left empty",
    })
    .default(""),
  address: z.string().max(500).default(""),
  stateCode: z.string().max(10).default(""),
  prefix: z.string().min(1, "Invoice prefix is required").max(10).default("MKA"),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

export type InvoiceFormProps = {
  initialValues: SettingsMap["invoice"];
};

export function InvoiceForm({ initialValues }: InvoiceFormProps): React.JSX.Element {
  const { form, submit, pending } = useActionForm({
    schema: invoiceFormSchema,
    defaultValues: {
      legalName: initialValues.legalName,
      gstin: initialValues.gstin ?? "",
      address: initialValues.address,
      stateCode: initialValues.stateCode,
      prefix: initialValues.prefix,
    },
    action: async (values: InvoiceFormData) => {
      const gstinVal = values.gstin.trim();
      return await updateSettingAction({
        key: "invoice",
        value: {
          legalName: values.legalName,
          gstin: gstinVal !== "" ? gstinVal : null,
          address: values.address,
          stateCode: values.stateCode,
          prefix: values.prefix,
        },
      });
    },
    successMessage: "Invoice settings saved successfully",
  });

  const { control, formState: { isDirty } } = form;
  useLeaveGuard(isDirty);

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      <Card>
        <CardHeader
          title="Billing & Tax Details"
          description="Legal entity name, GST identification number, and official registered address printed on customer tax invoices."
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="legalName"
              control={control}
              label="Legal Business / Entity Name"
              hint="Printed at top of invoice (e.g. Maa Kali Astuti)"
              required
            />
            <TextField
              name="gstin"
              control={control}
              label="GSTIN (Goods and Services Tax ID)"
              hint="15-character ID (leave blank if unregistered)"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="stateCode"
              control={control}
              label="State & GST State Code"
              hint="e.g. 09 (Uttar Pradesh)"
            />
            <TextField
              name="prefix"
              control={control}
              label="Invoice Number Prefix"
              hint="Prepended to invoice numbers (e.g. MKA)"
              required
            />
          </div>

          <div className="pt-2 border-t border-s2">
            <TextArea
              name="address"
              control={control}
              label="Registered Billing Address"
              hint="Official address printed on invoices"
              rows={3}
            />
          </div>
        </CardBody>
      </Card>

      <FormBar
        pending={pending}
        dirty={isDirty}
        cancelHref="/admin/settings?tab=invoice"
        saveLabel="Save Invoice Settings"
      />
    </form>
  );
}
