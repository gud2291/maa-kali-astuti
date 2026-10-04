"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminSlotsAction, rescheduleByAdminAction } from "@/server/bookings/admin-actions";
import { istWallToUtc, istDayKey, formatIst } from "@/lib/core/ist";
import { toast } from "@/components/admin/ui/toast";
import { errorText } from "@/components/admin/errors";
import { AdminIcon } from "@/components/admin/AdminIcon";
import type { ServiceKey, TierKey } from "@/lib/domain/enums";

export type AdminRescheduleProps = {
  bookingId: number;
  serviceKey: ServiceKey;
  tierKey: TierKey;
  currentStart: Date | null;
};

export function AdminReschedule({
  bookingId,
  serviceKey,
  tierKey,
  currentStart,
}: AdminRescheduleProps): React.JSX.Element {
  const router = useRouter();
  const [day, setDay] = useState<string>(
    currentStart ? istDayKey(currentStart) : istDayKey(new Date()),
  );
  const [slots, setSlots] = useState<{ t: string; free: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  const fetchSlots = async (selectedDay: string): Promise<void> => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await adminSlotsAction(serviceKey, tierKey, selectedDay);
      if (res.ok) {
        setSlots(res.data.slots);
      } else {
        toast.err(errorText(res.code));
      }
    } catch {
      toast.err("Failed to load available slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleReschedule = async (): Promise<void> => {
    if (!selectedSlot || !day) return;
    const startUtc = istWallToUtc(day, selectedSlot);

    setRescheduling(true);
    try {
      const res = await rescheduleByAdminAction(bookingId, {
        start: startUtc.getTime(),
      });
      if (res.ok) {
        toast.ok(
          `Rescheduled to ${formatIst(startUtc, { date: true, time: true })}`,
        );
        router.refresh();
      } else {
        toast.err(errorText(res.code));
      }
    } catch {
      toast.err("Failed to reschedule booking");
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <div className="rounded-btn border border-s2 bg-cream p-4 space-y-4">
      <div>
        <h4 className="font-display text-[15px] font-semibold text-ink">
          Reschedule Session (Admin)
        </h4>
        <p className="font-sans text-[12px] text-ink6">
          Admins can override customer limits to reschedule directly to any open working slot.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-ink6">
            Select Date (YYYY-MM-DD)
          </label>
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="mt-0.5 h-9 rounded-field border border-s2 bg-cream px-3 font-mono text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        <button
          type="button"
          disabled={!day || loadingSlots}
          onClick={() => fetchSlots(day)}
          className="inline-flex h-9 items-center gap-1.5 rounded-btn bg-s1 px-3.5 font-sans text-[13px] font-semibold text-ink hover:bg-s2 disabled:opacity-50 cursor-pointer"
        >
          <span className="size-3.5">
            <AdminIcon name="clock" />
          </span>
          <span>{loadingSlots ? "Loading..." : "Check Slots"}</span>
        </button>
      </div>

      {slots.length > 0 && (
        <div className="space-y-3 pt-2">
          <label className="block text-[11px] font-semibold text-ink6">
            Available Slots for {day} (IST):
          </label>

          <div className="flex flex-wrap gap-2">
            {slots.map((s) => {
              const isSelected = selectedSlot === s.t;
              return (
                <button
                  key={s.t}
                  type="button"
                  disabled={!s.free}
                  onClick={() => setSelectedSlot(s.t)}
                  className={`rounded-field border px-3 py-1.5 font-mono text-[12.5px] font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? "border-em7 bg-em7 text-cream shadow-2xs"
                      : s.free
                        ? "border-s2 bg-cream text-ink hover:border-em7"
                        : "border-s2/40 bg-s1/30 text-ink6/50 line-through cursor-not-allowed"
                  }`}
                >
                  {s.t}
                </button>
              );
            })}
          </div>

          {selectedSlot && (
            <div className="flex items-center justify-between border-t border-s2/60 pt-3">
              <span className="font-sans text-[13px] text-ink">
                Selected:{" "}
                <strong className="font-mono text-em7">
                  {day} at {selectedSlot} IST
                </strong>
              </span>

              <button
                type="button"
                disabled={rescheduling}
                onClick={handleReschedule}
                className="inline-flex h-9 items-center justify-center rounded-btn bg-em7 px-4 font-sans text-[13px] font-semibold text-cream shadow-sm hover:bg-em5 disabled:opacity-50 cursor-pointer"
              >
                {rescheduling ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
