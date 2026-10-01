import { z } from "zod";
import { ADMIN_ROLES } from "@/lib/domain/enums";

export const addStaffSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(120),
  name: z.string().trim().min(1, "Name is required").max(80),
  role: z.enum(ADMIN_ROLES),
});

export type AddStaffInput = z.infer<typeof addStaffSchema>;

export const changeRoleSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum(ADMIN_ROLES),
});

export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;

export const setStaffStatusSchema = z.object({
  userId: z.number().int().positive(),
  status: z.enum(["active", "blocked"]),
});

export type SetStaffStatusInput = z.infer<typeof setStaffStatusSchema>;

export const removeStaffSchema = z.object({
  userId: z.number().int().positive(),
});

export type RemoveStaffInput = z.infer<typeof removeStaffSchema>;
