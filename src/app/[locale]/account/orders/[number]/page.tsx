import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { requireCustomerPage } from "@/server/auth/guards";
import { getOrderViewForUser } from "@/server/orders/queries";
import { OrderDetail } from "@/components/sections/account/OrderDetail";
import type { Locale } from "@/lib/domain/enums";

type Props = {
  params: Promise<{ locale: string; number: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  return {
    title: `Order ${number} — Maa Kali Astuti`,
    robots: { index: false, follow: false },
  };
}

export default async function AccountOrderDetailPage({ params }: Props) {
  const { locale, number } = await params;

  setRequestLocale(locale);

  const customer = await requireCustomerPage(
    locale as Locale,
    `/account/orders/${number}`,
  );

  const order = await getOrderViewForUser(customer.id, number);

  if (!order) {
    notFound();
  }

  return <OrderDetail order={order} locale={locale as Locale} />;
}
