import type { Permission } from "@/lib/domain/permissions";
import type { Role } from "@/lib/domain/enums";
import { can } from "@/lib/domain/permissions";
import type { AdminIconName } from "./AdminIcon";

export type NavGroup =
  | "Overview"
  | "Sales"
  | "Catalog"
  | "Consultations"
  | "Kundali"
  | "Leads"
  | "Content"
  | "System";

export type NavItem = {
  href: string;
  label: string;
  icon: AdminIconName;
  perm: Permission;
  group: NavGroup;
};

export const NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "grid",
    perm: "dashboard.view",
    group: "Overview",
  },
];

export function navFor(role: Role): NavItem[] {
  return NAV.filter((item) => can(role, item.perm));
}
