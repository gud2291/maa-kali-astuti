"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { INQUIRY_STATUS, type InquiryStatus } from "@/lib/domain/enums";
import {
  setInquiryStatus,
  assignInquiry,
  setNextAction,
  setFee,
  addInquiryNote,
} from "./admin";
import { createInquiryLink, createCustomLink, type PaymentLinkRow } from "./links";

const statusSchema = z.enum(INQUIRY_STATUS);

const inquiryLinkSchema = z.object({
  amountInr: z.number().int().min(1).max(1000000),
  purpose: z.string().trim().min(3).max(200),
});

const customLinkSchema = z.object({
  amountInr: z.number().int().min(1).max(1000000),
  purpose: z.string().trim().min(3).max(200),
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().regex(/^[6-9]\d{9}$/, "10-digit mobile number required"),
    email: z.string().trim().email().nullable(),
  }),
});

export async function setInquiryStatusAction(
  id: number,
  to: InquiryStatus,
  note?: string,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const validStatus = statusSchema.parse(to);
    return setInquiryStatus(id, validStatus, note);
  });
}

export async function assignInquiryAction(
  id: number,
  userId: number | null,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    return assignInquiry(id, userId);
  });
}

export async function setNextActionAction(
  id: number,
  atIso: string | null,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const at = atIso ? new Date(atIso) : null;
    return setNextAction(id, at);
  });
}

export async function setFeeAction(
  id: number,
  feeInr: number | null,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const validFee = feeInr != null ? z.number().int().min(0).max(1000000).parse(feeInr) : null;
    return setFee(id, validFee);
  });
}

export async function addInquiryNoteAction(
  id: number,
  note: string,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const validNote = z.string().trim().min(1).max(2000).parse(note);
    return addInquiryNote(id, validNote);
  });
}

export async function createInquiryLinkAction(
  inquiryId: number,
  input: { amountInr: number; purpose: string },
): Promise<ActionResult<PaymentLinkRow>> {
  return runAction(async () => {
    const parsed = inquiryLinkSchema.parse(input);
    return createInquiryLink(inquiryId, parsed);
  });
}

export async function createCustomLinkAction(
  input: {
    amountInr: number;
    purpose: string;
    customer: { name: string; phone: string; email: string | null };
  },
): Promise<ActionResult<PaymentLinkRow>> {
  return runAction(async () => {
    const parsed = customLinkSchema.parse(input);
    return createCustomLink(parsed);
  });
}
