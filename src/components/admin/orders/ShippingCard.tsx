"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/admin/ui/toast";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import {
  bookCourierAction,
  cancelShipmentAction,
  courierOptionsAction,
  createShipmentAction,
  refreshTrackingAction,
  shippingLabelAction,
} from "@/server/shipping/actions";
import type { CourierOption } from "@/server/shipping/shiprocket";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";

export type ShippingCardShipment = {
  status: string;
  awb: string | null;
  courier: string | null;
  providerStatus: string | null;
  labelUrl: string | null;
  lastError: string | null;
  weightKg: number | null;
  lengthCm: number | null;
  breadthCm: number | null;
  heightCm: number | null;
  updatedAt: string;
};

export type ShippingCardProps = {
  orderId: number;
  orderStatus: string;
  paymentMethod: string;
  /** Whether SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD are set. */
  connected: boolean;
  missing: string[];
  webhookTokenSet: boolean;
  shipment: ShippingCardShipment | null;
  trackingUrl: string | null;
  canShip: boolean;
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  creating: { label: "Creating…", cls: "bg-s2 text-ink6" },
  created: { label: "Created — pick a courier", cls: "bg-g3/20 text-g7" },
  awb_assigned: { label: "Courier booked", cls: "bg-em7/15 text-em7" },
  in_transit: { label: "In transit", cls: "bg-em7/15 text-em7" },
  delivered: { label: "Delivered", cls: "bg-ok/15 text-ok" },
  rto: { label: "Returning to origin (RTO)", cls: "bg-rose/20 text-sin" },
  cancelled: { label: "Cancelled", cls: "bg-s2 text-ink6" },
  failed: { label: "Failed", cls: "bg-rose/20 text-sin" },
};

const inputCls =
  "w-full rounded-field border border-s2 bg-iv px-3 py-1.5 font-sans text-xs text-ink focus:border-em7 focus:outline-none";
const primaryBtn =
  "rounded-btn bg-em7 px-3 py-1.5 font-sans text-xs font-semibold text-iv hover:opacity-90 disabled:opacity-50 cursor-pointer";
const ghostBtn =
  "rounded-btn border border-s2 bg-iv px-3 py-1.5 font-sans text-xs font-semibold text-ink hover:bg-s1 disabled:opacity-50 cursor-pointer";

