export const ERROR_CODES = [
  "VALIDATION",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "RATE_LIMITED",
  "BOT_CHECK_FAILED",
  "OTP_INVALID",
  "OTP_EXPIRED",
  "OUT_OF_STOCK",
  "PRICE_CHANGED",
  "COUPON_INVALID",
  "COUPON_MIN_CART",
  "COUPON_EXPIRED",
  "COUPON_USED",
  "SLOT_TAKEN",
  "PAYMENT_FAILED",
  "PAYMENT_SIGNATURE",
  "UPLOAD_INVALID",
  "NOT_CONFIGURED",
  "CONFLICT",
  "INTERNAL",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ErrorCode; message?: string; fieldErrors?: Record<string, string> };
