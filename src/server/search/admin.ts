import "server-only";

import { and, asc, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/server/db/client";
import { orders } from "@/server/db/schema/commerce";
import { users } from "@/server/db/schema/core";
import { products } from "@/server/db/schema/catalog";
import { bookings, kundaliOrders } from "@/server/db/schema/consult";
import { inquiries } from "@/server/db/schema/crm";
import { requireAdmin } from "@/server/auth/guards";
import { can } from "@/lib/domain/permissions";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";
import type { BadgeTone } from "@/components/admin/ui/StatusBadge";

export type SearchResultBadge = {
  tone: BadgeTone;
  label: string;
};

export type SearchResultItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  badge?: SearchResultBadge;
};

export type SearchGroupKey =
  | "orders"
  | "customers"
  | "products"
  | "bookings"
  | "kundali"
  | "inquiries";

export type SearchGroup = {
  key: SearchGroupKey;
  label: string;
  items: SearchResultItem[];
};

export type AdminSearchResults = {
  query: string;
  groups: SearchGroup[];
  totalMatches: number;
};

function getOrderTone(status: string): BadgeTone {
  switch (status) {
    case "placed":
      return "warn";
    case "energizing":
    case "packed":
      return "info";
    case "shipped":
    case "delivered":
      return "ok";
    case "cancelled":
      return "danger";
    default:
      return "muted";
  }
}

function getBookingTone(status: string): BadgeTone {
  switch (status) {
    case "confirmed":
      return "ok";
    case "completed":
      return "info";
    case "hold":
      return "warn";
    case "cancelled":
      return "danger";
    default:
      return "muted";
  }
}

function getKundaliTone(status: string): BadgeTone {
  switch (status) {
    case "ready":
      return "ok";
    case "generating":
    case "paid":
      return "info";
    case "pending_payment":
      return "warn";
    case "failed":
      return "danger";
    default:
      return "muted";
  }
}

function getInquiryTone(status: string): BadgeTone {
  switch (status) {
    case "enrolled":
    case "approved":
      return "ok";
    case "new":
    case "contacted":
    case "call_scheduled":
      return "info";
    case "declined":
    case "closed":
      return "muted";
    default:
      return "muted";
  }
}

/**
 * Global admin search across orders, customers, products, bookings, kundali, inquiries.
 * Max 5 per group, only for groups the caller's role may view.
 */
