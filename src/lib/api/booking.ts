/* Consultation bookings API. Real booking engine (B22).
   Calls createBookingAction on the server, opens Razorpay Checkout,
   confirms payment, and returns the booking reference. */

import type { ModeKey, ServiceKey, TierKey } from "@/lib/api/consult";
import type { BookingDetails, PayMethod } from "@/lib/validation/booking";
import type { Locale, PayPref } from "@/lib/domain/enums";
import { createBookingAction } from "@/server/bookings/actions";
import { openRazorpay } from "@/lib/payments/razorpay-client";
import { confirmPaymentAction } from "@/server/payments/actions";

export type BookingRequest = {
  svc: ServiceKey;
  tier: TierKey;
  mode: ModeKey;
  details: BookingDetails;
  /** ISO instant of the session start, or null for a written report. */
  start: string | null;
  price: number;
  pay: PayMethod;
  payPref: PayPref;
  palms: { mediaId: number; claimKey: string }[];
  locale?: Locale;
};

export async function submitBooking(req: BookingRequest): Promise<{ id: string }> {
  const actionRes = await createBookingAction({
    serviceKey: req.svc,
    tierKey: req.tier,
    mode: req.mode,
    details: req.details,
    start: req.start,
    palms: req.palms,
    payPref: req.payPref,
    locale: req.locale ?? "en",
  });

  if (!actionRes.ok) {
    throw new Error(actionRes.code);
  }

  const rzpRes = await openRazorpay(actionRes.data.rzp);
  if (rzpRes.status !== "paid") {
    throw new Error("PAYMENT_FAILED");
  }

  const confirmRes = await confirmPaymentAction({
    entity: "booking",
    ref: actionRes.data.ref,
    razorpay_order_id: rzpRes.razorpay_order_id,
    razorpay_payment_id: rzpRes.razorpay_payment_id,
    razorpay_signature: rzpRes.razorpay_signature,
  });

  if (!confirmRes.ok) {
    throw new Error(confirmRes.code);
  }

  return { id: actionRes.data.ref };
}
