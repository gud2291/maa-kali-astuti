import type { InquiryKind, InquiryValues } from "@/lib/validation/inquiry";
import type { Locale } from "@/lib/domain/enums";
import type { ErrorCode } from "@/lib/domain/errors";
import { submitInquiryAction } from "@/server/inquiries/actions";

export class InquiryError extends Error {
  readonly code: ErrorCode;
  readonly fieldErrors?: Record<string, string>;

  constructor(code: ErrorCode, message?: string, fieldErrors?: Record<string, string>) {
    super(message || code);
    this.name = "InquiryError";
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export async function submitInquiry(
  kind: InquiryKind,
  v: InquiryValues,
  turnstileToken: string,
  locale: Locale = "en",
): Promise<{ refNo: string }> {
  const res = await submitInquiryAction({
    ...v,
    kind,
    locale,
    turnstileToken,
  });

  if (!res.ok) {
    throw new InquiryError(res.code, res.message, res.fieldErrors);
  }

  return res.data;
}