export async function adminSearch(rawQuery: string): Promise<AdminSearchResults> {
  const admin = await requireAdmin();

  const query = (rawQuery ?? "").trim();
  if (query.length < 2 || query.length > 60) {
    return {
      query,
      groups: [],
      totalMatches: 0,
    };
  }

  const pattern = `%${query}%`;

  const [
    orderRows,
    customerRows,
    productRows,
    bookingRows,
    kundaliRows,
    inquiryRows,
  ] = await Promise.all([
    // Orders
    can(admin.role, "orders.view")
      ? db
          .select({
            id: orders.id,
            number: orders.number,
            name: orders.name,
            phone: orders.phone,
            email: orders.email,
            status: orders.status,
            totalInr: orders.totalInr,
            createdAt: orders.createdAt,
          })
          .from(orders)
          .where(
            or(
              like(orders.number, pattern),
              like(orders.phone, pattern),
              like(orders.email, pattern),
              like(orders.name, pattern),
            ),
          )
          .orderBy(desc(orders.createdAt))
          .limit(5)
      : Promise.resolve([]),

    // Customers
    can(admin.role, "customers.view")
      ? db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            phone: users.phone,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(
            and(
              eq(users.role, "customer"),
              or(
                like(users.email, pattern),
                like(users.phone, pattern),
                like(users.name, pattern),
              ),
            ),
          )
          .orderBy(desc(users.createdAt))
          .limit(5)
      : Promise.resolve([]),

    // Products
    can(admin.role, "products.view")
      ? db
          .select({
            id: products.id,
            nameEn: products.nameEn,
            nameHi: products.nameHi,
            slug: products.slug,
            priceInr: products.priceInr,
            stock: products.stock,
            status: products.status,
          })
          .from(products)
          .where(
            or(
              like(products.nameEn, pattern),
              like(products.nameHi, pattern),
              like(products.slug, pattern),
              like(products.id, pattern),
            ),
          )
          .orderBy(asc(products.nameEn))
          .limit(5)
      : Promise.resolve([]),

    // Bookings
    can(admin.role, "bookings.view")
      ? db
          .select({
            id: bookings.id,
            ref: bookings.ref,
            name: bookings.name,
            phone: bookings.phone,
            status: bookings.status,
            startAt: bookings.startAt,
            serviceKey: bookings.serviceKey,
          })
          .from(bookings)
          .where(
            or(
              like(bookings.ref, pattern),
              like(bookings.phone, pattern),
            ),
          )
          .orderBy(desc(bookings.createdAt))
          .limit(5)
      : Promise.resolve([]),

    // Kundali Orders
    can(admin.role, "kundali.view")
      ? db
          .select({
            id: kundaliOrders.id,
            ref: kundaliOrders.ref,
            name: kundaliOrders.name,
            phone: kundaliOrders.phone,
            status: kundaliOrders.status,
            dob: kundaliOrders.dob,
            place: kundaliOrders.place,
          })
          .from(kundaliOrders)
          .where(
            or(
              like(kundaliOrders.ref, pattern),
              like(kundaliOrders.phone, pattern),
            ),
          )
          .orderBy(desc(kundaliOrders.createdAt))
          .limit(5)
      : Promise.resolve([]),

    // Inquiries
    can(admin.role, "inquiries.view")
      ? db
          .select({
            id: inquiries.id,
            ref: inquiries.ref,
            name: inquiries.name,
            phone: inquiries.phone,
            status: inquiries.status,
            kind: inquiries.kind,
            city: inquiries.city,
          })
          .from(inquiries)
          .where(
            or(
              like(inquiries.ref, pattern),
              like(inquiries.phone, pattern),
            ),
          )
          .orderBy(desc(inquiries.createdAt))
          .limit(5)
      : Promise.resolve([]),
  ]);

  const groups: SearchGroup[] = [];

  if (orderRows.length > 0) {
    groups.push({
      key: "orders",
      label: "Orders",
      items: orderRows.map((o) => ({
        id: String(o.id),
        title: o.number,
        subtitle: `${o.name} · ${o.phone}`,
        meta: `${fmt(o.totalInr)} · ${formatIst(o.createdAt, { date: true })}`,
        href: `/admin/orders/${o.id}`,
        badge: { tone: getOrderTone(o.status), label: o.status },
      })),
    });
  }

  if (customerRows.length > 0) {
    groups.push({
      key: "customers",
      label: "Customers",
      items: customerRows.map((c) => ({
        id: String(c.id),
        title: c.name || "Customer",
        subtitle: [c.phone, c.email].filter(Boolean).join(" · "),
        meta: `Joined ${formatIst(c.createdAt, { date: true })}`,
        href: `/admin/orders?search=${encodeURIComponent(c.phone || c.email || "")}`,
      })),
    });
  }

  if (productRows.length > 0) {
    groups.push({
      key: "products",
      label: "Products",
      items: productRows.map((p) => ({
        id: p.id,
        title: p.nameEn,
        subtitle: `${p.slug} (${p.id})`,
        meta: `${fmt(p.priceInr)} · Stock: ${p.stock}`,
        href: `/admin/products/${p.id}`,
        badge: {
          tone: p.status === "active" ? "ok" : "muted",
          label: p.status,
        },
      })),
    });
  }

  if (bookingRows.length > 0) {
    groups.push({
      key: "bookings",
      label: "Consultations",
      items: bookingRows.map((b) => ({
        id: String(b.id),
        title: b.ref,
        subtitle: `${b.name} · ${b.phone}`,
        meta: b.startAt
          ? formatIst(b.startAt, { date: true, time: true })
          : "Unscheduled",
        href: `/admin/bookings/${b.id}`,
        badge: { tone: getBookingTone(b.status), label: b.status },
      })),
    });
  }

  if (kundaliRows.length > 0) {
    groups.push({
      key: "kundali",
      label: "Kundali Orders",
      items: kundaliRows.map((k) => ({
        id: String(k.id),
        title: k.ref,
        subtitle: `${k.name} · ${k.phone}`,
        meta: `${k.dob} · ${k.place}`,
        href: `/admin/kundali/${k.id}`,
        badge: { tone: getKundaliTone(k.status), label: k.status },
      })),
    });
  }

  if (inquiryRows.length > 0) {
    groups.push({
      key: "inquiries",
      label: "Inquiries",
      items: inquiryRows.map((i) => ({
        id: String(i.id),
        title: i.ref,
        subtitle: `${i.name} · ${i.phone}`,
        meta: `${i.kind} · ${i.city}`,
        href: `/admin/inquiries/${i.id}`,
        badge: { tone: getInquiryTone(i.status), label: i.status },
      })),
    });
  }

  const totalMatches = groups.reduce((acc, g) => acc + g.items.length, 0);

  return {
    query,
    groups,
    totalMatches,
  };
}
