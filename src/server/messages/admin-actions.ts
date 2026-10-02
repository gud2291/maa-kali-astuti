"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { MESSAGE_STATUS, type MessageStatus } from "@/lib/domain/enums";
import {
  setMessageStatus,
  exportSubscribersCsv,
  deleteSubscriber,
} from "./admin";

const statusSchema = z.enum(MESSAGE_STATUS);

export async function setMessageStatusAction(
  id: number,
  status: MessageStatus,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const validId = z.number().int().min(1).parse(id);
    const validStatus = statusSchema.parse(status);
    return setMessageStatus(validId, validStatus);
  });
}

export async function exportSubscribersCsvAction(): Promise<ActionResult<string>> {
  return runAction(async () => {
    return exportSubscribersCsv();
  });
}

export async function deleteSubscriberAction(
  id: number,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const validId = z.number().int().min(1).parse(id);
    return deleteSubscriber(validId);
  });
}
