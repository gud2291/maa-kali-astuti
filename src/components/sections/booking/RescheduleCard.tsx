"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Dialog } from "radix-ui";
import { Icon } from "@/components/icons/Icon";
import { useUi } from "@/stores/ui";
import type { BookingView } from "@/server/bookings/queries";
import type { ConsultRules } from "@/server/bookings/availability";
import { rescheduleBookingAction } from "@/server/bookings/actions";
import { istDate, isoDay, t12 } from "@/lib/astro/slots";
import { addDays, dlong, monthTitle } from "@/lib/core/dates";
import { cn } from "@/lib/utils/cn";

export type RescheduleCardProps = {
  booking: BookingView;
  rules: ConsultRules;
  mins: number;
  accessKey?: string;
  whatsapp?: string;
};

export function RescheduleCard({
  booking,
  rules,
  mins,
  accessKey,
  whatsapp,
}: RescheduleCardProps): React.JSX.Element {
  const t = useTranslations("bookingManage");
  const hi = useLocale() === "hi";
  const router = useRouter();

  const [month, setMonth] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slots, setSlots] = useState<{ t: string; free: boolean }[]>([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load slots when date changes
  useEffect(() => {
    if (!selectedDate || !booking.canReschedule) {
      setSlots([]);
      setSlotsLoading(false);
      return;
    }

    let active = true;
    setSlotsLoading(true);
    const dateStr = isoDay(selectedDate);

    fetch(
      `/api/slots?service=${encodeURIComponent(booking.serviceKey)}&tier=${encodeURIComponent(booking.tierKey)}&date=${encodeURIComponent(dateStr)}`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load slots");
        return res.json();
      })
      .then((data: { t: string; free: boolean }[]) => {
        if (active) {
          setSlots(data);
          setSlotsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setSlots([]);
          setSlotsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedDate, booking.serviceKey, booking.tierKey, booking.canReschedule]);

  // Calendar boundaries
  const today = addDays(0);
  const todayKey = isoDay(today);
  const last = addDays(rules.bookingWindowDays);
  const lastKey = isoDay(last);
  const base = new Date(today.getFullYear(), today.getMonth() + month, 1, 12);
  const lead = (base.getDay() + 6) % 7;
  const dim = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const prevDis = month === 0;
  const nextDis = new Date(base.getFullYear(), base.getMonth() + 1, 1, 12) > last;

  const dows = hi
    ? ["सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "रवि"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Group slots
  const groups = (
    [
      [hi ? "सुबह" : "Morning", (h: number) => h < 12],
      [hi ? "दोपहर" : "Afternoon", (h: number) => h >= 12 && h < 16],
      [hi ? "शाम" : "Evening", (h: number) => h >= 16],
    ] as const
  )
    .map(([label, fn]) => ({ label, items: slots.filter((x) => fn(+x.t.split(":")[0])) }))
    .filter((g) => g.items.length);

  const selectedInstant = selectedDate && selectedTime ? istDate(selectedDate, selectedTime) : null;
  const formattedSelected = selectedInstant
    ? `${dlong(selectedDate!, hi)} · ${t12(selectedTime!)} IST`
    : "";

  const handleConfirmReschedule = () => {
    if (!selectedInstant) return;

    startTransition(async () => {
      try {
        const res = await rescheduleBookingAction({
          ref: booking.ref,
          accessKey,
          start: selectedInstant.getTime(),
        });

        if (res.ok) {
          setConfirmOpen(false);
          useUi.getState().toast({
            msg: t("reschedule.success"),
            tone: "ok",
          });
          router.refresh();
        } else {
          const errCode = res.code;
          const msg =
            errCode === "SLOT_TAKEN"
              ? hi
                ? "यह स्लॉट किसी अन्य साधक द्वारा बुक कर लिया गया है।"
                : "This slot was just taken. Please choose another slot."
              : hi
                ? "समय बदलने में त्रुटि हुई। कृपया पुनः प्रयास करें।"
                : "Failed to reschedule. Please try again.";
          useUi.getState().toast({ msg, tone: "err" });
        }
      } catch {
        useUi.getState().toast({
          msg: hi ? "त्रुटि हुई। पुनः प्रयास करें।" : "An error occurred. Please try again.",
          tone: "err",
        });
      }
    });
  };

  if (!booking.canReschedule) {
    const reasonKey = booking.rescheduleReason ?? "not_confirmed";
    const reasonText =
      reasonKey === "max_reached"
        ? t("reschedule.reasons.max_reached")
        : reasonKey === "too_close"
          ? t("reschedule.reasons.too_close")
          : reasonKey === "written_report"
            ? t("reschedule.reasons.written_report")
            : t("reschedule.reasons.not_confirmed");

    return (
      <div className="rounded-btn border border-s2 bg-cream p-5 md:p-6 shadow-ring-sand">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-pill bg-s1 text-ink6">
            <Icon name="clock" className="size-4" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-sans text-[15px] font-semibold text-em9">
              {t("reschedule.title")}
            </h3>
            <p className="font-sans text-[13.5px] leading-relaxed text-ink6">
              {reasonText}
            </p>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Namaste, regarding my booking ${booking.ref}...`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-em7 hover:text-em9"
              >
                <Icon name="wa" className="size-4" />
                <span>{t("help.whatsapp")}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-btn border border-s2 bg-cream p-5 md:p-6 shadow-ring-sand">
      <div className="mb-4">
        <h3 className="font-title text-[19px] leading-snug font-normal text-em9">
          {t("reschedule.title")}
        </h3>
        <p className="font-sans text-[13.5px] text-ink6">
          {t("reschedule.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 min-[700px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Calendar Box */}
        <div className="rounded-btn bg-iv p-3.5 sm:p-4 border border-s2">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="font-title text-[17px] font-normal text-em9">
              {monthTitle(base, hi)}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setMonth(Math.max(0, month - 1))}
                disabled={prevDis}
                aria-label="Previous month"
                className={cn(
                  "grid size-8 place-items-center rounded-btn border-0 bg-transparent transition-colors",
                  prevDis ? "text-[#C9CFC9]" : "text-em7 hover:bg-s1",
                )}
              >
                <Icon name="chevL" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => !nextDis && setMonth(month + 1)}
                disabled={nextDis}
                aria-label="Next month"
                className={cn(
                  "grid size-8 place-items-center rounded-btn border-0 bg-transparent transition-colors",
                  nextDis ? "text-[#C9CFC9]" : "text-em7 hover:bg-s1",
                )}
              >
                <Icon name="chevR" className="size-4" />
              </button>
            </div>
          </div>

          {/* DOW headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {dows.map((w) => (
              <span
                key={w}
                className="py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-ink6"
              >
                {w}
              </span>
            ))}
            {Array.from({ length: lead }, (_, i) => (
              <span key={`empty-${i}`} className="h-8" />
            ))}
            {Array.from({ length: dim }, (_, i) => {
              const n = i + 1;
              const dt = new Date(base.getFullYear(), base.getMonth(), n, 12);
              const dtKey = isoDay(dt);
              const inWindow = dtKey >= todayKey && dtKey <= lastKey;
              const dow = dt.getDay();
              const isOpenDay = rules.openDays.includes(dow);
              const isBlocked = rules.blocked.some(
                (b) => dtKey >= b.from && dtKey <= b.to,
              );
              const ok = inWindow && isOpenDay && !isBlocked;

              const sel = !!selectedDate && dt.toDateString() === selectedDate.toDateString();
              const isToday = dt.toDateString() === today.toDateString();

              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setSelectedDate(dt);
                    setSelectedTime(null);
                  }}
                  disabled={!ok}
                  aria-pressed={sel}
                  className={cn(
                    "relative h-8 rounded-btn border-0 p-0 font-sans text-[13px] font-semibold transition-colors duration-150",
                    sel
                      ? "bg-em7 text-iv shadow-xs"
                      : ok
                        ? "bg-s1 text-em9 hover:bg-s2"
                        : "bg-transparent text-[#B5BFB9] cursor-not-allowed",
                  )}
                >
                  {n}
                  {isToday && (
                    <span className="absolute bottom-1 left-1/2 -ml-0.5 size-1 rounded-pill bg-g5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots Area */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-s2 pb-2">
            <span className="font-sans text-[14px] font-semibold text-em9">
              {selectedDate ? dlong(selectedDate, hi) : (hi ? "दिन चुनें" : "Select a day")}
            </span>
            <span className="flex items-center gap-1 font-sans text-[12px] text-ink6">
              <Icon name="clock" className="size-3.5 text-g5" />
              <span>{mins} mins</span>
            </span>
          </div>

          {!selectedDate ? (
            <div className="rounded-btn bg-s1 p-4 text-center">
              <p className="font-sans text-[13px] text-ink6">
                {t("reschedule.pickSlot")}
              </p>
            </div>
          ) : slotsLoading ? (
            <div className="flex items-center justify-center p-8">
              <span className="size-6 animate-spin rounded-pill border-2 border-em7 border-t-transparent" />
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-btn bg-s1 p-4 text-center">
              <p className="font-sans text-[13px] text-ink6">
                {hi ? "इस दिन कोई स्लॉट उपलब्ध नहीं है।" : "No slots available on this date."}
              </p>
            </div>
          ) : (
            <div className="max-h-[260px] overflow-y-auto pr-1 flex flex-col gap-3">
              {groups.map((g) => (
                <div key={g.label} className="flex flex-col gap-1.5">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-g7">
                    {g.label}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                    {g.items.map((slot) => {
                      const isSel = selectedTime === slot.t;
                      return (
                        <button
                          key={slot.t}
                          type="button"
                          disabled={!slot.free}
                          onClick={() => setSelectedTime(slot.t)}
                          aria-pressed={isSel}
                          className={cn(
                            "h-9 rounded-btn border text-center font-sans text-[12.5px] font-medium transition-all duration-150",
                            isSel
                              ? "border-em7 bg-em7 text-iv shadow-xs font-semibold"
                              : slot.free
                                ? "border-s2 bg-iv text-ink hover:border-g5 hover:bg-cream"
                                : "border-transparent bg-transparent text-[#B5BFB9] line-through cursor-not-allowed",
                          )}
                        >
                          {t12(slot.t)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Trigger Button */}
          {selectedDate && selectedTime && (
            <div className="mt-2 pt-3 border-t border-s2 flex flex-col gap-2">
              <span className="font-sans text-[12.5px] text-em9 font-medium">
                {t("reschedule.slotSelected", { time: formattedSelected })}
              </span>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="h-10 w-full rounded-btn bg-em7 px-4 font-sans text-[13.5px] font-semibold text-iv shadow-ring-gold transition-colors hover:bg-em9"
              >
                {t("reschedule.cta")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-btn bg-iv p-6 shadow-xl border border-s2">
            <Dialog.Title className="m-0 font-title text-[20px] font-normal text-em9">
              {t("reschedule.confirmTitle")}
            </Dialog.Title>
            <Dialog.Description className="mt-2.5 font-sans text-[14px] leading-relaxed text-ink6">
              {t("reschedule.confirmBody", { time: formattedSelected })}
            </Dialog.Description>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={isPending}
                  className="h-10 rounded-btn border border-s2 bg-transparent px-4 font-sans text-[13.5px] font-semibold text-ink transition-colors hover:bg-s1"
                >
                  {t("reschedule.cancel")}
                </button>
              </Dialog.Close>

              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={isPending}
                className="flex h-10 items-center justify-center gap-2 rounded-btn bg-em7 px-5 font-sans text-[13.5px] font-semibold text-iv shadow-ring-gold transition-colors hover:bg-em9 disabled:opacity-50"
              >
                {isPending && (
                  <span className="size-3.5 animate-spin rounded-pill border-2 border-iv border-t-transparent" />
                )}
                <span>{isPending ? t("reschedule.rescheduling") : t("reschedule.confirm")}</span>
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
