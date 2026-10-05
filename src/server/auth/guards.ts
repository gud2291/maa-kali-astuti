import "server-only";
import { cache } from "react";
import { redirect as nextRedirect } from "next/navigation";
import { redirect as localeRedirect } from "@/i18n/navigation";
import { type UserRow, readSession } from "./session";
import { can, isAdminRole, type Permission } from "@/lib/domain/permissions";
import type { AdminRole, Locale } from "@/lib/domain/enums";
import { AppError } from "@/server/result";

export type SessionUser = UserRow & {
  sessionId: string;
  user: UserRow;
};

export type AdminUser = UserRow & {
  sessionId: string;
  user: UserRow & { role: AdminRole };
  role: AdminRole;
};

export const getCustomer: () => Promise<SessionUser | null> = cache(
  async (): Promise<SessionUser | null> => {
    const s = await readSession("customer");
    if (!s) return null;
    return {
      ...s.user,
      sessionId: s.sessionId,
      user: s.user,
    };
  },
);

export const getAdmin: () => Promise<AdminUser | null> = cache(
  async (): Promise<AdminUser | null> => {
    const s = await readSession("admin");
    if (!s) return null;
    if (!isAdminRole(s.user.role)) return null;

    const adminUser = {
      ...s.user,
      role: s.user.role as AdminRole,
    };

    return {
      ...adminUser,
      sessionId: s.sessionId,
      user: adminUser,
    };
  },
);

export async function requireCustomer(): Promise<SessionUser> {
  const customer = await getCustomer();
  if (!customer) {
    throw new AppError("UNAUTHENTICATED");
  }
  return customer;
}

export async function requireAdmin(perm?: Permission): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) {
    throw new AppError("UNAUTHENTICATED");
  }
  if (perm && !can(admin.role, perm)) {
    throw new AppError("FORBIDDEN");
  }
  return admin;
}

export async function requireCustomerPage(
  locale: Locale,
  path: string,
): Promise<SessionUser> {
  const customer = await getCustomer();
  if (!customer) {
    const href = `/account?next=${encodeURIComponent(path)}`;
    return localeRedirect({ href, locale });
  }
  return customer;
}

export async function requireAdminPage(perm?: Permission): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) {
    nextRedirect("/admin/login");
  }
  if (perm && !can(admin.role, perm)) {
    nextRedirect("/admin?denied=1");
  }
  return admin;
}
