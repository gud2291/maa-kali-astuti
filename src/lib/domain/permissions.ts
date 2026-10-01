import type { Role } from "./enums";

export const PERMISSIONS = [
  "dashboard.view",
  "orders.view",
  "orders.update",
  "orders.refund",
  "products.view",
  "products.edit",
  "coupons.edit",
  "customers.view",
  "customers.edit",
  "bookings.view",
  "bookings.update",
  "consult.edit",
  "kundali.view",
  "kundali.update",
  "inquiries.view",
  "inquiries.update",
  "payment_links.create",
  "messages.view",
  "content.edit",
  "reviews.moderate",
  "media.upload",
  "settings.edit",
  "staff.manage",
  "audit.view",
  "exports.run",
  "health.view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const STAFF_PERMISSIONS: readonly Permission[] = [
  "dashboard.view",
  "orders.view",
  "orders.update",
  "products.view",
  "customers.view",
  "bookings.view",
  "bookings.update",
  "kundali.view",
  "kundali.update",
  "inquiries.view",
  "inquiries.update",
  "messages.view",
  "reviews.moderate",
  "media.upload",
];

const EDITOR_PERMISSIONS: readonly Permission[] = [
  "dashboard.view",
  "products.view",
  "content.edit",
  "reviews.moderate",
  "media.upload",
];

const ALL_PERMISSIONS: readonly Permission[] = [...PERMISSIONS];

const MANAGER_PERMISSIONS: readonly Permission[] = PERMISSIONS.filter(
  (p) => p !== "settings.edit" && p !== "staff.manage",
);

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  owner: ALL_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  staff: STAFF_PERMISSIONS,
  editor: EDITOR_PERMISSIONS,
  customer: [],
};

export function can(role: Role, perm: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
}

export function isAdminRole(role: Role): boolean {
  return role !== "customer";
}
