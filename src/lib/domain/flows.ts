import type { OrderStatus, BookingStatus, KundaliStatus } from "./enums";

export const ORDER_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["placed", "cancelled"],
  placed: ["energizing", "packed", "cancelled"],
  energizing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export const BOOKING_FLOW: Record<BookingStatus, BookingStatus[]> = {
  pending_payment: ["confirmed", "expired", "cancelled"],
  confirmed: ["completed", "no_show", "cancelled"],
  completed: [],
  no_show: [],
  cancelled: [],
  expired: [],
};

export const KUNDALI_FLOW: Record<KundaliStatus, KundaliStatus[]> = {
  pending_payment: ["paid"],
  paid: ["generating"],
  generating: ["ready", "failed"],
  failed: ["generating"],
  ready: ["generating"],
};

// inquiries: any status → any other status (admin pipeline)

export function canMove<S extends string>(
  flow: Record<S, S[]>,
  from: S,
  to: S,
): boolean {
  return flow[from]?.includes(to) ?? false;
}
