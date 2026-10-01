import { notFound } from "next/navigation";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { orders, orderItems } from "@/server/db/schema/commerce";
import { requireAdminPage } from "@/server/auth/guards";
import { getSetting } from "@/server/settings/queries";
import { buildInvoice } from "@/server/orders/invoice";
import { InvoiceDocument } from "@/components/sections/order/InvoiceDocument";
import { PrintButton } from "@/components/sections/order/PrintButton";
import { Icon } from "@/components/icons/Icon";
import styles from "@/components/sections/order/InvoiceDocument.module.css";

export default async function AdminOrderInvoicePage(props: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("orders.view");

  const p = await props.params;
  const orderId = Number(p.id);
  if (!orderId || isNaN(orderId)) {
    notFound();
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    notFound();
  }

  const [items, invoiceSettings, contactSettings] = await Promise.all([
    db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .orderBy(asc(orderItems.id)),
    getSetting("invoice"),
    getSetting("contact"),
  ]);

  const invoiceData = buildInvoice(order, items, invoiceSettings, contactSettings);

  return (
    <main className="min-h-screen bg-iv py-6 px-4 sm:py-10 sm:px-6">
      {/* Top action header (hidden when printing) */}
      <div
        className={`mx-auto mb-6 flex max-w-[820px] items-center justify-between gap-4 ${styles.noPrint}`}
      >
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-em7 hover:text-em9 hover:underline"
        >
          <Icon name="arrowL" className="size-3.5" />
          <span>Back to order admin</span>
        </Link>

        <div className="flex items-center gap-3">
          <PrintButton label="Print / Download PDF" />
        </div>
      </div>

      {/* Invoice Document */}
      <InvoiceDocument invoice={invoiceData} />
    </main>
  );
}
