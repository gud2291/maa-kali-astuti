import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { orders, orderItems } from "@/server/db/schema/commerce";
import { getSetting } from "@/server/settings/queries";
import { accessKeyFor } from "@/server/ids";
import { absoluteUrl } from "@/server/request";
import { sendEmail } from "@/server/email/send";
import { log } from "@/server/log";
import {
  OrderPlacedEmail,
  orderPlacedSubject,
} from "@/server/email/templates/OrderPlacedEmail";
import { AdminOrderAlertEmail } from "@/server/email/templates/AdminOrderAlertEmail";
import type { Locale, PaymentMethod, PaymentStatus } from "@/lib/domain/enums";

export async function sendOrderPlacedEmails(orderId: number): Promise<void> {
  try {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      log.warn("order.email_order_not_found", { orderId });
      return;
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const [notify, contact] = await Promise.all([
      getSetting("notify"),
      getSetting("contact"),
    ]);

    const accessKey = accessKeyFor("order", order.number);
    const isHi = order.locale === "hi";
    const successPath = isHi
      ? `/hi/order/success?no=${encodeURIComponent(order.number)}&k=${encodeURIComponent(accessKey)}`
      : `/order/success?no=${encodeURIComponent(order.number)}&k=${encodeURIComponent(accessKey)}`;
    const orderUrl = absoluteUrl(successPath);

    // Customer email
    try {
      const emailItems = items.map((it) => ({
        name: isHi ? it.nameHi : it.nameEn,
        qty: it.qty,
        priceInr: it.priceInr,
        lineTotalInr: it.lineTotalInr,
        variant: it.variant,
        energName: it.energName,
        energGotra: it.energGotra,
      }));

      await sendEmail({
        to: order.email,
        subject: orderPlacedSubject(order.locale as Locale, order.number),
        react: (
          <OrderPlacedEmail
            locale={order.locale as Locale}
            number={order.number}
            orderUrl={orderUrl}
            customerName={order.name}
            items={emailItems}
            totals={{
              items: order.itemsInr,
              energ: order.energInr,
              discount: order.discountInr,
              shipping: order.shippingInr,
              express: order.expressInr,
              cod: order.codInr,
              total: order.totalInr,
            }}
            paymentMethod={order.paymentMethod as PaymentMethod}
            paymentStatus={order.paymentStatus as PaymentStatus}
            shipAddress={order.shipAddress}
            energizationOn={order.energizationOn}
            contact={{
              phoneDisplay: contact?.phoneDisplay,
              email: contact?.email,
            }}
          />
        ),
      });
    } catch (err) {
      log.error("order.customer_email_error", {
        orderId,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    // Admin alert email
    if (notify.orderAlerts && notify.adminEmails && notify.adminEmails.length > 0) {
      try {
        const adminUrl = absoluteUrl(`/admin/orders/${order.id}`);
        const totalItemsCount = items.reduce((sum, it) => sum + it.qty, 0);

        await sendEmail({
          to: notify.adminEmails,
          subject: `[New Order] ${order.number} — ₹${order.totalInr}`,
          react: (
            <AdminOrderAlertEmail
              number={order.number}
              orderId={order.id}
              totalInr={order.totalInr}
              paymentMethod={order.paymentMethod as PaymentMethod}
              paymentStatus={order.paymentStatus as PaymentStatus}
              itemCount={totalItemsCount}
              customerName={order.name}
              customerPhone={order.phone}
              customerEmail={order.email}
              adminUrl={adminUrl}
            />
          ),
        });
      } catch (err) {
        log.error("order.admin_email_error", {
          orderId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  } catch (err) {
    log.error("order.sendOrderPlacedEmails_failed", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
