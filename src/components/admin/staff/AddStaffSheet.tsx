"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/admin/ui/Sheet";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { TextField } from "@/components/admin/form/TextField";
import { SelectField } from "@/components/admin/form/SelectField";
import { useActionForm } from "@/components/admin/form/useActionForm";
import { addStaffSchema } from "@/lib/validation/staff";
import { addStaffAction } from "@/server/staff/admin-actions";

export type AddStaffSheetProps = {
  trigger?: ReactNode;
};

export function AddStaffSheet({ trigger }: AddStaffSheetProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { form, submit, pending } = useActionForm({
    schema: addStaffSchema,
    defaultValues: {
      name: "",
      email: "",
      role: "staff",
    },
    action: addStaffAction,
    onSuccess: () => {
      setOpen(false);
      form.reset({ name: "", email: "", role: "staff" });
      router.refresh();
    },
    successMessage: "Staff invitation sent successfully",
  });

  const handleOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset({ name: "", email: "", role: "staff" });
    }
  };

  const defaultTrigger = (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-1.5 rounded-btn bg-em7 px-3.5 font-sans text-[13px] font-semibold text-iv shadow-sm transition-colors hover:bg-em9 cursor-pointer"
    >
      <div className="size-4">
        <AdminIcon name="plus" />
      </div>
      <span>Add Staff</span>
    </button>
  );

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
      trigger={trigger ?? defaultTrigger}
      title="Add Staff Member"
      description="Invite a new administrator or upgrade an existing user."
    >
      <form onSubmit={submit} className="flex flex-col gap-5 pt-2">
        <TextField
          name="name"
          control={form.control}
          label="Full Name"
          placeholder="e.g. Ramesh Sharma"
          hint="Displayed on the staff list and audit trail."
          required
          maxLength={80}
          showCount
        />

        <TextField
          name="email"
          control={form.control}
          label="Email Address"
          type="email"
          placeholder="staff@example.com"
          hint="An email with sign-in instructions will be sent here."
          required
          maxLength={120}
        />

        <SelectField
          name="role"
          control={form.control}
          label="Assigned Role"
          hint="Defines administrative access and privileges."
          required
          options={[
            {
              value: "staff",
              label: "Staff — Orders, bookings, inquiries & catalog view",
            },
            {
              value: "manager",
              label: "Manager — Store operations (orders, catalog, content, bookings)",
            },
            {
              value: "editor",
              label: "Editor — Catalog, content, blog & reviews",
            },
            {
              value: "owner",
              label: "Owner — Full access (all settings, staff & data)",
            },
          ]}
        />

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-s2 pt-4">
          <button
            type="button"
            disabled={pending}
            onClick={() => handleOpenChange(false)}
            className="h-9 rounded-btn border border-s2 bg-cream px-4 font-sans text-[13px] font-semibold text-ink transition-colors hover:bg-s1 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex h-9 items-center justify-center gap-2 rounded-btn bg-em7 px-4 font-sans text-[13px] font-semibold text-iv shadow-sm transition-colors hover:bg-em9 cursor-pointer disabled:opacity-50"
          >
            {pending && (
              <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            <span>Send Invitation</span>
          </button>
        </div>
      </form>
    </Sheet>
  );
}
