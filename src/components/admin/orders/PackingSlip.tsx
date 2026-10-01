import { formatIst } from "@/lib/core/ist";
import type { orders, orderItems } from "@/server/db/schema/commerce";
import styles from "@/components/sections/order/InvoiceDocument.module.css";

export type PackingSlipProps = {
  order: typeof orders.$inferSelect;
  items: (typeof orderItems.$inferSelect)[];
};

export function PackingSlip({ order, items }: PackingSlipProps): React.JSX.Element {
  const address = order.shipAddress;

  return (
    <div className={styles.invoiceWrapper}>
      {/* Header */}
      <div className="flex flex-col justify-between border-b border-s2 pb-5 sm:flex-row sm:items-start">
        <div>
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-g7">
            Dispatch & Fulfillment Manifest
          </span>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-ink">
            Maa Kali Astuti
          </h1>
          <p className="mt-1 font-sans text-xs text-ink6">
            Sacred Storefront & Vedic Sanctification Warehouse
          </p>
        </div>

        <div className="mt-4 text-left font-sans text-xs sm:mt-0 sm:text-right">
          <div className="space-y-1">
            <p>
              <span className="font-semibold text-ink6">Order Ref: </span>
              <span className="font-mono font-bold text-ink text-sm">{order.number}</span>
            </p>
            <p>
              <span className="font-semibold text-ink6">Order Date: </span>
              <span className="text-ink">{formatIst(order.createdAt, { time: false })}</span>
            </p>
            <p>
              <span className="font-semibold text-ink6">Delivery Mode: </span>
              <span className="uppercase text-ink font-semibold">{order.delivery}</span>
            </p>
            {order.courier && (
              <p>
                <span className="font-semibold text-ink6">Courier: </span>
                <span className="text-ink font-semibold">{order.courier}</span>
              </p>
            )}
            {order.awb && (
              <p>
                <span className="font-semibold text-ink6">AWB: </span>
                <span className="font-mono text-ink font-bold">{order.awb}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ship-To & Energization Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 border-b border-s2 pb-6 sm:grid-cols-2">
        {/* Recipient Ship-To */}
        <div className="space-y-1 text-xs">
          <span className="font-sans font-bold uppercase tracking-wider text-ink6">
            Ship To (Recipient):
          </span>
          <p className="font-bold text-ink text-sm">{address.name}</p>
          <p className="text-ink">{address.line1}</p>
          {address.line2 && <p className="text-ink">{address.line2}</p>}
          {address.landmark && (
            <p className="text-ink6">Landmark: {address.landmark}</p>
          )}
          <p className="font-semibold text-ink">
            {address.city}, {address.state} -{" "}
            <span className="font-mono font-bold">{address.pincode}</span>
          </p>
          <p className="text-ink font-mono mt-1">Tel: {address.phone}</p>
        </div>

        {/* Fulfillment & Sanctification Note */}
        <div className="space-y-2 text-xs">
          <span className="font-sans font-bold uppercase tracking-wider text-ink6">
            Fulfillment Details:
          </span>
          {order.energizationOn ? (
            <div className="rounded-field bg-cream/70 p-2.5 border border-s2">
              <span className="font-bold text-g7 block">
                Vedic Energization Scheduled:
              </span>
              <span className="text-ink font-medium">
                Mahapuja Date: {order.energizationOn}
              </span>
            </div>
          ) : (
            <div className="rounded-field bg-cream/50 p-2.5 border border-s2 text-ink6">
              Standard order packaging (No specific Mahapuja date hold).
            </div>
          )}

          {order.gift && (
            <div className="rounded-field bg-rose/10 p-2.5 border border-rose/30">
              <span className="font-bold text-sin block">Gift Order:</span>
              <p className="italic text-ink">
                &ldquo;{order.giftMessage || "Gift packaging requested"}&rdquo;
              </p>
            </div>
          )}

          {order.customerNote && (
            <div>
              <span className="font-semibold text-ink6">Customer Note: </span>
              <span className="text-ink">{order.customerNote}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table (Strictly NO PRICES) */}
      <div className="mt-6">
        <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-ink6 mb-3">
          Manifest Items Checklist
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ink/20 font-sans font-semibold text-ink6">
                <th className="pb-2 w-10">#</th>
                <th className="pb-2">Item Description & Sanctification</th>
                <th className="pb-2 w-28">Variant</th>
                <th className="pb-2 w-16 text-center">Qty</th>
                <th className="pb-2 w-20 text-center">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-s2">
              {items.map((it, idx) => (
                <tr key={it.id} className="align-top">
                  <td className="py-3 font-mono text-ink6">{idx + 1}</td>
                  <td className="py-3 pr-4">
                    <p className="font-bold text-ink text-sm">{it.nameEn}</p>
                    <p className="font-deva text-xs text-ink6">{it.nameHi}</p>
                    {(it.energName || it.energGotra) && (
                      <div className="mt-1 inline-block rounded-field bg-g1/50 border border-g3/40 px-2 py-0.5 text-[11px] text-g7 font-medium">
                        <strong>Pran-Pratishtha: </strong>
                        Devotee: {it.energName || "Self"}
                        {it.energGotra ? ` • Gotra: ${it.energGotra}` : ""}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-ink6">
                    {it.variant ? (
                      <span className="font-semibold">Size: {it.variant}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 text-center font-bold text-sm text-ink">
                    {it.qty}
                  </td>
                  <td className="py-3 text-center">
                    <div className="inline-block h-4 w-4 rounded border border-ink/40" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warehouse Packer Verification Sign-off */}
      <div className="mt-10 border-t border-s2 pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-ink6">
          <div>
            <span className="font-semibold block text-ink">Total Units:</span>
            <span className="text-sm font-bold text-ink">
              {items.reduce((acc, it) => acc + it.qty, 0)}
            </span>
          </div>
          <div>
            <span className="font-semibold block text-ink">Packed By:</span>
            <div className="mt-3 border-b border-ink/30 w-28" />
          </div>
          <div>
            <span className="font-semibold block text-ink">Checked By:</span>
            <div className="mt-3 border-b border-ink/30 w-28" />
          </div>
          <div>
            <span className="font-semibold block text-ink">Dispatch Date:</span>
            <div className="mt-3 border-b border-ink/30 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
