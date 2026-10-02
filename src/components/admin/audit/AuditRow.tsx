"use client";

import { useState } from "react";
import Link from "next/link";
import type { AuditLogItem } from "@/server/audit-admin";
import { formatIst } from "@/lib/core/ist";
import { AdminIcon } from "@/components/admin/AdminIcon";

export type AuditRowProps = {
  log: AuditLogItem;
};

function getEntityLink(entity: string, entityId: string): string | null {
  if (entityId === "all") return null;

  switch (entity.toLowerCase()) {
    case "order":
    case "orders":
      return `/admin/orders/${entityId}`;
    case "product":
    case "products":
      return `/admin/products/${entityId}`;
    case "booking":
    case "bookings":
      return `/admin/bookings/${entityId}`;
    case "kundali":
    case "kundali_order":
      return `/admin/kundali/${entityId}`;
    case "inquiry":
    case "inquiries":
      return `/admin/inquiries/${entityId}`;
    case "user":
    case "customer":
      return `/admin/customers/u-${entityId}`;
    case "subscriber":
      return "/admin/subscribers";
    case "message":
    case "messages":
      return "/admin/messages";
    default:
      return null;
  }
}

export function AuditRow({ log }: AuditRowProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const actorLabel =
    log.actorName || log.actorEmail || (log.actorId ? `User #${log.actorId}` : "System");
  const timeStr = formatIst(log.createdAt, { date: true, time: true });
  const entityHref = getEntityLink(log.entity, log.entityId);

  const diffEntries = log.diff ? Object.entries(log.diff) : [];
  const hasDiff = diffEntries.length > 0;

  return (
    <div className="rounded-btn border border-s2 bg-cream p-4 shadow-sm transition-colors hover:border-s2/80">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Summary & Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-pill bg-s1 px-2.5 py-0.5 font-mono text-[11px] font-bold text-g7">
              {log.action}
            </span>

            {entityHref ? (
              <Link
                href={entityHref}
                className="font-sans text-[12.5px] font-semibold text-em7 hover:underline"
              >
                {log.entity} #{log.entityId}
              </Link>
            ) : (
              <span className="font-sans text-[12.5px] font-medium text-ink6">
                {log.entity} #{log.entityId}
              </span>
            )}
          </div>

          <p className="mt-1 font-sans text-[13.5px] font-medium text-ink">
            {log.summary}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[12px] text-ink6">
            <span>By: <strong className="font-semibold text-ink">{actorLabel}</strong></span>
            <span>·</span>
            <span>{timeStr}</span>
            {log.ip && (
              <>
                <span>·</span>
                <span className="font-mono text-[11px]">IP: {log.ip}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Expand Diff button */}
        {hasDiff && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 rounded-btn bg-s1/60 px-2.5 py-1 font-sans text-[12px] font-semibold text-em7 transition-colors hover:bg-s1 cursor-pointer flex-none self-start"
          >
            <span>{expanded ? "Hide diff" : `Diff (${diffEntries.length})`}</span>
            <AdminIcon
              name={expanded ? "chevU" : "chevD"}
              className="size-3.5"
            />
          </button>
        )}
      </div>

      {/* Expandable Diff Table */}
      {expanded && hasDiff && (
        <div className="mt-4 overflow-x-auto rounded border border-s2 bg-iv p-3">
          <table className="w-full border-collapse text-left font-sans text-[12px]">
            <thead>
              <tr className="border-b border-s2 text-ink6">
                <th className="pb-1.5 font-semibold">Field</th>
                <th className="pb-1.5 font-semibold">Previous Value</th>
                <th className="pb-1.5 font-semibold">New Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-s2/40">
              {diffEntries.map(([field, [oldVal, newVal]]) => (
                <tr key={field}>
                  <td className="py-1.5 font-mono font-semibold text-ink">
                    {field}
                  </td>
                  <td className="py-1.5 font-mono text-sin break-all pr-3">
                    {oldVal !== undefined ? JSON.stringify(oldVal) : "—"}
                  </td>
                  <td className="py-1.5 font-mono text-ok break-all">
                    {newVal !== undefined ? JSON.stringify(newVal) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
