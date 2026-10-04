"use server";

import { runAction, type ActionResult } from "@/server/result";
import {
  updateBookingStatus,
  setMeetingLink,
  attachReport,
  rescheduleByAdmin,
  cancelBooking,
  addBookingNote,
  adminSlots,
} from "./admin";
import type {
  BookingStatusUpdateInput,
  MeetingLinkInput,
  BookingCancelInput,
  AdminRescheduleInput,
  BookingNoteInput,
} from "@/lib/validation/consult-admin";
import type { BookingStatus, ServiceKey, TierKey } from "@/lib/domain/enums";

export async function updateBookingStatusAction(
  id: number,
  input: BookingStatusUpdateInput,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    await updateBookingStatus(id, input.to, input.note);
    return { ok: true };
  });
}

export async function setMeetingLinkAction(
  id: number,
  input: MeetingLinkInput,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    await setMeetingLink(id, input.meetingLink);
    return { ok: true };
  });
}

export async function attachReportAction(
  id: number,
  mediaId: number,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    await attachReport(id, mediaId);
    return { ok: true };
  });
}

export async function rescheduleByAdminAction(
  id: number,
  input: AdminRescheduleInput,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    await rescheduleByAdmin(id, input.start);
    return { ok: true };
  });
}

export async function cancelBookingAction(
  id: number,
  input: BookingCancelInput,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    await cancelBooking(id, input);
    return { ok: true };
  });
}

export async function addBookingNoteAction(
  id: number,
  input: BookingNoteInput,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    await addBookingNote(id, input.note);
    return { ok: true };
  });
}

export async function adminSlotsAction(
  serviceKey: ServiceKey,
  tierKey: TierKey,
  day: string,
): Promise<ActionResult<{ slots: { t: string; free: boolean }[] }>> {
  return runAction(async () => {
    const slots = await adminSlots(serviceKey, tierKey, day);
    return { slots };
  });
}
