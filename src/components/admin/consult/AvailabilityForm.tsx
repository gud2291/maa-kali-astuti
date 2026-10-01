"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  consultSettingsAdminSchema,
  type ConsultSettingsAdminInput,
} from "@/lib/validation/consult-admin";
import { updateConsultSettingsAction } from "@/server/consult/admin-actions";
import { toast } from "@/components/admin/ui/toast";
import { errorText } from "@/components/admin/errors";
import { AdminIcon } from "@/components/admin/AdminIcon";
import type { ConsultSettings } from "@/lib/validation/settings";

export type AvailabilityFormProps = {
  initialSettings: ConsultSettings;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SESSION_LENS = ["30", "45", "60", "90"] as const;

export function AvailabilityForm({
  initialSettings,
}: AvailabilityFormProps): React.JSX.Element {
  const [pending, setPending] = useState(false);
  const [newTimeInputs, setNewTimeInputs] = useState<Record<string, string>>({
    "30": "",
    "45": "",
    "60": "",
    "90": "",
  });

  const form = useForm<ConsultSettingsAdminInput>({
    resolver: zodResolver(consultSettingsAdminSchema),
    defaultValues: {
      startTimes: {
        "30": initialSettings.startTimes["30"] || [],
        "45": initialSettings.startTimes["45"] || [],
        "60": initialSettings.startTimes["60"] || [],
        "90": initialSettings.startTimes["90"] || [],
      },
      openDays: initialSettings.openDays || [1, 2, 3, 4, 5, 6],
      bookingWindowDays: initialSettings.bookingWindowDays ?? 30,
      minLeadHours: initialSettings.minLeadHours ?? 12,
      holdMinutes: initialSettings.holdMinutes ?? 10,
      rescheduleMinHours: initialSettings.rescheduleMinHours ?? 12,
      maxReschedules: initialSettings.maxReschedules ?? 1,
      blocked: initialSettings.blocked || [],
    },
  });

  const onSubmit = async (
    values: ConsultSettingsAdminInput,
  ): Promise<void> => {
    setPending(true);
    try {
      const res = await updateConsultSettingsAction(values);
      if (res.ok) {
        toast.success("Availability settings saved successfully");
      } else {
        toast.error(errorText(res.code));
      }
    } catch {
      toast.error("Failed to save availability settings");
    } finally {
      setPending(false);
    }
  };

  const addTimeSlot = (len: "30" | "45" | "60" | "90"): void => {
    const val = (newTimeInputs[len] || "").trim();
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(val)) {
      toast.error("Invalid time format. Please use HH:mm (e.g. 14:30)");
      return;
    }
    const current = form.getValues(`startTimes.${len}`) || [];
    if (current.includes(val)) {
      toast.error("Time slot already exists");
      return;
    }
    const next = [...current, val].sort();
    form.setValue(`startTimes.${len}`, next, { shouldDirty: true });
    setNewTimeInputs((prev) => ({ ...prev, [len]: "" }));
  };

  const removeTimeSlot = (
    len: "30" | "45" | "60" | "90",
    slot: string,
  ): void => {
    const current = form.getValues(`startTimes.${len}`) || [];
    form.setValue(
      `startTimes.${len}`,
      current.filter((s) => s !== slot),
      { shouldDirty: true },
    );
  };

  const blocked = form.watch("blocked") || [];

  const addBlockedRange = (): void => {
    if (blocked.length >= 50) return;
    const today = new Date().toISOString().slice(0, 10);
    form.setValue(
      "blocked",
      [
        ...blocked,
        {
          from: today,
          to: today,
          note: "",
        },
      ],
      { shouldDirty: true },
    );
  };

  const removeBlockedRange = (index: number): void => {
    form.setValue(
      "blocked",
      blocked.filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {/* Open Days */}
      <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-display text-[16px] font-semibold text-ink">
            Working Days (Open Days)
          </h3>
          <p className="font-sans text-[12.5px] text-ink6">
            Select the days of the week when consultations can be scheduled.
          </p>
        </div>

        <Controller
          control={form.control}
          name="openDays"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
              {DAY_NAMES.map((name, dow) => {
                const isSelected = field.value.includes(dow);
                return (
                  <button
                    key={dow}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        field.onChange(field.value.filter((d) => d !== dow));
                      } else {
                        field.onChange([...field.value, dow].sort());
                      }
                    }}
                    className={`flex flex-col items-center justify-center rounded-btn border p-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "border-em7 bg-em7/10 text-ink"
                        : "border-s2 bg-cream text-ink6 hover:border-s2/80"
                    }`}
                  >
                    <span className="font-sans text-[13px] font-semibold">
                      {name.slice(0, 3)}
                    </span>
                    <span className="font-mono text-[11px] text-ink6">
                      {isSelected ? "Open" : "Closed"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />
        {form.formState.errors.openDays && (
          <p className="text-[12px] text-sin">
            {form.formState.errors.openDays.message}
          </p>
        )}
      </div>

      {/* Booking Rules & Limits */}
      <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-display text-[16px] font-semibold text-ink">
            Scheduling & Lead Times
          </h3>
          <p className="font-sans text-[12.5px] text-ink6">
            Control advance notice, customer booking window, and holding duration.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Booking Window (Days) *
            </label>
            <input
              type="number"
              min={1}
              max={120}
              {...form.register("bookingWindowDays", { valueAsNumber: true })}
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-mono text-[13.5px] text-ink outline-none focus:border-em7"
            />
            <p className="mt-1 font-sans text-[11px] text-ink6">
              How far in advance customers can book (1–120 days).
            </p>
          </div>

          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Min Lead Notice (Hours) *
            </label>
            <input
              type="number"
              min={0}
              max={72}
              {...form.register("minLeadHours", { valueAsNumber: true })}
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-mono text-[13.5px] text-ink outline-none focus:border-em7"
            />
            <p className="mt-1 font-sans text-[11px] text-ink6">
              Minimum hours needed before a session starts (0–72 hrs).
            </p>
          </div>

          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Payment Hold (Minutes) *
            </label>
            <input
              type="number"
              min={5}
              max={30}
              {...form.register("holdMinutes", { valueAsNumber: true })}
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-mono text-[13.5px] text-ink outline-none focus:border-em7"
            />
            <p className="mt-1 font-sans text-[11px] text-ink6">
              Time a slot is held while customer completes payment (5–30 min).
            </p>
          </div>

          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Reschedule Notice (Hours) *
            </label>
            <input
              type="number"
              min={0}
              max={72}
              {...form.register("rescheduleMinHours", { valueAsNumber: true })}
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-mono text-[13.5px] text-ink outline-none focus:border-em7"
            />
            <p className="mt-1 font-sans text-[11px] text-ink6">
              Customer cannot reschedule within this time (0–72 hrs).
            </p>
          </div>

          <div>
            <label className="block font-sans text-[12px] font-semibold text-ink">
              Max Customer Reschedules *
            </label>
            <input
              type="number"
              min={0}
              max={3}
              {...form.register("maxReschedules", { valueAsNumber: true })}
              className="mt-1 h-9 w-full rounded-field border border-s2 bg-cream px-3 font-mono text-[13.5px] text-ink outline-none focus:border-em7"
            />
            <p className="mt-1 font-sans text-[11px] text-ink6">
              Times customer is allowed to self-reschedule (0–3).
            </p>
          </div>
        </div>
      </div>

      {/* Start Times Per Session Length */}
      <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-6">
        <div>
          <h3 className="font-display text-[16px] font-semibold text-ink">
            Start Times Per Session Length (IST)
          </h3>
          <p className="font-sans text-[12.5px] text-ink6">
            Configure the daily slot start times for each session length.
          </p>
        </div>

        {SESSION_LENS.map((len) => {
          const slots = form.watch(`startTimes.${len}`) || [];
          return (
            <div
              key={len}
              className="rounded-btn border border-s2 bg-cream p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-s2/60 pb-2">
                <span className="font-mono text-[13px] font-bold text-ink">
                  {len}-Minute Sessions ({slots.length} slots)
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="HH:mm (e.g. 11:30)"
                    value={newTimeInputs[len]}
                    onChange={(e) =>
                      setNewTimeInputs((prev) => ({
                        ...prev,
                        [len]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTimeSlot(len);
                      }
                    }}
                    className="h-8 w-32 rounded-field border border-s2 bg-cream px-2.5 font-mono text-[12.5px] text-ink outline-none focus:border-em7"
                  />
                  <button
                    type="button"
                    onClick={() => addTimeSlot(len)}
                    className="inline-flex h-8 items-center gap-1 rounded-btn bg-s1 px-2.5 font-sans text-[12px] font-semibold text-ink hover:bg-s2 cursor-pointer"
                  >
                    <span className="size-3">
                      <AdminIcon name="plus" />
                    </span>
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Chips list */}
              <div className="flex flex-wrap gap-2">
                {slots.length === 0 ? (
                  <p className="font-sans text-[12px] text-ink6 italic">
                    No start times configured for this length.
                  </p>
                ) : (
                  slots.map((slot) => (
                    <span
                      key={slot}
                      className="inline-flex items-center gap-1.5 rounded-field border border-s2 bg-cream/90 px-2.5 py-1 font-mono text-[12.5px] text-ink shadow-2xs"
                    >
                      <span>{slot}</span>
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(len, slot)}
                        className="size-4 flex items-center justify-center rounded-full text-ink6 hover:bg-rose/40 hover:text-sin cursor-pointer"
                        title="Remove slot"
                        aria-label={`Remove slot ${slot}`}
                      >
                        <span className="size-3">
                          <AdminIcon name="close" />
                        </span>
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Blocked Date Ranges */}
      <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-[16px] font-semibold text-ink">
              Blocked Date Ranges ({blocked.length}/50)
            </h3>
            <p className="font-sans text-[12.5px] text-ink6">
              Holidays, travel, or temple seva periods when bookings are blocked.
            </p>
          </div>

          {blocked.length < 50 && (
            <button
              type="button"
              onClick={addBlockedRange}
              className="inline-flex h-8 items-center gap-1.5 rounded-field border border-dashed border-s2 bg-cream/50 px-3 font-sans text-[12.5px] font-semibold text-em7 hover:border-em7 cursor-pointer"
            >
              <span className="size-3.5">
                <AdminIcon name="plus" />
              </span>
              <span>Add Blocked Range</span>
            </button>
          )}
        </div>

        {blocked.length === 0 ? (
          <p className="font-sans text-[12.5px] text-ink6 italic">
            No dates are currently blocked.
          </p>
        ) : (
          <div className="space-y-3">
            {blocked.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 rounded-btn border border-s2 bg-cream p-3 sm:flex-row sm:items-center sm:gap-3"
              >
                <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-ink6">
                      From Date (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      {...form.register(`blocked.${idx}.from`)}
                      className="mt-0.5 h-8 w-full rounded border border-s2 bg-cream px-2 font-mono text-[12px] text-ink outline-none focus:border-em7"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink6">
                      To Date (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      {...form.register(`blocked.${idx}.to`)}
                      className="mt-0.5 h-8 w-full rounded border border-s2 bg-cream px-2 font-mono text-[12px] text-ink outline-none focus:border-em7"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink6">
                      Reason / Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Navratri Anushthan"
                      {...form.register(`blocked.${idx}.note`)}
                      className="mt-0.5 h-8 w-full rounded border border-s2 bg-cream px-2 font-sans text-[12.5px] text-ink outline-none focus:border-em7"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeBlockedRange(idx)}
                  className="flex size-8 items-center justify-center rounded-field text-sin hover:bg-rose/40 cursor-pointer sm:self-end"
                  title="Remove range"
                  aria-label="Remove range"
                >
                  <span className="size-3.5">
                    <AdminIcon name="trash" />
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center justify-center rounded-btn bg-em7 px-6 font-sans text-[14px] font-semibold text-cream shadow-sm hover:bg-em5 disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Saving..." : "Save Availability Settings"}
        </button>
      </div>
    </form>
  );
}
