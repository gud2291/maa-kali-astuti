import { requireAdminPage } from "@/server/auth/guards";
import { invalidate, TAG } from "@/server/cache";
import {
  getHealth,
  sendTestEmail,
  recalculateAllRatings,
} from "@/server/health";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { HealthActions } from "@/components/admin/health/HealthActions";
import { AdminIcon } from "@/components/admin/AdminIcon";

export default async function AdminHealthPage(): Promise<React.JSX.Element> {
  await requireAdminPage("health.view");

  const health = await getHealth();

  async function handleSendEmailAction(): Promise<{ success: boolean; to: string }> {
    "use server";
    return sendTestEmail();
  }

  async function handleRecalculateRatingsAction(): Promise<{ success: boolean; count: number }> {
    "use server";
    const res = await recalculateAllRatings();
    // Ratings live on the cached catalog (cards, PDP, snapshot).
    invalidate(TAG.catalog);
    return res;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health"
        description="Configuration status, database connectivity, and administrative diagnostics"
      />

      {/* Operational Warnings if any */}
      {(health.failedKundaliReports > 0 || health.pendingMediaOlder24h > 0) && (
        <div className="space-y-2">
          {health.failedKundaliReports > 0 && (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-btn border border-sin/30 bg-rose/40 px-4 py-3 font-sans text-[13.5px] font-medium text-sin"
            >
              <AdminIcon name="alert" className="size-5 flex-none" />
              <span>
                <strong>{health.failedKundaliReports} Kundali report(s) failed PDF generation.</strong> Check the Kundali orders list for error details.
              </span>
            </div>
          )}

          {health.pendingMediaOlder24h > 0 && (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-btn border border-g5/30 bg-g1 px-4 py-3 font-sans text-[13.5px] font-medium text-g7"
            >
              <AdminIcon name="info" className="size-5 flex-none" />
              <span>
                <strong>{health.pendingMediaOlder24h} pending media file(s)</strong> older than 24 hours awaiting cleanup.
              </span>
            </div>
          )}
        </div>
      )}

      {/* External Services Status Grid */}
      <div className="rounded-btn bg-cream p-5 shadow-ring-sand border border-s2">
        <div className="border-b border-s2 pb-3 mb-4">
          <h3 className="font-serif text-[18px] font-bold text-ink">
            Service Integrations
          </h3>
          <p className="font-sans text-[12px] text-ink6">
            Status of third-party APIs, storage, and infrastructure credentials
          </p>
        </div>

        <div className="divide-y divide-s2/60">
          {health.services.map((svc) => (
            <div
              key={svc.key}
              className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-sans text-[14px] font-semibold text-ink">
                    {svc.name}
                  </span>
                  {svc.configured ? (
                    svc.mode === "test" ? (
                      <StatusBadge tone="warn">Test Mode</StatusBadge>
                    ) : (
                      <StatusBadge tone="ok">Configured</StatusBadge>
                    )
                  ) : (
                    <StatusBadge tone="danger">Not Configured</StatusBadge>
                  )}
                </div>

                {svc.hint && (
                  <p className="mt-1 font-sans text-[12px] text-ink6">
                    {svc.hint}
                  </p>
                )}
              </div>

              <div className="font-sans text-[11.5px] font-mono text-ink6">
                key: {svc.key}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Database Diagnostics & Counts */}
      <div className="rounded-btn bg-cream p-5 shadow-ring-sand border border-s2 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-s2 pb-3">
          <div>
            <h3 className="font-serif text-[18px] font-bold text-ink">
              Database Diagnostics
            </h3>
            <p className="font-sans text-[12px] text-ink6">
              Turso SQLite connection latency & table sizes
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-pill bg-s1 px-3 py-1 font-sans text-[12px] font-medium text-ink">
            <span
              className={`size-2 rounded-full ${
                health.database.latencyMs < 100
                  ? "bg-ok"
                  : health.database.latencyMs < 300
                    ? "bg-g5"
                    : "bg-sin"
              }`}
            />
            <span>Roundtrip Latency: <strong>{health.database.latencyMs} ms</strong></span>
          </div>
        </div>

        {/* Row Counts Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 pt-2">
          <div className="rounded border border-s2 bg-iv p-3">
            <span className="font-sans text-[11px] font-semibold uppercase text-ink6">Products</span>
            <div className="mt-1 font-display text-[18px] font-bold text-ink">{health.database.rowCounts.products}</div>
          </div>
          <div className="rounded border border-s2 bg-iv p-3">
            <span className="font-sans text-[11px] font-semibold uppercase text-ink6">Orders</span>
            <div className="mt-1 font-display text-[18px] font-bold text-ink">{health.database.rowCounts.orders}</div>
          </div>
          <div className="rounded border border-s2 bg-iv p-3">
            <span className="font-sans text-[11px] font-semibold uppercase text-ink6">Consults</span>
            <div className="mt-1 font-display text-[18px] font-bold text-ink">{health.database.rowCounts.bookings}</div>
          </div>
          <div className="rounded border border-s2 bg-iv p-3">
            <span className="font-sans text-[11px] font-semibold uppercase text-ink6">Kundali</span>
            <div className="mt-1 font-display text-[18px] font-bold text-ink">{health.database.rowCounts.kundaliOrders}</div>
          </div>
          <div className="rounded border border-s2 bg-iv p-3">
            <span className="font-sans text-[11px] font-semibold uppercase text-ink6">Inquiries</span>
            <div className="mt-1 font-display text-[18px] font-bold text-ink">{health.database.rowCounts.inquiries}</div>
          </div>
          <div className="rounded border border-s2 bg-iv p-3">
            <span className="font-sans text-[11px] font-semibold uppercase text-ink6">Subscribers</span>
            <div className="mt-1 font-display text-[18px] font-bold text-ink">{health.database.rowCounts.subscribers}</div>
          </div>
          <div className="rounded border border-s2 bg-iv p-3">
            <span className="font-sans text-[11px] font-semibold uppercase text-ink6">Media</span>
            <div className="mt-1 font-display text-[18px] font-bold text-ink">{health.database.rowCounts.media}</div>
          </div>
        </div>
      </div>

      {/* Maintenance Actions */}
      <HealthActions
        ownerEmail={health.ownerEmail}
        onSendTestEmail={handleSendEmailAction}
        onRecalculateRatings={handleRecalculateRatingsAction}
      />
    </div>
  );
}
