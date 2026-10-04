"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  tierAdminSchema,
  type TierAdminInput,
} from "@/lib/validation/consult-admin";
import { updateTierAction } from "@/server/consult/admin-actions";
import { toast } from "@/components/admin/ui/toast";
import { errorText } from "@/components/admin/errors";
import { LocListEditor } from "@/components/admin/products/LocListEditor";
import { SwitchField } from "@/components/admin/form/SwitchField";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import type { ConsultTierRow } from "@/server/consult/queries";
import type { ServiceKey } from "@/lib/domain/enums";

export type TierEditorProps = {
  serviceKey: ServiceKey;
  tier: ConsultTierRow;
};

export function TierEditor({
  serviceKey,
  tier,
}: TierEditorProps): React.JSX.Element {
  const [pending, setPending] = useState(false);

  const form = useForm<TierAdminInput>({
    resolver: zodResolver(tierAdminSchema),
    defaultValues: {
      titleEn: tier.titleEn,
      titleHi: tier.titleHi || "",
      priceInr: tier.priceInr,
      mins: tier.mins,
      recommended: tier.recommended,
      inclusions: tier.inclusions || [],
    },
  });

  const onSubmit = async (values: TierAdminInput): Promise<void> => {
    setPending(true);
    try {
      const res = await updateTierAction(serviceKey, tier.tierKey, values);
      if (res.ok) {
        toast.ok(`Updated ${values.titleEn} tier successfully`);
      } else {
        toast.err(errorText(res.code));
      }
    } catch {
      toast.err("Failed to update tier");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-s2 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] font-bold text-g7 uppercase tracking-wider">
              {tier.tierKey} package
            </span>
            {form.watch("recommended") && (
              <StatusBadge tone="accent">Recommended</StatusBadge>
            )}
          </div>
          <p className="mt-0.5 font-sans text-[12.5px] text-ink6">
            Configure pricing, session duration, and package inclusions.
          </p>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-8 items-center justify-center rounded-btn bg-em7 px-4 font-sans text-[13px] font-semibold text-cream shadow-sm hover:bg-em5 disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Saving..." : "Save Tier"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-sans text-[12px] font-semibold text-ink">
            Title (English) *
          </label>
          <input
            type="text"
            {...form.register("titleEn")}
            placeholder="e.g. Essential Kundali Reading"
            className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13.5px] text-ink outline-none focus:border-em7"
          />
          {form.formState.errors.titleEn && (
            <p className="mt-1 text-[11.5px] text-sin">
              {form.formState.errors.titleEn.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-sans text-[12px] font-semibold text-ink">
            Title (Hindi)
          </label>
          <input
            type="text"
            {...form.register("titleHi")}
            placeholder="उदा. सामान्य कुंडली विश्लेषण"
            className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-deva text-[13.5px] text-ink outline-none focus:border-em7"
          />
          {form.formState.errors.titleHi && (
            <p className="mt-1 text-[11.5px] text-sin">
              {form.formState.errors.titleHi.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block font-sans text-[12px] font-semibold text-ink">
            Price (₹ INR) *
          </label>
          <input
            type="number"
            min={1}
            max={200000}
            {...form.register("priceInr", { valueAsNumber: true })}
            className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-mono text-[13.5px] text-ink outline-none focus:border-em7"
          />
          {form.formState.errors.priceInr && (
            <p className="mt-1 text-[11.5px] text-sin">
              {form.formState.errors.priceInr.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-sans text-[12px] font-semibold text-ink">
            Duration (Minutes) *
          </label>
          <input
            type="number"
            min={15}
            max={180}
            {...form.register("mins", { valueAsNumber: true })}
            className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-mono text-[13.5px] text-ink outline-none focus:border-em7"
          />
          {form.formState.errors.mins && (
            <p className="mt-1 text-[11.5px] text-sin">
              {form.formState.errors.mins.message}
            </p>
          )}
        </div>

        <div className="flex items-center pt-5">
          <Controller
            control={form.control}
            name="recommended"
            render={({ field }) => (
              <SwitchField
                label="Recommended tier"
                description="Mark as featured package"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <div>
        <label className="block font-sans text-[12px] font-semibold text-ink mb-2">
          Inclusions (up to 8 items)
        </label>
        <Controller
          control={form.control}
          name="inclusions"
          render={({ field }) => (
            <LocListEditor
              value={field.value ?? []}
              onChange={field.onChange}
              label="Inclusion"
              max={8}
            />
          )}
        />
        {form.formState.errors.inclusions && (
          <p className="mt-1 text-[11.5px] text-sin">
            {form.formState.errors.inclusions.message}
          </p>
        )}
      </div>
    </form>
  );
}
