import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { buildMonthlyReport, MONTH_RE } from "@/server/reports/monthly";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ReportDownload } from "@/components/admin/reports/ReportDownload";
import { fmt } from "@/lib/core/format";
import { istDayKey } from "@/lib/core/ist";

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function label(month: string): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
}

const navBtn =
  "rounded-btn border border-s2 bg-iv px-3 py-1.5 font-sans text-xs font-semibold text-ink hover:bg-s1";

function Tile({ title, value, sub }: { title: string; value: string; sub?: string }): React.JSX.Element {
  return (
    <div className="rounded-field border border-s2 bg-iv p-4 shadow-sm">
      <div className="font-sans text-[11px] font-semibold uppercase tracking-wide text-ink6">{title}</div>
      <div className="mt-1 font-serif text-xl font-bold text-ink">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-ink6">{sub}</div>}
    </div>
  );
}

export default async function ReportsPage(props: {
  searchParams: Promise<{ month?: string }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("exports.run");
  const sp = await props.searchParams;
  const thisMonth = istDayKey(new Date()).slice(0, 7);
  const month = sp.month && MONTH_RE.test(sp.month) ? sp.month : thisMonth;
  const rep = await buildMonthlyReport(month);
  const hasNext = month < thisMonth;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Reports & CA Export"
        description="Monthly sales register with the GST split, exactly as on your invoices. Share the CSV with your accountant."
        actions={<ReportDownload month={month} disabled={rep.rows.length === 0} />}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/admin/reports?month=${shiftMonth(month, -1)}`} className={navBtn}>
          ← {label(shiftMonth(month, -1))}
        </Link>
        <span className="px-2 font-sans text-sm font-bold text-ink">{label(month)}</span>
        {hasNext && (
          <Link href={`/admin/reports?month=${shiftMonth(month, 1)}`} className={navBtn}>
            {label(shiftMonth(month, 1))} →
          </Link>
        )}
      </div>

      {!rep.isTaxInvoice && rep.rows.length > 0 && (
        <p className="rounded-field border border-g3/40 bg-g3/10 p-3 text-xs text-ink">
          No GSTIN is set under Settings → Invoice, so invoices are “Bill of Supply” and the GST columns are zero. Add your
          GSTIN once you are GST-registered.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile
          title="Orders"
          value={String(rep.rows.length)}
          sub={rep.cancelledCount ? `${rep.cancelledCount} cancelled (excluded)` : undefined}
        />
        <Tile title="Taxable value" value={fmt(rep.totals.taxableInr)} />
        <Tile
          title="Total GST"
          value={fmt(rep.totals.totalTaxInr)}
          sub={`CGST ${fmt(rep.totals.cgstInr)} · SGST ${fmt(rep.totals.sgstInr)} · IGST ${fmt(rep.totals.igstInr)}`}
        />
        <Tile
          title="Invoice total"
          value={fmt(rep.totals.grandTotalInr)}
          sub={rep.totals.refundedInr ? `Refunded ${fmt(rep.totals.refundedInr)}` : undefined}
        />
      </div>

      {rep.byRate.length > 0 && (
        <section className="rounded-field border border-s2 bg-iv p-5 shadow-sm">
          <h3 className="mb-3 font-sans text-sm font-bold text-ink">GST by rate</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-ink6">
                <tr>
                  <th className="py-2">Rate</th>
                  <th className="py-2">Taxable</th>
                  <th className="py-2">CGST</th>
                  <th className="py-2">SGST</th>
                  <th className="py-2">IGST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-s2">
                {rep.byRate.map((r) => (
                  <tr key={r.gstRate}>
                    <td className="py-2 font-bold">{r.gstRate}%</td>
                    <td className="py-2">{fmt(r.taxableInr)}</td>
                    <td className="py-2">{fmt(r.cgstInr)}</td>
                    <td className="py-2">{fmt(r.sgstInr)}</td>
                    <td className="py-2">{fmt(r.igstInr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-field border border-s2 bg-iv p-5 shadow-sm">
        <h3 className="mb-3 font-sans text-sm font-bold text-ink">Sales register</h3>
        {rep.rows.length === 0 ? (
          <p className="text-xs text-ink6">No invoiced orders in {label(month)}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="text-ink6">
                <tr>
                  <th className="py-2">Invoice</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">State</th>
                  <th className="py-2 text-right">Taxable</th>
                  <th className="py-2 text-right">GST</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-s2">
                {rep.rows.slice(0, 100).map((r) => (
                  <tr key={r.invoiceNo + r.orderNumber}>
                    <td className="py-2 font-mono">{r.invoiceNo}</td>
                    <td className="py-2">{r.date}</td>
                    <td className="py-2">{r.customer}</td>
                    <td className="py-2">{r.state}</td>
                    <td className="py-2 text-right">{fmt(r.taxableInr)}</td>
                    <td className="py-2 text-right">{fmt(r.totalTaxInr)}</td>
                    <td className="py-2 text-right font-bold">{fmt(r.grandTotalInr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rep.rows.length > 100 && (
              <p className="mt-2 text-[11px] text-ink6">Showing the first 100 of {rep.rows.length}. The CSV has all of them.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