export function ShippingCard(props: ShippingCardProps): React.JSX.Element {
  const { orderId, connected, shipment, canShip } = props;
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [options, setOptions] = useState<CourierOption[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [parcel, setParcel] = useState({
    weightKg: String(shipment?.weightKg ?? 0.5),
    lengthCm: String(shipment?.lengthCm ?? 15),
    breadthCm: String(shipment?.breadthCm ?? 12),
    heightCm: String(shipment?.heightCm ?? 8),
  });

  const run = async <T,>(
    key: string,
    fn: () => Promise<{ ok: boolean; message?: string; data?: T }>,
    okMsg: string,
    onData?: (d: T) => void,
  ): Promise<void> => {
    setBusy(key);
    try {
      const res = await fn();
      if (!res.ok) {
        toast.err(res.message || "That didn’t work. Please try again.");
        return;
      }
      toast.ok(okMsg);
      if (onData && res.data !== undefined) onData(res.data);
      router.refresh();
    } catch (err) {
      toast.err(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  };

  const st = shipment ? (STATUS_LABEL[shipment.status] ?? { label: shipment.status, cls: "bg-s2 text-ink6" }) : null;
  const hasAwb = Boolean(shipment?.awb);
  const parcelOk =
    Number(parcel.weightKg) > 0 && Number(parcel.lengthCm) > 0 && Number(parcel.breadthCm) > 0 && Number(parcel.heightCm) > 0;

  return (
    <div className="rounded-field border border-s2 bg-iv p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-s2 pb-3">
        <h3 className="font-sans text-sm font-bold text-ink flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-em7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
            <circle cx="7.5" cy="17.5" r="1.8" />
            <circle cx="17.5" cy="17.5" r="1.8" />
          </svg>
          Shipping
        </h3>
        {st && <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${st.cls}`}>{st.label}</span>}
      </div>

      {!connected && (
        <div className="rounded-field border border-g3/40 bg-g3/10 p-3 text-xs text-ink">
          <p className="font-bold">Shiprocket is not connected yet.</p>
          <p className="mt-1 text-ink6">
            Add <span className="font-mono">{props.missing.join(", ")}</span> in Coolify → Environment Variables and redeploy.
            Until then, ship by hand and enter the courier + AWB under “Tracking” in Order Actions.
          </p>
        </div>
      )}

      {connected && !canShip && !shipment && (
        <p className="text-xs text-ink6">
          This order can’t be shipped in its current state ({props.orderStatus.replace("_", " ")}). Shipping opens once payment
          (or COD) is confirmed.
        </p>
      )}

      {/* 1. No shipment yet → parcel + send */}
      {connected && canShip && (!shipment || shipment.status === "failed") && (
        <div className="space-y-3">
          {shipment?.lastError && (
            <p className="rounded-field border border-rose/40 bg-rose/15 p-2.5 text-xs text-sin">
              Last attempt failed: {shipment.lastError}
            </p>
          )}
          <p className="text-xs text-ink6">Parcel size and weight (used for courier rates). Defaults suit a small pack.</p>
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                ["weightKg", "Weight (kg)"],
                ["lengthCm", "Length (cm)"],
                ["breadthCm", "Breadth (cm)"],
                ["heightCm", "Height (cm)"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="block">
                <span className="block text-[10px] font-semibold text-ink6 mb-1">{label}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0.05}
                  step={k === "weightKg" ? 0.05 : 1}
                  value={parcel[k]}
                  onChange={(e) => setParcel((p) => ({ ...p, [k]: e.target.value }))}
                  className={inputCls}
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={busy !== null || !parcelOk}
            className={primaryBtn}
            onClick={() =>
              run(
                "create",
                () =>
                  createShipmentAction(orderId, {
                    weightKg: Number(parcel.weightKg),
                    lengthCm: Number(parcel.lengthCm),
                    breadthCm: Number(parcel.breadthCm),
                    heightCm: Number(parcel.heightCm),
                  }),
                "Order sent to Shiprocket",
              )
            }
          >
            {busy === "create" ? "Sending…" : shipment?.status === "failed" ? "Retry sending to Shiprocket" : "Send to Shiprocket"}
          </button>
        </div>
      )}

      {/* 2. Created, no courier → rates + book */}
      {connected && shipment && (shipment.status === "created" || (shipment.status === "awb_assigned" && !hasAwb)) && !hasAwb && (
        <div className="space-y-3">
          <p className="text-xs text-ink6">
            Parcel {shipment.weightKg} kg · {shipment.lengthCm}×{shipment.breadthCm}×{shipment.heightCm} cm
            {props.paymentMethod === "cod" ? " · Cash on delivery" : ""}
          </p>
          {!options && (
            <button
              type="button"
              disabled={busy !== null}
              className={ghostBtn}
              onClick={() =>
                run<CourierOption[]>("rates", () => courierOptionsAction(orderId), "Courier options loaded", (d) => {
                  setOptions(d);
                  setSelected(d[0]?.courierId ?? null);
                })
              }
            >
              {busy === "rates" ? "Checking…" : "Check couriers & rates"}
            </button>
          )}
          {options && options.length === 0 && (
            <p className="rounded-field border border-rose/40 bg-rose/15 p-2.5 text-xs text-sin">
              No courier serves this pincode for this parcel. Check the address or book from the Shiprocket panel.
            </p>
          )}
          {options && options.length > 0 && (
            <div className="space-y-2">
              <ul className="max-h-56 space-y-1.5 overflow-auto pr-1">
                {options.map((o) => (
                  <li key={o.courierId}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-field border px-3 py-2 text-xs ${
                        selected === o.courierId ? "border-em7 bg-em7/5" : "border-s2 bg-iv"
                      }`}
                    >
                      <input
                        type="radio"
                        name="courier"
                        checked={selected === o.courierId}
                        onChange={() => setSelected(o.courierId)}
                        className="accent-em7"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-ink truncate">{o.name}</span>
                        <span className="block text-ink6">
                          {o.etaDays ? `${o.etaDays} day${o.etaDays > 1 ? "s" : ""}` : o.etd ?? "ETA n/a"}
                          {o.rating ? ` · ★ ${o.rating.toFixed(1)}` : ""}
                          {props.paymentMethod === "cod" && !o.codAvailable ? " · no COD" : ""}
                        </span>
                      </span>
                      <span className="font-bold text-ink">{fmt(o.rateInr)}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy !== null || selected === null}
                  className={primaryBtn}
                  onClick={() =>
                    run("book", () => bookCourierAction(orderId, selected ?? undefined), "Courier booked, pickup requested")
                  }
                >
                  {busy === "book" ? "Booking…" : "Book selected courier"}
                </button>
              </div>
            </div>
          )}
          {!options && (
            <button
              type="button"
              disabled={busy !== null}
              className={ghostBtn}
              onClick={() => run("book", () => bookCourierAction(orderId), "Courier booked, pickup requested")}
            >
              {busy === "book" ? "Booking…" : "Auto-book best courier (Shiprocket picks)"}
            </button>
          )}
        </div>
      )}

      {/* 3. Courier booked → AWB, label, track, cancel */}
      {shipment && hasAwb && (
        <div className="space-y-3">
          <dl className="space-y-1.5 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="font-semibold text-ink6">Courier</dt>
              <dd className="font-bold text-ink">{shipment.courier ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-semibold text-ink6">AWB</dt>
              <dd className="font-mono font-bold text-ink">{shipment.awb}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-semibold text-ink6">Latest update</dt>
              <dd className="text-ink text-right">{shipment.providerStatus ?? "Awaiting pickup"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-semibold text-ink6">Updated</dt>
              <dd className="text-ink6">{formatIst(new Date(shipment.updatedAt), { time: true })}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== null}
              className={primaryBtn}
              onClick={() =>
                run<{ url: string }>("label", () => shippingLabelAction(orderId), "Label ready", (d) => {
                  window.open(d.url, "_blank", "noopener,noreferrer");
                })
              }
            >
              {busy === "label" ? "Preparing…" : "Download label"}
            </button>
            {props.trackingUrl && (
              <a href={props.trackingUrl} target="_blank" rel="noopener noreferrer" className={ghostBtn}>
                Track parcel
              </a>
            )}
            <button
              type="button"
              disabled={busy !== null}
              className={ghostBtn}
              onClick={() => run("refresh", () => refreshTrackingAction(orderId), "Tracking refreshed")}
            >
              {busy === "refresh" ? "Refreshing…" : "Refresh status"}
            </button>
            {(shipment.status === "awb_assigned" || shipment.status === "created") && (
              <ConfirmDialog
                title="Cancel this shipment?"
                tone="danger"
                body={<span>The booking is cancelled in Shiprocket. The order itself stays as it is, and you can send it again.</span>}
                confirmLabel="Cancel shipment"
                onConfirm={async () => {
                  const res = await cancelShipmentAction(orderId);
                  if (!res.ok) {
                    toast.err(res.message || "Could not cancel the shipment");
                    return false;
                  }
                  toast.ok("Shipment cancelled");
                  router.refresh();
                  return true;
                }}
                trigger={
                  <button type="button" className={`${ghostBtn} text-sin`}>
                    Cancel shipment
                  </button>
                }
              />
            )}
          </div>
        </div>
      )}

      {connected && !props.webhookTokenSet && (
        <p className="text-[11px] text-ink6">
          Live courier updates are off: set <span className="font-mono">SHIPROCKET_WEBHOOK_TOKEN</span> and add the webhook{" "}
          <span className="font-mono">/api/hooks/tracking</span> in Shiprocket. Until then use “Refresh status”.
        </p>
      )}
    </div>
  );
}
