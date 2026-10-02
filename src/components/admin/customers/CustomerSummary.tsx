"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CustomerProfile } from "@/server/customers/admin";
import { setCustomerBlockedAction, exportCustomersCsvAction } from "@/server/customers/admin-actions";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";

export function CustomerExportButton(): React.JSX.Element {
  const [loading, setLoading] = useState(false);

  const handleExport = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await exportCustomersCsvAction();
      if (!res.ok) {
        alert(res.message || "Export failed");
        return;
      }
      const blob = new Blob([res.data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-btn bg-cream px-3 py-1.5 font-sans text-[12.5px] font-semibold text-ink border border-s2 shadow-sm transition-colors hover:bg-s1 disabled:opacity-50 cursor-pointer"
    >
      <AdminIcon name="report" className="size-4 text-em7" />
      <span>{loading ? "Exporting..." : "Export CSV"}</span>
    </button>
  );
}

export type CustomerSummaryProps = {
  profile: CustomerProfile;
  ltv: number;
  ordersCount: number;
  firstOrderAt: Date | null;
  lastOrderAt: Date | null;
};

export function CustomerSummary({
  profile,
  ltv,
  ordersCount,
  firstOrderAt,
  lastOrderAt,
}: CustomerSummaryProps): React.JSX.Element {
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(profile.status === "blocked");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isRegistered = profile.kind === "registered" && profile.userId !== null;

  const handleToggleBlock = async (): Promise<void> => {
    if (!profile.userId) return;
    const nextBlocked = !isBlocked;
    const confirmText = nextBlocked
      ? `Are you sure you want to block ${profile.name || profile.email}? Their active login sessions will be terminated.`
      : `Unblock ${profile.name || profile.email}? They will be able to log in again.`;

    if (!window.confirm(confirmText)) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await setCustomerBlockedAction({
        userId: profile.userId,
        blocked: nextBlocked,
      });

      if (res.ok) {
        setIsBlocked(res.data.blocked);
        setMessage(res.data.blocked ? "Customer has been blocked." : "Customer unblocked.");
        router.refresh();
      } else {
        setMessage(res.message || "Failed to update customer status.");
      }
    } finally {
      setLoading(false);
    }
  };

  const cleanPhone = profile.phone ? profile.phone.replace(/\D/g, "").slice(-10) : null;

  return (
    <div className="rounded-btn bg-cream p-5 shadow-ring-sand border border-s2 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif text-[22px] font-bold text-ink">
              {profile.name || "Customer"}
            </h2>
            {isBlocked ? (
              <StatusBadge tone="danger">Blocked</StatusBadge>
            ) : profile.kind === "registered" ? (
              <StatusBadge tone="ok">Registered</StatusBadge>
            ) : (
              <StatusBadge tone="muted">Guest Buyer</StatusBadge>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-[13px] text-ink6">
            <span>{profile.email}</span>
            {profile.phone && <span>· {profile.phone}</span>}
            {profile.createdAt && (
              <span>
                · Customer since {formatIst(profile.createdAt, { date: true })}
              </span>
            )}
          </div>
        </div>

        {/* Action button for blocking (registered only) */}
        {isRegistered && (
          <button
            type="button"
            disabled={loading}
            onClick={handleToggleBlock}
            className={`rounded-btn px-3 py-1.5 font-sans text-[12.5px] font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
              isBlocked
                ? "bg-em1 text-em7 hover:bg-em1/80 border border-em7/20"
                : "bg-rose text-sin hover:bg-rose/80 border border-sin/20"
            }`}
          >
            {loading ? "Updating..." : isBlocked ? "Unblock Account" : "Block Account"}
          </button>
        )}
      </div>

      {message && (
        <div className="rounded-btn bg-s1 px-3 py-2 font-sans text-[12.5px] text-ink">
          {message}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-y border-s2 py-4">
        <div>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-ink6">
            Lifetime Value
          </span>
          <div className="mt-0.5 font-display text-[20px] font-bold text-g7">
            {fmt(ltv)}
          </div>
        </div>

        <div>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-ink6">
            Total Orders
          </span>
          <div className="mt-0.5 font-display text-[20px] font-bold text-ink">
            {ordersCount}
          </div>
        </div>

        <div>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-ink6">
            First Order
          </span>
          <div className="mt-0.5 font-sans text-[13.5px] font-medium text-ink">
            {firstOrderAt ? formatIst(firstOrderAt, { date: true }) : "None"}
          </div>
        </div>

        <div>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-ink6">
            Last Order
          </span>
          <div className="mt-0.5 font-sans text-[13.5px] font-medium text-ink">
            {lastOrderAt ? formatIst(lastOrderAt, { date: true }) : "None"}
          </div>
        </div>
      </div>

      {/* Quick Contact Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        {cleanPhone && (
          <>
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center gap-1.5 rounded-btn bg-s1 px-3 py-1.5 font-sans text-[12.5px] font-semibold text-ink transition-colors hover:bg-s2 no-underline"
            >
              <AdminIcon name="phone" className="size-3.5 text-em7" />
              <span>Call ({cleanPhone})</span>
            </a>
            <a
              href={`https://wa.me/91${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-btn bg-s1 px-3 py-1.5 font-sans text-[12.5px] font-semibold text-ink transition-colors hover:bg-s2 no-underline"
            >
              <AdminIcon name="whatsapp" className="size-3.5 text-ok" />
              <span>WhatsApp</span>
            </a>
          </>
        )}
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-1.5 rounded-btn bg-s1 px-3 py-1.5 font-sans text-[12.5px] font-semibold text-ink transition-colors hover:bg-s2 no-underline"
        >
          <AdminIcon name="mail" className="size-3.5 text-em7" />
          <span>Send Email</span>
        </a>
      </div>
    </div>
  );
}
