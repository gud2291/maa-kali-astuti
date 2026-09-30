/* THE BACKEND SEAM for course / ritual inquiries (InquiryForm.dc.html submit 144–154).
   Demo: waits 1100 ms like the prototype, makes the reference (MKA-S- for sadhana courses,
   MKA-R- for rituals, + the last 6 digits of the timestamp) and keeps the newest 20 inquiries in
   localStorage (the prototype's store.d.inquiries). Phase B: POST to the inquiries API, which
   returns the reference and notifies Sadhak Ji's office. Client-only. */
import { STORE_KEY } from "@/lib/core/commerce";
import type { InquiryKind, InquiryValues } from "@/lib/validation/inquiry";

export const INQUIRY_STORAGE_KEY = `${STORE_KEY}.inquiries`;

export type InquiryRecord = {
  refNo: string;
  kind: InquiryKind;
  course: string | null;
  name: string;
  at: number;
};

export async function submitInquiry(kind: InquiryKind, v: InquiryValues): Promise<{ refNo: string }> {
  await new Promise((r) => setTimeout(r, 1100));
  const at = Date.now();
  const refNo = (kind === "ritual" ? "MKA-R-" : "MKA-S-") + String(at).slice(-6);
  const rec: InquiryRecord = { refNo, kind, course: kind === "ritual" ? null : v.course, name: v.name, at };
  try {
    const prev = JSON.parse(localStorage.getItem(INQUIRY_STORAGE_KEY) || "[]") as InquiryRecord[];
    localStorage.setItem(INQUIRY_STORAGE_KEY, JSON.stringify([rec, ...prev].slice(0, 20)));
  } catch {
    /* storage full or blocked: the demo still confirms */
  }
  return { refNo };
}
