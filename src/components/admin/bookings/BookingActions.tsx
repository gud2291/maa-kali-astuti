"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateBookingStatusAction,
  setMeetingLinkAction,
  cancelBookingAction,
  addBookingNoteAction,
} from "@/server/bookings/admin-actions";
import { BOOKING_FLOW, canMove } from "@/lib/domain/flows";
import { ReportUpload } from "./ReportUpload";
import { AdminReschedule } from "./AdminReschedule";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { errorText } from "@/components/admin/errors";
import type { BookingAdminDetail } from "@/server/bookings/admin";
import type { BookingStatus } from "@/lib/domain/enums";

export type BookingActionsProps = {
  booking: BookingAdminDetail;
};

export function BookingActions({
  booking,
}: BookingActionsProps): React.JSX.Element {
  const router = useRouter();

  // Meeting Link state
  const [meetingUrl, setMeetingUrl] = useState(booking.meetingLink || "");
  const [savingLink, setSavingLink] = useState(false);

  // Status transition state
  const [statusPending, setStatusPending] = useState(false);

  // Cancel dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelRefund, setCancelRefund] = useState(true);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Admin note state
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const allowedNextStatuses = BOOKING_FLOW[booking.status] || [];

  const handleStatusChange = async (to: BookingStatus): Promise<void> => {
    if (!confirm(`Are you sure you want to mark this booking as "${to}"?`)) {
      return;
    }

    setStatusPending(true);
    try {
      const res = await updateBookingStatusAction(booking.id, { to });
      if (res.ok) {
        toast.ok(`Booking marked as ${to}`);
        router.refresh();
      } else {
        toast.err(errorText(res.code));
      }
    } catch {
      toast.err("Failed to update status");
    } finally {
      setStatusPending(false);
    }
  };

  const handleSaveMeetingLink = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!meetingUrl.trim()) return;

    if (!meetingUrl.startsWith("https://")) {
      toast.err("Meeting link must begin with https://");
      return;
    }

    setSavingLink(true);
    try {
      const res = await setMeetingLinkAction(booking.id, {
        meetingLink: meetingUrl.trim(),
      });
      if (res.ok) {
        toast.ok("Meeting link saved & customer notified");
        router.refresh();
      } else {
        toast.err(errorText(res.code));
      }
    } catch {
      toast.err("Failed to save meeting link");
    } finally {
      setSavingLink(false);
    }
  };

  const handleCancelBooking = async (): Promise<void> => {
    setCancelling(true);
    try {
      const res = await cancelBookingAction(booking.id, {
        refund: cancelRefund,
        reason: cancelReason.trim() || undefined,
      });
      if (res.ok) {
        toast.ok("Booking cancelled successfully");
        setShowCancelDialog(false);
        router.refresh();
      } else {
        toast.err(errorText(res.code));
      }
    } catch {
      toast.err("Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSavingNote(true);
    try {
      const res = await addBookingNoteAction(booking.id, {
        note: noteText.trim(),
      });
      if (res.ok) {
        toast.ok("Note added to booking");
        setNoteText("");
        router.refresh();
      } else {
        toast.err(errorText(res.code));
      }
    } catch {
      toast.err("Failed to add note");
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Transition Buttons */}
      <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-3">
        <h3 className="font-display text-[16px] font-semibold text-ink">
          Booking Lifecycle
        </h3>

        {allowedNextStatuses.length === 0 ? (
          <p className="font-sans text-[13px] text-ink6 italic">
            This booking is in a terminal status ({booking.status}). No further status transitions allowed.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {allowedNextStatuses.map((nextStatus) => {
              if (nextStatus === "cancelled") {
                return (
                  <button
                    key={nextStatus}
                    type="button"
                    disabled={statusPending}
                    onClick={() => setShowCancelDialog(true)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-sin/40 bg-cream px-3.5 font-sans text-[13px] font-semibold text-sin hover:bg-rose/30 disabled:opacity-50 cursor-pointer"
                  >
                    <span>Cancel Booking...</span>
                  </button>
                );
              }

              return (
                <button
                  key={nextStatus}
                  type="button"
                  disabled={statusPending}
                  onClick={() => handleStatusChange(nextStatus)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-btn bg-em7 px-3.5 font-sans text-[13px] font-semibold text-cream shadow-2xs hover:bg-em5 disabled:opacity-50 cursor-pointer capitalize"
                >
                  <span>Mark as {nextStatus.replace("_", " ")}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Meeting Link Form (for live video/call modes) */}
      {booking.mode !== "report" && (
        <form
          onSubmit={handleSaveMeetingLink}
          className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-3"
        >
          <div>
            <h3 className="font-display text-[16px] font-semibold text-ink">
              Meeting Session Link
            </h3>
            <p className="font-sans text-[12.5px] text-ink6">
              Enter the Google Meet, Zoom, or WhatsApp video room URL. Customer receives an email update.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              required
              placeholder="https://meet.google.com/xyz-abc-def"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="h-9 flex-1 rounded-field border border-s2 bg-cream px-3 font-mono text-[13px] text-ink outline-none focus:border-em7"
            />
            <button
              type="submit"
              disabled={savingLink}
              className="inline-flex h-9 items-center justify-center rounded-btn bg-em7 px-4 font-sans text-[13px] font-semibold text-cream hover:bg-em5 disabled:opacity-50 cursor-pointer"
            >
              {savingLink ? "Saving..." : "Save & Notify"}
            </button>
          </div>
        </form>
      )}

      {/* Consultation Report Upload */}
      <ReportUpload
        bookingId={booking.id}
        reportUrl={booking.reportUrl}
        reportMediaId={booking.reportMediaId}
      />

      {/* Admin Reschedule */}
      {booking.mode !== "report" && booking.status === "confirmed" && (
        <AdminReschedule
          bookingId={booking.id}
          serviceKey={booking.serviceKey}
          tierKey={booking.tierKey}
          currentStart={booking.startAt}
        />
      )}

      {/* Add Admin Note Form */}
      <form
        onSubmit={handleAddNote}
        className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-3"
      >
        <div>
          <h3 className="font-display text-[16px] font-semibold text-ink">
            Add Internal Note
          </h3>
          <p className="font-sans text-[12.5px] text-ink6">
            Private internal remarks visible only to admins and Sadhak Ji.
          </p>
        </div>

        <textarea
          rows={3}
          required
          maxLength={500}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Enter staff notes, follow-up remarks, or special remedies discussed..."
          className="w-full rounded-field border border-s2 bg-cream p-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingNote}
            className="inline-flex h-8 items-center justify-center rounded-btn bg-s1 px-4 font-sans text-[12.5px] font-semibold text-ink hover:bg-s2 disabled:opacity-50 cursor-pointer"
          >
            {savingNote ? "Saving..." : "Append Note"}
          </button>
        </div>
      </form>

      {/* Cancel & Refund Modal Dialog */}
      {showCancelDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-md rounded-btn border border-s2 bg-cream p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-s2 pb-2">
              <h3 className="font-display text-[17px] font-semibold text-sin">
                Cancel Consultation {booking.ref}
              </h3>
              <button
                type="button"
                onClick={() => setShowCancelDialog(false)}
                className="size-6 flex items-center justify-center rounded text-ink6 hover:bg-s1 cursor-pointer"
              >
                <span className="size-4">
                  <AdminIcon name="close" />
                </span>
              </button>
            </div>

            <p className="font-sans text-[13px] text-ink6">
              Cancelling will release the scheduled slot and notify the customer by email.
            </p>

            <div>
              <label className="block text-[12px] font-semibold text-ink">
                Cancellation Reason
              </label>
              <textarea
                rows={2}
                maxLength={500}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Sadhak Ji unavailable on this date / client request..."
                className="mt-1 w-full rounded-field border border-s2 bg-cream p-2.5 font-sans text-[13px] text-ink outline-none focus:border-em7"
              />
            </div>

            {booking.payment && booking.payment.status === "captured" && (
              <label className="flex items-center gap-2.5 rounded-btn border border-s2 bg-s1/20 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cancelRefund}
                  onChange={(e) => setCancelRefund(e.target.checked)}
                  className="size-4 rounded text-em7 accent-em7"
                />
                <div>
                  <span className="font-sans text-[13px] font-semibold text-ink">
                    Process Razorpay Refund (₹{booking.priceInr})
                  </span>
                  <p className="font-sans text-[11.5px] text-ink6">
                    Automatically initiate refund back to client&apos;s original payment method.
                  </p>
                </div>
              </label>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-s2">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setShowCancelDialog(false)}
                className="h-8 rounded-btn border border-s2 bg-cream px-3 font-sans text-[12.5px] font-medium text-ink hover:bg-s1 cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelBooking}
                className="h-8 rounded-btn bg-sin px-4 font-sans text-[12.5px] font-semibold text-cream hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
