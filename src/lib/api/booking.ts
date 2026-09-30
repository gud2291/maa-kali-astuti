/* THE BACKEND SEAM for consultation bookings (Booking.dc.html next() 513–523).
   Demo: the "payment" takes 2000 ms like the prototype, then returns the booking id
   (MKA-B + the last 5 base-36 digits of the timestamp, upper case) and keeps the newest 20
   bookings in localStorage. Palm photos never leave the browser in the demo (only whether they
   were attached is stored). Phase B: create a Razorpay order on the server, open Checkout,
   verify the signature, then POST the booking (with the photos) and hold the slot. Client-only. */
import { STORE_KEY } from "@/lib/core/commerce";
import type { ModeKey, ServiceKey, TierKey } from "@/lib/api/consult";
import type { BookingDetails, PayMethod } from "@/lib/validation/booking";

export const BOOKING_STORAGE_KEY = `${STORE_KEY}.bookings`;

export type BookingRequest = {
  svc: ServiceKey;
  tier: TierKey;
  mode: ModeKey;
  details: BookingDetails;
  /** ISO instant of the session start, or null for a written report. */
  start: string | null;
  price: number;
  pay: PayMethod;
  palms: number;
};

export type BookingRecord = BookingRequest & { id: string; at: number };

export async function submitBooking(req: BookingRequest): Promise<{ id: string }> {
  await new Promise((r) => setTimeout(r, 2000));
  const at = Date.now();
  const id = "MKA-B" + at.toString(36).slice(-5).toUpperCase();
  const rec: BookingRecord = { ...req, id, at };
  try {
    const prev = JSON.parse(localStorage.getItem(BOOKING_STORAGE_KEY) || "[]") as BookingRecord[];
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify([rec, ...prev].slice(0, 20)));
  } catch {
    /* storage full or blocked: the demo still confirms */
  }
  return { id };
}
