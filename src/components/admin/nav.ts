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
  {
    href: "/admin/products",
    label: "Products",
    icon: "tag",
    perm: "products.view",
    group: "Catalog",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: "grid",
    perm: "products.view",
    group: "Catalog",
  },
];

export function navFor(role: Role): NavItem[] {
  return NAV.filter((item) => can(role, item.perm));
}
