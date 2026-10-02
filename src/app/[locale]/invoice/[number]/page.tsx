import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { orders, orderItems } from "@/server/db/schema/commerce";
import { getCustomer } from "@/server/auth/guards";
import { safeEqualHex, sha256Hex } from "@/server/ids";
import { getSetting } from "@/server/settings/queries";
import { buildInvoice } from "@/server/orders/invoice";
import { InvoiceDocument } from "@/components/sections/order/InvoiceDocument";
import { PrintButton } from "@/components/sections/order/PrintButton";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import styles from "@/components/sections/order/InvoiceDocument.module.css";
import { pageMeta } from "@/lib/seo/meta";

type Props = {
  params: Promise<{ locale: string; number: string }>;
  searchParams: Promise<{ k?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, number } = await params;
  return pageMeta({
    locale,
    path: `/invoice/${number}`,
    title: `Invoice ${number} — Maa Kali Astuti`,
    description: `Tax invoice ${number}`,
    noindex: true,
  });
}

export default async function InvoicePage({ params, searchParams }: Props) {
  const { locale, number } = await params;
  const { k } = await searchParams;

  setRequestLocale(locale);

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.number, number))
    .limit(1);

  if (!order) {
    notFound();
  }

  // Access check: either accessKey k OR owner's session
  let isAuthorized = false;

  if (k) {
    const keyHash = sha256Hex(k);
    if (safeEqualHex(keyHash, order.accessHash)) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    const customer = await getCustomer();
    if (customer && order.userId && customer.id === order.userId) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
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
      {/* Action header bar (hidden on print) */}
      <div className={`mx-auto mb-6 flex max-w-[820px] items-center justify-between gap-4 ${styles.noPrint}`}>
        <Link
          href={`/account/orders/${order.number}`}
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-em7 hover:text-em9 hover:underline"
        >
          <Icon name="arrowL" className="size-3.5" />
          <span>Back to order details</span>
        </Link>

        <div className="flex items-center gap-3">
          <PrintButton label="Print / Download PDF" />
        </div>
      </div>

      {/* Printable Invoice Document */}
      <InvoiceDocument invoice={invoiceData} />
    </main>
  );
}
