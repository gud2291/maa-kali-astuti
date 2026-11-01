import Link from "next/link";
import { formatIst } from "@/lib/core/ist";
import type { StockMovementRow } from "@/server/inventory/movements";

const REASON: Record<string, string> = {
  initial: "Opening stock",
  order: "Sold",
  oversold: "Oversold (paid but short)",
  cancel_restock: "Returned to stock (cancelled order)",
  manual: "Manual adjustment",
  edit: "Edited in product form",
};

export function StockHistory({ rows }: { rows: StockMovementRow[] }): React.JSX.Element {
  return (
    <section className="rounded-field border border-s2 bg-iv p-5 shadow-sm">
      <h3 className="mb-3 font-sans text-sm font-bold text-ink">Stock history</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-ink6">No stock changes recorded yet. Every sale, cancellation and adjustment will show here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead className="text-ink6">
              <tr>
                <th className="py-2">When</th>
                <th className="py-2">What happened</th>
                <th className="py-2 text-right">Change</th>
                <th className="py-2 text-right">Stock after</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-s2">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 text-ink6">{formatIst(r.createdAt, { time: true })}</td>
                  <td className="py-2">
                    <span className="font-semibold text-ink">{REASON[r.reason] ?? r.reason}</span>
                    {r.orderId && (
                      <Link href={`/admin/orders/${r.orderId}`} className="ml-2 font-mono text-em7 hover:underline">
                        order #{r.orderId}
                      </Link>
                    )}
                    {r.note && <span className="block text-[11px] text-ink6">{r.note}</span>}
                  </td>
                  <td className={`py-2 text-right font-bold ${r.delta < 0 ? "text-sin" : "text-ok"}`}>
                    {r.delta > 0 ? `+${r.delta}` : r.delta}
                  </td>
                  <td className="py-2 text-right font-semibold text-ink">{r.balanceAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
