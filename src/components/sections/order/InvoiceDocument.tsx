import type { InvoiceData } from "@/server/orders/invoice";
import styles from "./InvoiceDocument.module.css";
import { fmt } from "@/lib/core/format";

export function InvoiceDocument({ invoice }: { invoice: InvoiceData }): React.JSX.Element {
  const { isTaxInvoice, isIntrastate } = invoice;

  return (
    <div className={styles.invoiceWrapper}>
      {/* Header */}
      <div className="flex flex-col justify-between border-b border-s2 pb-5 sm:flex-row sm:items-start">
        <div>
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-g7">
            {invoice.title}
          </span>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-ink">
            {invoice.seller.legalName}
          </h1>
          <p className="mt-1 font-sans text-xs text-ink6">
            Official E-Commerce Invoicing & Sacred Order Receipt
          </p>
        </div>

        <div className="mt-4 text-left font-sans text-xs sm:mt-0 sm:text-right">
          <div className="space-y-1">
            <p>
              <span className="font-semibold text-ink6">Invoice No: </span>
              <span className="font-mono font-bold text-ink">{invoice.invoiceNo}</span>
            </p>
            <p>
              <span className="font-semibold text-ink6">Order Ref: </span>
              <span className="font-mono font-medium text-ink">{invoice.orderNumber}</span>
            </p>
            <p>
              <span className="font-semibold text-ink6">Date: </span>
              <span className="text-ink">{invoice.orderDate}</span>
            </p>
            <p>
              <span className="font-semibold text-ink6">Payment Method: </span>
              <span className="uppercase text-ink">{invoice.paymentMethod}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Seller & Buyer Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 border-b border-s2 pb-6 sm:grid-cols-2">
        {/* Seller Info */}
        <div className="space-y-1 text-xs">
          <span className="font-sans font-bold uppercase tracking-wider text-ink6">
            Sold By:
          </span>
          <p className="font-semibold text-ink">{invoice.seller.legalName}</p>
          <p className="whitespace-pre-line text-ink6">{invoice.seller.address}</p>
          {invoice.seller.gstin && (
            <p className="text-ink">
              <span className="font-semibold">GSTIN: </span>
              <span className="font-mono font-bold">{invoice.seller.gstin}</span>
            </p>
          )}
          {invoice.seller.stateCode && (
            <p className="text-ink6">
              <span>State Code: </span>
              <span className="font-mono">{invoice.seller.stateCode}</span>
            </p>
          )}
          <p className="text-ink6">
            <span>Email: </span>
            <span>{invoice.seller.email}</span>
            {" · "}
            <span>Phone: </span>
            <span>{invoice.seller.phone}</span>
          </p>
        </div>

        {/* Buyer Info */}
        <div className="space-y-1 text-xs">
          <span className="font-sans font-bold uppercase tracking-wider text-ink6">
            Shipping & Billing To:
          </span>
          <p className="font-semibold text-ink">{invoice.buyer.name}</p>
          <p className="text-ink6">
            {invoice.buyer.line1}
            {invoice.buyer.line2 && <>, {invoice.buyer.line2}</>}
            {invoice.buyer.landmark && <>, {invoice.buyer.landmark}</>}
          </p>
          <p className="text-ink6">
            {invoice.buyer.city}, {invoice.buyer.state} — {invoice.buyer.pincode}
          </p>
          {invoice.buyer.stateCode && (
            <p className="text-ink6">
              <span>State Code: </span>
              <span className="font-mono">{invoice.buyer.stateCode}</span>
            </p>
          )}
          <p className="text-ink6">
            <span>Phone: </span>
            <span className="font-mono">{invoice.buyer.phone}</span>
          </p>
        </div>
      </div>

      {/* Line Items Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: "32px" }}>#</th>
            <th>Item Description</th>
            <th className={styles.textCenter} style={{ width: "70px" }}>
              HSN/SAC
            </th>
            <th className={styles.textCenter} style={{ width: "45px" }}>
              Qty
            </th>
            <th className={styles.textRight} style={{ width: "80px" }}>
              Rate (₹)
            </th>
            {isTaxInvoice && (
              <>
                <th className={styles.textRight} style={{ width: "85px" }}>
                  Taxable (₹)
                </th>
                <th className={styles.textCenter} style={{ width: "55px" }}>
                  GST
                </th>
                {isIntrastate ? (
                  <>
                    <th className={styles.textRight} style={{ width: "70px" }}>
                      CGST (₹)
                    </th>
                    <th className={styles.textRight} style={{ width: "70px" }}>
                      SGST (₹)
                    </th>
                  </>
                ) : (
                  <th className={styles.textRight} style={{ width: "80px" }}>
                    IGST (₹)
                  </th>
                )}
              </>
            )}
            <th className={styles.textRight} style={{ width: "90px" }}>
              Total (₹)
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Products */}
          {invoice.lines.map((line, idx) => (
            <tr key={`prod-${line.id}-${idx}`}>
              <td>{idx + 1}</td>
              <td>
                <span className="font-medium text-ink">{line.description}</span>
                {line.variant && (
                  <span className="ml-1 text-[11px] text-ink6">
                    (Size: {line.variant})
                  </span>
                )}
              </td>
              <td className={styles.textCenter}>
                <span className="font-mono text-xs">{line.hsn || "—"}</span>
              </td>
              <td className={styles.textCenter}>{line.qty}</td>
              <td className={styles.textRight}>{line.unitPriceInr.toFixed(2)}</td>
              {isTaxInvoice && (
                <>
                  <td className={styles.textRight}>{line.taxableInr.toFixed(2)}</td>
                  <td className={styles.textCenter}>{line.gstRate}%</td>
                  {isIntrastate ? (
                    <>
                      <td className={styles.textRight}>{line.cgstInr.toFixed(2)}</td>
                      <td className={styles.textRight}>{line.sgstInr.toFixed(2)}</td>
                    </>
                  ) : (
                    <td className={styles.textRight}>{line.igstInr.toFixed(2)}</td>
                  )}
                </>
              )}
              <td className={styles.textRight}>
                <span className="font-semibold">{line.totalInr.toFixed(2)}</span>
              </td>
            </tr>
          ))}

          {/* Fee Lines */}
          {invoice.feeLines.map((fee, idx) => (
            <tr key={`fee-${idx}`}>
              <td>{invoice.lines.length + idx + 1}</td>
              <td>
                <span className="italic text-ink">{fee.description}</span>
              </td>
              <td className={styles.textCenter}>
                <span className="font-mono text-xs">{fee.sac}</span>
              </td>
              <td className={styles.textCenter}>{fee.qty}</td>
              <td className={styles.textRight}>{fee.totalInr.toFixed(2)}</td>
              {isTaxInvoice && (
                <>
                  <td className={styles.textRight}>{fee.taxableInr.toFixed(2)}</td>
                  <td className={styles.textCenter}>{fee.gstRate}%</td>
                  {isIntrastate ? (
                    <>
                      <td className={styles.textRight}>{fee.cgstInr.toFixed(2)}</td>
                      <td className={styles.textRight}>{fee.sgstInr.toFixed(2)}</td>
                    </>
                  ) : (
                    <td className={styles.textRight}>{fee.igstInr.toFixed(2)}</td>
                  )}
                </>
              )}
              <td className={styles.textRight}>
                <span className="font-semibold">{fee.totalInr.toFixed(2)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals & Tax Summary Grid */}
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-12">
        {/* Tax Summary or Notes on the left (7 cols) */}
        <div className="sm:col-span-7">
          {isTaxInvoice && invoice.taxSummary.length > 0 && (
            <div className="rounded border border-s2 bg-iv p-3 text-xs">
              <span className="font-sans font-bold uppercase tracking-wider text-ink6">
                Tax Summary ({isIntrastate ? "Intrastate CGST + SGST" : "Interstate IGST"})
              </span>
              <table className="mt-2 w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-s2 text-[11px] text-ink6">
                    <th>Rate</th>
                    <th className="text-right">Taxable (₹)</th>
                    {isIntrastate ? (
                      <>
                        <th className="text-right">CGST (₹)</th>
                        <th className="text-right">SGST (₹)</th>
                      </>
                    ) : (
                      <th className="text-right">IGST (₹)</th>
                    )}
                    <th className="text-right">Total Tax (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.taxSummary.map((t) => (
                    <tr key={`tax-${t.rate}`} className="border-b border-s2/50">
                      <td className="font-semibold">{t.rate}%</td>
                      <td className="text-right">{t.taxableInr.toFixed(2)}</td>
                      {isIntrastate ? (
                        <>
                          <td className="text-right">{t.cgstInr.toFixed(2)}</td>
                          <td className="text-right">{t.sgstInr.toFixed(2)}</td>
                        </>
                      ) : (
                        <td className="text-right">{t.igstInr.toFixed(2)}</td>
                      )}
                      <td className="text-right font-medium">{t.totalTaxInr.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Calculation Totals on the right (5 cols) */}
        <div className="space-y-1.5 text-xs sm:col-span-5">
          <div className="flex justify-between py-0.5 text-ink6">
            <span>Items Subtotal:</span>
            <span>₹{invoice.totals.itemsInr.toFixed(2)}</span>
          </div>

          {invoice.totals.feesInr > 0 && (
            <div className="flex justify-between py-0.5 text-ink6">
              <span>Services & Fees:</span>
              <span>₹{invoice.totals.feesInr.toFixed(2)}</span>
            </div>
          )}

          {invoice.totals.discountInr > 0 && (
            <div className="flex justify-between py-0.5 text-sin">
              <span>Coupon Discount:</span>
              <span>−₹{invoice.totals.discountInr.toFixed(2)}</span>
            </div>
          )}

          {isTaxInvoice && (
            <>
              <div className="flex justify-between border-t border-s2 pt-1 text-ink6">
                <span>Total Taxable Amount:</span>
                <span>₹{invoice.totals.taxableInr.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink6">
                <span>Total Tax:</span>
                <span>₹{invoice.totals.totalTaxInr.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between border-t-2 border-ink pt-2 font-sans text-base font-bold text-ink">
            <span>Grand Total:</span>
            <span className="text-em7">{fmt(invoice.totals.grandTotalInr)}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="mt-8 border-t border-s2 pt-4 text-xs text-ink6">
        <ul className="list-inside list-disc space-y-1">
          {invoice.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
        <div className="mt-4 text-center font-sans text-[11px] text-ink6/80">
          *** Computer-generated invoice. Thank you for your reverence and patronage. ***
        </div>
      </div>
    </div>
  );
}
