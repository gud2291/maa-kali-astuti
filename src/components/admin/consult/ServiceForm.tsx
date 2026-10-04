"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  serviceAdminSchema,
  type ServiceAdminInput,
} from "@/lib/validation/consult-admin";
import { updateServiceAction } from "@/server/consult/admin-actions";
import { toast } from "@/components/admin/ui/toast";
import { errorText } from "@/components/admin/errors";
import { SwitchField } from "@/components/admin/form/SwitchField";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { MODE_KEYS, type ModeKey } from "@/lib/domain/enums";
import type { ServiceWithTiers } from "@/server/consult/admin";

export type ServiceFormProps = {
  service: ServiceWithTiers;
};

const MODE_LABELS: Record<ModeKey, string> = {
  video: "Video Call (Google Meet / Zoom)",
  call: "Phone Call",
  wa: "WhatsApp Call / Chat",
  report: "Written PDF Report",
};

export function ServiceForm({ service }: ServiceFormProps): React.JSX.Element {
  const [pending, setPending] = useState(false);

  const form = useForm<ServiceAdminInput>({
    resolver: zodResolver(serviceAdminSchema),
    defaultValues: {
      nameEn: service.nameEn,
      nameHi: service.nameHi,
      icon: service.icon || "",
      modes: service.modes,
      guarantee: service.guarantee,
      content: {
        line: service.content.line || { en: "", hi: "" },
        deliver: service.content.deliver || { en: "", hi: "" },
        get: service.content.get || { en: "", hi: "" },
        modesLine: service.content.modesLine || { en: "", hi: "" },
        covered: service.content.covered || [],
        samples: service.content.samples || [],
      },
      sort: service.sort,
      visible: service.visible,
    },
  });

  const onSubmit = async (values: ServiceAdminInput): Promise<void> => {
    setPending(true);
    try {
      const res = await updateServiceAction(service.key, values);
      if (res.ok) {
        toast.ok("Service updated successfully");
      } else {
        toast.err(errorText(res.code));
      }
    } catch {
      toast.err("Failed to update service");
    } finally {
      setPending(false);
    }
  };

  const covered = form.watch("content.covered") || [];
  const samples = form.watch("content.samples") || [];

  const addCovered = (): void => {
    if (covered.length >= 10) return;
    form.setValue("content.covered", [
      ...covered,
      {
        icon: "seal",
        t: { en: "", hi: "" },
        d: { en: "", hi: "" },
      },
    ]);
  };

  const removeCovered = (idx: number): void => {
    form.setValue(
      "content.covered",
      covered.filter((_, i) => i !== idx),
    );
  };

  const addSample = (): void => {
    if (samples.length >= 6) return;
    form.setValue("content.samples", [
      ...samples,
      {
        kind: "chart",
        cap: { en: "", hi: "" },
      },
    ]);
  };

  const removeSample = (idx: number): void => {
    form.setValue(
      "content.samples",
      samples.filter((_, i) => i !== idx),
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* General Settings */}
      <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-4">
        <h3 className="font-display text-[16px] font-semibold text-ink">
          General Details
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Service Name (English) *
            </label>
            <input
              type="text"
              {...form.register("nameEn")}
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13.5px] text-ink outline-none focus:border-em7"
            />
            {form.formState.errors.nameEn && (
              <p className="mt-1 text-[11.5px] text-sin">
                {form.formState.errors.nameEn.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Service Name (Hindi) *
            </label>
            <input
              type="text"
              {...form.register("nameHi")}
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-deva text-[13.5px] text-ink outline-none focus:border-em7"
            />
            {form.formState.errors.nameHi && (
              <p className="mt-1 text-[11.5px] text-sin">
                {form.formState.errors.nameHi.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Icon Name
            </label>
            <input
              type="text"
              {...form.register("icon")}
              placeholder="e.g. kundali, palm, tarot"
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-mono text-[13px] text-ink outline-none focus:border-em7"
            />
          </div>

          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Display Sort Order
            </label>
            <input
              type="number"
              {...form.register("sort", { valueAsNumber: true })}
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-mono text-[13px] text-ink outline-none focus:border-em7"
            />
          </div>

          <div className="flex items-center gap-6 pt-5">
            <Controller
              control={form.control}
              name="visible"
              render={({ field }) => (
                <SwitchField
                  label="Visible"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              control={form.control}
              name="guarantee"
              render={({ field }) => (
                <SwitchField
                  label="Guarantee Badge"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {/* Modes selection */}
        <div>
          <label className="block font-sans text-[12px] font-semibold text-ink mb-2">
            Available Consultation Modes *
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MODE_KEYS.map((m) => {
              const currentModes = form.watch("modes") || [];
              const isChecked = currentModes.includes(m);
              return (
                <label
                  key={m}
                  className={`flex items-center gap-2.5 rounded-btn border p-3 cursor-pointer transition-colors ${
                    isChecked
                      ? "border-em7 bg-em7/5 text-ink"
                      : "border-s2 bg-cream text-ink6"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        form.setValue("modes", [...currentModes, m]);
                      } else {
                        form.setValue(
                          "modes",
                          currentModes.filter((key) => key !== m),
                        );
                      }
                    }}
                    className="size-4 rounded text-em7 accent-em7"
                  />
                  <span className="font-sans text-[13px] font-medium">
                    {MODE_LABELS[m]}
                  </span>
                </label>
              );
            })}
          </div>
          {form.formState.errors.modes && (
            <p className="mt-1 text-[11.5px] text-sin">
              {form.formState.errors.modes.message}
            </p>
          )}
        </div>
      </div>

      {/* Description & Loc Content Fields */}
      <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-4">
        <h3 className="font-display text-[16px] font-semibold text-ink">
          Content & Messaging (Max 300 characters each)
        </h3>

        {/* Tagline */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Tagline (English)
            </label>
            <input
              type="text"
              maxLength={300}
              {...form.register("content.line.en")}
              placeholder="e.g. Deep insight into your past, present and future"
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13.5px] text-ink outline-none focus:border-em7"
            />
          </div>
          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Tagline (Hindi)
            </label>
            <input
              type="text"
              maxLength={300}
              {...form.register("content.line.hi")}
              placeholder="उदा. भूत, वर्तमान और भविष्य का गहन मार्गदर्शन"
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-deva text-[13.5px] text-ink outline-none focus:border-em7"
            />
          </div>
        </div>

        {/* Deliver line */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Delivery Notice (English)
            </label>
            <input
              type="text"
              maxLength={300}
              {...form.register("content.deliver.en")}
              placeholder="e.g. Report delivered within 48 hours"
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13.5px] text-ink outline-none focus:border-em7"
            />
          </div>
          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Delivery Notice (Hindi)
            </label>
            <input
              type="text"
              maxLength={300}
              {...form.register("content.deliver.hi")}
              placeholder="उदा. 48 घंटे के भीतर विस्तृत रिपोर्ट प्राप्त करें"
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-deva text-[13.5px] text-ink outline-none focus:border-em7"
            />
          </div>
        </div>

        {/* What you get */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              What You Get (English)
            </label>
            <input
              type="text"
              maxLength={300}
              {...form.register("content.get.en")}
              placeholder="e.g. 1-on-1 audio/video consultation with Sadhak Ji"
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13.5px] text-ink outline-none focus:border-em7"
            />
          </div>
          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              What You Get (Hindi)
            </label>
            <input
              type="text"
              maxLength={300}
              {...form.register("content.get.hi")}
              placeholder="उदा. साधक जी के साथ सीधा 1-to-1 संवाद व उपाय"
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-deva text-[13.5px] text-ink outline-none focus:border-em7"
            />
          </div>
        </div>

        {/* Modes Line */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Modes Explanation (English)
            </label>
            <input
              type="text"
              maxLength={300}
              {...form.register("content.modesLine.en")}
              placeholder="e.g. Choose between live video, voice call, or written report"
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13.5px] text-ink outline-none focus:border-em7"
            />
          </div>
          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Modes Explanation (Hindi)
            </label>
            <input
              type="text"
              maxLength={300}
              {...form.register("content.modesLine.hi")}
              placeholder="उदा. वीडियो कॉल, फोन कॉल अथवा लिखित रिपोर्ट में से चुनें"
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-deva text-[13.5px] text-ink outline-none focus:border-em7"
            />
          </div>
        </div>
      </div>

      {/* Topics Covered (up to 10) */}
      <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-[16px] font-semibold text-ink">
              Areas Covered ({covered.length}/10)
            </h3>
            <p className="font-sans text-[12.5px] text-ink6">
              Highlight the questions, areas or topics addressed in this session.
            </p>
          </div>
          {covered.length < 10 && (
            <button
              type="button"
              onClick={addCovered}
              className="inline-flex h-8 items-center gap-1.5 rounded-field border border-dashed border-s2 bg-cream/50 px-3 font-sans text-[12.5px] font-semibold text-em7 hover:border-em7 cursor-pointer"
            >
              <span className="size-3.5">
                <AdminIcon name="plus" />
              </span>
              <span>Add Topic</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {covered.map((item, idx) => (
            <div
              key={idx}
              className="rounded-btn border border-s2 bg-cream p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2 border-b border-s2/60 pb-2">
                <span className="font-mono text-[11px] font-bold text-ink6">
                  Topic #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeCovered(idx)}
                  className="size-6 flex items-center justify-center rounded text-sin hover:bg-rose/30 cursor-pointer"
                >
                  <span className="size-3.5">
                    <AdminIcon name="trash" />
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold text-ink6">
                    Icon
                  </label>
                  <input
                    type="text"
                    {...form.register(`content.covered.${idx}.icon`)}
                    className="mt-0.5 h-8 w-full rounded border border-s2 bg-cream px-2 font-mono text-[12px] text-ink outline-none focus:border-em7"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-ink6">
                    Title (EN)
                  </label>
                  <input
                    type="text"
                    {...form.register(`content.covered.${idx}.t.en`)}
                    className="mt-0.5 h-8 w-full rounded border border-s2 bg-cream px-2 font-sans text-[12.5px] text-ink outline-none focus:border-em7"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-ink6">
                    Title (HI)
                  </label>
                  <input
                    type="text"
                    {...form.register(`content.covered.${idx}.t.hi`)}
                    className="mt-0.5 h-8 w-full rounded border border-s2 bg-cream px-2 font-deva text-[12.5px] text-ink outline-none focus:border-em7"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-ink6">
                    Description (EN)
                  </label>
                  <input
                    type="text"
                    {...form.register(`content.covered.${idx}.d.en`)}
                    className="mt-0.5 h-8 w-full rounded border border-s2 bg-cream px-2 font-sans text-[12.5px] text-ink outline-none focus:border-em7"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-ink6">
                    Description (HI)
                  </label>
                  <input
                    type="text"
                    {...form.register(`content.covered.${idx}.d.hi`)}
                    className="mt-0.5 h-8 w-full rounded border border-s2 bg-cream px-2 font-deva text-[12.5px] text-ink outline-none focus:border-em7"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Samples (up to 6) */}
      <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-[16px] font-semibold text-ink">
              Sample Excerpts ({samples.length}/6)
            </h3>
            <p className="font-sans text-[12.5px] text-ink6">
              Sample insights or excerpts shown on the service detail page.
            </p>
          </div>
          {samples.length < 6 && (
            <button
              type="button"
              onClick={addSample}
              className="inline-flex h-8 items-center gap-1.5 rounded-field border border-dashed border-s2 bg-cream/50 px-3 font-sans text-[12.5px] font-semibold text-em7 hover:border-em7 cursor-pointer"
            >
              <span className="size-3.5">
                <AdminIcon name="plus" />
              </span>
              <span>Add Sample</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {samples.map((item, idx) => (
            <div
              key={idx}
              className="rounded-btn border border-s2 bg-cream p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2 border-b border-s2/60 pb-2">
                <span className="font-mono text-[11px] font-bold text-ink6">
                  Sample #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeSample(idx)}
                  className="size-6 flex items-center justify-center rounded text-sin hover:bg-rose/30 cursor-pointer"
                >
                  <span className="size-3.5">
                    <AdminIcon name="trash" />
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold text-ink6">
                    Kind
                  </label>
                  <input
                    type="text"
                    {...form.register(`content.samples.${idx}.kind`)}
                    placeholder="chart, dasha, remedy..."
                    className="mt-0.5 h-8 w-full rounded border border-s2 bg-cream px-2 font-mono text-[12px] text-ink outline-none focus:border-em7"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-ink6">
                    Caption (EN)
                  </label>
                  <input
                    type="text"
                    {...form.register(`content.samples.${idx}.cap.en`)}
                    className="mt-0.5 h-8 w-full rounded border border-s2 bg-cream px-2 font-sans text-[12.5px] text-ink outline-none focus:border-em7"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-ink6">
                    Caption (HI)
                  </label>
                  <input
                    type="text"
                    {...form.register(`content.samples.${idx}.cap.hi`)}
                    className="mt-0.5 h-8 w-full rounded border border-s2 bg-cream px-2 font-deva text-[12.5px] text-ink outline-none focus:border-em7"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center justify-center rounded-btn bg-em7 px-6 font-sans text-[14px] font-semibold text-cream shadow-sm hover:bg-em5 disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Saving Service..." : "Save Service Content"}
        </button>
      </div>
    </form>
  );
}
