import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth/guards";
import { getKundaliOrderAdmin } from "@/server/kundali/admin";
import { KundaliActions } from "@/components/admin/kundali/KundaliActions";
import { StatusBadge, type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";
import { accessKeyFor } from "@/server/ids";
import type { KundaliStatus } from "@/lib/domain/enums";

function getStatusBadge(status: KundaliStatus): {
  tone: BadgeTone;
  label: string;
} {
  switch (status) {
    case "ready":
      return { tone: "ok", label: "Ready" };
    case "generating":
      return { tone: "info", label: "Generating" };
    case "paid":
      return { tone: "warn", label: "Paid (Queued)" };
    case "failed":
      return { tone: "danger", label: "Failed" };
    case "pending_payment":
      return { tone: "muted", label: "Pending Payment" };
    default:
      return { tone: "muted", label: status };
  }
}

const RASHI_NAMES = [
  "Mesha (Aries)",
  "Vrishabha (Taurus)",
  "Mithuna (Gemini)",
  "Karka (Cancer)",
  "Simha (Leo)",
  "Kanya (Virgo)",
  "Tula (Libra)",
  "Vrishchika (Scorpio)",
  "Dhanu (Sagittarius)",
  "Makara (Capricorn)",
  "Kumbha (Aquarius)",
  "Meena (Pisces)",
];

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminKundaliDetailPage({
  params,
}: Props): Promise<React.JSX.Element> {
  await requireAdminPage("kundali.view");
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    notFound();
  }

  let order;
  try {
    order = await getKundaliOrderAdmin(id);
  } catch {
    notFound();
  }

  const badge = getStatusBadge(order.status);
  const accessKey = accessKeyFor("kundali", order.ref);
  const webReportUrl = `/kundali/report/${order.ref}?k=${accessKey}`;
  const chart = order.chart;

  return (
    <div className="flex flex-col gap-6">
      {/* Back button and page title */}
      <div>
        <Link
          href="/admin/kundali"
          className="mb-3 inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-em7 no-underline hover:text-em5"
        >
          <AdminIcon name="arrowL" className="size-4" />
          Back to Kundali Orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-title text-[26px] text-em9">{order.name}</h1>
              <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
            </div>
            <span className="font-mono text-[13px] text-g7">Ref: {order.ref}</span>
          </div>

          <KundaliActions
            id={order.id}
            status={order.status}
            refCode={order.ref}
            hasEmail={Boolean(order.email)}
          />
        </div>
      </div>

      {/* Error Banner if failed */}
      {order.status === "failed" && (
        <div className="rounded-btn border border-sin/30 bg-sin/5 p-4 text-sin">
          <div className="flex items-center gap-2 font-semibold">
            <AdminIcon name="alert" className="size-5" />
            Generation Failed ({order.genAttempts}/5 attempts)
          </div>
          <div className="mt-1 font-mono text-[12.5px] text-ink">
            {order.error || "Unknown error during rendering or upload."}
          </div>
        </div>
      )}

      {/* Success Banner if ready */}
      {order.status === "ready" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-btn border border-ok/30 bg-ok/5 p-4 text-ok">
          <div className="flex items-center gap-2 font-medium text-ink">
            <span className="grid size-6 place-items-center rounded-pill bg-ok text-iv">
              <AdminIcon name="check" className="size-3.5" />
            </span>
            Report ready · Media #{order.pdfMediaId}
            {order.emailedAt && (
              <span className="text-ink6">
                · Emailed at {formatIst(order.emailedAt)}
              </span>
            )}
          </div>
          <Link
            href={webReportUrl}
            target="_blank"
            className="inline-flex h-[34px] items-center gap-1.5 rounded-btn border border-em7 bg-iv px-3 font-sans text-[12.5px] font-semibold text-em7 no-underline hover:bg-s1"
          >
            <AdminIcon name="eye" className="size-4" />
            Open Web Report
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Customer & Order Details */}
        <div className="rounded-btn border border-s2 bg-iv p-5 shadow-sm">
          <h2 className="border-b border-s2 pb-2 font-title text-[18px] text-em9">
            Customer & Payment Info
          </h2>
          <dl className="mt-3 flex flex-col gap-2.5 text-[13.5px]">
            <div className="flex justify-between">
              <dt className="text-ink6">Name</dt>
              <dd className="font-semibold text-ink">{order.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink6">Phone</dt>
              <dd className="font-semibold text-ink">{order.phone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink6">Email</dt>
              <dd className="font-semibold text-ink">{order.email || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink6">Amount</dt>
              <dd className="font-mono font-bold text-em9">{fmt(order.priceInr)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink6">Ordered At</dt>
              <dd className="text-ink">{formatIst(order.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink6">Paid At</dt>
              <dd className="text-ink">{order.paidAt ? formatIst(order.paidAt) : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink6">Razorpay Order ID</dt>
              <dd className="font-mono text-xs text-ink">{order.razorpayOrderId || "—"}</dd>
            </div>
            {order.payment && (
              <>
                <div className="flex justify-between">
                  <dt className="text-ink6">Payment ID</dt>
                  <dd className="font-mono text-xs text-ink">{order.payment.rzpPaymentId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink6">Payment Method</dt>
                  <dd className="capitalize text-ink">{order.payment.method || "online"}</dd>
                </div>
              </>
            )}
          </dl>
        </div>

        {/* Birth Data */}
        <div className="rounded-btn border border-s2 bg-iv p-5 shadow-sm">
          <h2 className="border-b border-s2 pb-2 font-title text-[18px] text-em9">
            Birth Profile
          </h2>
          <dl className="mt-3 flex flex-col gap-2.5 text-[13.5px]">
            <div className="flex justify-between">
              <dt className="text-ink6">Date of Birth</dt>
              <dd className="font-semibold text-ink">{order.dob}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink6">Time of Birth</dt>
              <dd className="text-ink">
                {order.tobUnknown ? "Time Unknown (Noon calculation)" : order.tob || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink6">Birth Place</dt>
              <dd className="font-medium text-ink">{order.place}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink6">Coordinates</dt>
              <dd className="font-mono text-xs text-ink6">
                {order.lat.toFixed(4)}°, {order.lon.toFixed(4)}°
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink6">Timezone</dt>
              <dd className="font-mono text-xs text-ink6">{order.tz}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink6">Report Language</dt>
              <dd className="font-semibold text-em7">
                {order.reportLang === "hi" ? "हिंदी (Hindi)" : "English"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Vedic Chart Snapshot Summary */}
      {chart && (
        <div className="rounded-btn border border-s2 bg-iv p-5 shadow-sm">
          <h2 className="border-b border-s2 pb-2 font-title text-[18px] text-em9">
            Astrological Chart Summary
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-btn bg-s1 p-3">
              <span className="font-sans text-[11px] font-semibold uppercase text-g7">Lagna</span>
              <div className="font-sans text-[15px] font-bold text-em9">
                {chart.lagna ? RASHI_NAMES[chart.lagna.sign] : "Unknown (Moon Lagna)"}
              </div>
            </div>
            <div className="rounded-btn bg-s1 p-3">
              <span className="font-sans text-[11px] font-semibold uppercase text-g7">Rashi (Moon)</span>
              <div className="font-sans text-[15px] font-bold text-em9">
                {RASHI_NAMES[chart.moonSign]}
              </div>
            </div>
            <div className="rounded-btn bg-s1 p-3">
              <span className="font-sans text-[11px] font-semibold uppercase text-g7">Sun Sign</span>
              <div className="font-sans text-[15px] font-bold text-em9">
                {RASHI_NAMES[chart.sunSign]}
              </div>
            </div>
            <div className="rounded-btn bg-s1 p-3">
              <span className="font-sans text-[11px] font-semibold uppercase text-g7">Nakshatra</span>
              <div className="font-sans text-[15px] font-bold text-em9">
                Nakshatra #{chart.nakshatra.index + 1}, Pada {chart.nakshatra.pada}
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-s2 pt-4">
            <h3 className="font-sans text-[13px] font-semibold uppercase tracking-wider text-g7">
              Key Dosha Checks
            </h3>
            <div className="mt-2 flex flex-wrap gap-4 text-[13.5px]">
              <div>
                <span className="text-ink6">Manglik: </span>
                <span className="font-semibold text-ink">
                  {chart.doshas.manglik.fromLagna || chart.doshas.manglik.fromMoon
                    ? "Present (Manglik)"
                    : "Not Present"}
                </span>
              </div>
              <div>
                <span className="text-ink6">Kaal Sarp: </span>
                <span className="font-semibold text-ink">
                  {chart.doshas.kaalSarp.present
                    ? `Present (Type ${chart.doshas.kaalSarp.type})`
                    : "Not Present"}
                </span>
              </div>
              <div>
                <span className="text-ink6">Sade Sati: </span>
                <span className="font-semibold text-ink">
                  {chart.doshas.sadeSati.active
                    ? `Active (${chart.doshas.sadeSati.phase} phase)`
                    : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-s2 pt-4">
            <h3 className="font-sans text-[13px] font-semibold uppercase tracking-wider text-g7">
              Planetary Positions (9 Grahas)
            </h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left font-sans text-[13px]">
                <thead>
                  <tr className="border-b border-s2 text-[11px] font-semibold uppercase text-ink6">
                    <th className="py-1.5">Graha</th>
                    <th className="py-1.5">Sign</th>
                    <th className="py-1.5">Degree</th>
                    <th className="py-1.5">House</th>
                    <th className="py-1.5">Retro</th>
                  </tr>
                </thead>
                <tbody>
                  {chart.planets.map((p) => (
                    <tr key={p.k} className="border-b border-s2/40">
                      <td className="py-1.5 font-semibold uppercase text-em7">{p.k}</td>
                      <td className="py-1.5 text-ink">{RASHI_NAMES[p.sign]}</td>
                      <td className="py-1.5 font-mono text-xs text-ink">{p.deg.toFixed(2)}°</td>
                      <td className="py-1.5 font-mono text-xs text-ink">{p.house}</td>
                      <td className="py-1.5 font-mono text-xs text-ink">
                        {p.retro ? <span className="text-sin font-bold">R</span> : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
