"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  CustomerOrderRecord,
  CustomerBookingRecord,
  CustomerKundaliRecord,
  CustomerInquiryRecord,
} from "@/server/customers/admin";
import { StatusBadge, type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";

export type CustomerHistoryProps = {
  orders: CustomerOrderRecord[];
  bookings: CustomerBookingRecord[];
  kundaliOrders: CustomerKundaliRecord[];
  inquiries: CustomerInquiryRecord[];
};

type HistoryTab = "orders" | "bookings" | "kundali" | "inquiries";

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
    default:
      return "muted";
  }
}

export function CustomerHistory({
  orders,
  bookings,
  kundaliOrders,
  inquiries,
}: CustomerHistoryProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<HistoryTab>("orders");

  const tabs: { key: HistoryTab; label: string; count: number }[] = [
    { key: "orders", label: "Orders", count: orders.length },
    { key: "bookings", label: "Consultations", count: bookings.length },
    { key: "kundali", label: "Kundali Reports", count: kundaliOrders.length },
    { key: "inquiries", label: "Inquiries", count: inquiries.length },
  ];

  return (
    <div className="rounded-btn bg-cream shadow-ring-sand border border-s2 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-s2 bg-s1/30 px-3 pt-2 gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-sans text-[13px] font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? "border-em7 text-em7 bg-cream rounded-t-btn"
                : "border-transparent text-ink6 hover:text-ink"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-pill px-1.5 py-0.5 text-[11px] font-bold ${
                activeTab === tab.key
                  ? "bg-em1 text-em7"
                  : "bg-s2 text-ink6"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <p className="py-6 text-center font-sans text-[13px] text-ink6">
                No orders recorded for this customer.
              </p>
            ) : (
              <div className="divide-y divide-s2/60">
                {orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders/${o.id}`}
                    className="group flex items-center justify-between gap-4 py-3 no-underline transition-colors hover:bg-s1/30 px-3 rounded -mx-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-bold text-em7 group-hover:underline">
                          {o.number}
                        </span>
                        <StatusBadge tone={getOrderTone(o.status)}>
                          {o.status}
                        </StatusBadge>
                      </div>
                      <p className="mt-0.5 font-sans text-[11.5px] text-ink6">
                        {formatIst(o.createdAt, { date: true, time: true })} · {o.paymentMethod.toUpperCase()} ({o.paymentStatus})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-sans text-[14px] font-bold text-ink">
                        {fmt(o.totalInr)}
                      </span>
                      <AdminIcon
                        name="arrowR"
                        className="size-3.5 text-em7 transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            {bookings.length === 0 ? (
              <p className="py-6 text-center font-sans text-[13px] text-ink6">
                No consultations found.
              </p>
            ) : (
              <div className="divide-y divide-s2/60">
                {bookings.map((b) => (
                  <Link
                    key={b.id}
                    href={`/admin/bookings/${b.id}`}
                    className="group flex items-center justify-between gap-4 py-3 no-underline transition-colors hover:bg-s1/30 px-3 rounded -mx-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-bold text-em7 group-hover:underline">
                          {b.ref}
                        </span>
                        <StatusBadge tone={getBookingTone(b.status)}>
                          {b.status}
                        </StatusBadge>
                        <span className="font-sans text-[11px] font-medium text-g7 uppercase">
                          {b.mode}
                        </span>
                      </div>
                      <p className="mt-0.5 font-sans text-[11.5px] text-ink6">
                        {b.startAt
                          ? `Scheduled: ${formatIst(b.startAt, { date: true, time: true })}`
                          : `Created: ${formatIst(b.createdAt, { date: true })}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-sans text-[14px] font-bold text-ink">
                        {fmt(b.priceInr)}
                      </span>
                      <AdminIcon
                        name="arrowR"
                        className="size-3.5 text-em7 transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Kundali Tab */}
        {activeTab === "kundali" && (
          <div>
            {kundaliOrders.length === 0 ? (
              <p className="py-6 text-center font-sans text-[13px] text-ink6">
                No Kundali reports found.
              </p>
            ) : (
              <div className="divide-y divide-s2/60">
                {kundaliOrders.map((k) => (
                  <Link
                    key={k.id}
                    href={`/admin/kundali/${k.id}`}
                    className="group flex items-center justify-between gap-4 py-3 no-underline transition-colors hover:bg-s1/30 px-3 rounded -mx-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-bold text-em7 group-hover:underline">
                          {k.ref}
                        </span>
                        <StatusBadge tone={getKundaliTone(k.status)}>
                          {k.status}
                        </StatusBadge>
                      </div>
                      <p className="mt-0.5 font-sans text-[11.5px] text-ink6">
                        Name: {k.name} · DOB: {k.dob} · Place: {k.place}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-sans text-[14px] font-bold text-ink">
                        {fmt(k.priceInr)}
                      </span>
                      <AdminIcon
                        name="arrowR"
                        className="size-3.5 text-em7 transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div>
            {inquiries.length === 0 ? (
              <p className="py-6 text-center font-sans text-[13px] text-ink6">
                No inquiries recorded.
              </p>
            ) : (
              <div className="divide-y divide-s2/60">
                {inquiries.map((i) => (
                  <Link
                    key={i.id}
                    href={`/admin/inquiries/${i.id}`}
                    className="group flex items-center justify-between gap-4 py-3 no-underline transition-colors hover:bg-s1/30 px-3 rounded -mx-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-bold text-em7 group-hover:underline">
                          {i.ref}
                        </span>
                        <StatusBadge tone={getInquiryTone(i.status)}>
                          {i.status}
                        </StatusBadge>
                        <span className="font-sans text-[11.5px] text-g7 capitalize">
                          {i.kind}
                        </span>
                      </div>
                      <p className="mt-0.5 font-sans text-[11.5px] text-ink6">
                        City: {i.city} · Submitted {formatIst(i.createdAt, { date: true })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <AdminIcon
                        name="arrowR"
                        className="size-3.5 text-em7 transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
