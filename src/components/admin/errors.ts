import type { ErrorCode } from "@/lib/domain/errors";

export const ADMIN_ERRORS: Record<ErrorCode, string> = {
  VALIDATION: "Please check the entered information and correct any highlighted errors.",
  UNAUTHENTICATED: "Please sign in to continue.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested item or page could not be found.",
  RATE_LIMITED: "Too many requests. Please wait a few moments and try again.",
  BOT_CHECK_FAILED: "Security verification failed. Please refresh and try again.",
  OTP_INVALID: "Incorrect verification code. Please check the code and try again.",
  OTP_EXPIRED: "The verification code has expired. Please request a new one.",
  OUT_OF_STOCK: "One or more items are currently out of stock.",
  PRICE_CHANGED: "Item prices have been updated. Please review before proceeding.",
  COUPON_INVALID: "The coupon code entered is not valid.",
  COUPON_MIN_CART: "The order total does not meet the minimum requirement for this coupon.",
  COUPON_EXPIRED: "This coupon has expired and can no longer be applied.",
  COUPON_USED: "This coupon has already been redeemed.",
  SLOT_TAKEN: "The selected consultation time slot is no longer available.",
  PAYMENT_FAILED: "Payment could not be completed. Please try again.",
  PAYMENT_SIGNATURE: "Payment verification failed. Please contact support if charged.",
  UPLOAD_INVALID: "The uploaded file is invalid or exceeds the allowed size.",
  NOT_CONFIGURED: "This service is not configured yet. Please check system settings.",
  CONFLICT: "A conflicting record already exists with these details.",
  INTERNAL: "An unexpected error occurred. Please try again later.",
};

export function errorText(code?: ErrorCode | string | null): string {
  if (!code) return "An unexpected error occurred. Please try again.";
  return ADMIN_ERRORS[code as ErrorCode] ?? "An unexpected error occurred. Please try again.";
}
