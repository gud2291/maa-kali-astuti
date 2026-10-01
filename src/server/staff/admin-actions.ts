"use server";

import { runAction } from "@/server/result";
import {
  addStaff,
  changeRole,
  setStaffStatus,
  removeStaff,
} from "./admin";
import {
  addStaffSchema,
  changeRoleSchema,
  setStaffStatusSchema,
  removeStaffSchema,
} from "@/lib/validation/staff";
import type { ActionResult } from "@/lib/domain/errors";

export async function addStaffAction(
  input: unknown,
): Promise<ActionResult<{ success: true; userId: number }>> {
  return runAction(async () => {
    const data = addStaffSchema.parse(input);
    return await addStaff(data);
  });
}

export async function changeRoleAction(
  input: unknown,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const { userId, role } = changeRoleSchema.parse(input);
    await changeRole(userId, role);
    return { success: true };
  });
}

export async function setStaffStatusAction(
  input: unknown,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const { userId, status } = setStaffStatusSchema.parse(input);
    await setStaffStatus(userId, status);
    return { success: true };
  });
}

export async function removeStaffAction(
  input: unknown,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const { userId } = removeStaffSchema.parse(input);
    await removeStaff(userId);
    return { success: true };
  });
}
