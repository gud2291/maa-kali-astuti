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
    href: "/admin/orders",
    label: "Orders",
    icon: "package",
    perm: "orders.view",
    group: "Sales",
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    icon: "gift",
    perm: "coupons.edit",
    group: "Sales",
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
  {
    href: "/admin/bookings",
    label: "Bookings",
    icon: "calendar",
    perm: "bookings.view",
    group: "Consultations",
  },
  {
    href: "/admin/services",
    label: "Services",
    icon: "report",
    perm: "consult.edit",
    group: "Consultations",
  },
  {
    href: "/admin/availability",
    label: "Availability",
    icon: "clock",
    perm: "consult.edit",
    group: "Consultations",
  },
  {
    href: "/admin/kundali",
    label: "Kundali Orders",
    icon: "kundali",
    perm: "kundali.view",
    group: "Kundali",
  },
  {
    href: "/admin/inquiries",
    label: "Inquiries",
    icon: "chat",
    perm: "inquiries.view",
    group: "Leads",
  },
  {
    href: "/admin/messages",
    label: "Messages",
    icon: "mail",
    perm: "messages.view",
    group: "Leads",
  },
  {
    href: "/admin/subscribers",
    label: "Subscribers",
    icon: "bell",
    perm: "messages.view",
    group: "Leads",
  },
  {
    href: "/admin/content/home",
    label: "Home",
    icon: "home",
    perm: "content.edit",
    group: "Content",
  },
  {
    href: "/admin/content/rashifal",
    label: "Rashifal",
    icon: "sun",
    perm: "content.edit",
    group: "Content",
  },
  {
    href: "/admin/content/videos",
    label: "Videos",
    icon: "video",
    perm: "content.edit",
    group: "Content",
  },
  {
    href: "/admin/content/testimonials",
    label: "Testimonials",
    icon: "star",
    perm: "content.edit",
    group: "Content",
  },
  {
    href: "/admin/content/faqs",
    label: "FAQs",
    icon: "question",
    perm: "content.edit",
    group: "Content",
  },
  {
    href: "/admin/content/courses",
    label: "Courses",
    icon: "yantra",
    perm: "content.edit",
    group: "Content",
  },
  {
    href: "/admin/content/rituals",
    label: "Rituals",
    icon: "diya",
    perm: "content.edit",
    group: "Content",
  },
  {
    href: "/admin/content/blog",
    label: "Blog",
    icon: "scroll",
    perm: "content.edit",
    group: "Content",
  },
  {
    href: "/admin/content/pages",
    label: "Pages",
    icon: "cert",
    perm: "content.edit",
    group: "Content",
  },
  {
    href: "/admin/staff",
    label: "Staff",
    icon: "user",
    perm: "staff.manage",
    group: "System",
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: "gear",
    perm: "settings.edit",
    group: "System",
  },
];

export function navFor(role: Role): NavItem[] {
  return NAV.filter((item) => can(role, item.perm));
}
