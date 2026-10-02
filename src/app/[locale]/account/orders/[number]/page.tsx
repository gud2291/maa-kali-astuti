import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { requireCustomerPage } from "@/server/auth/guards";
import { getOrderViewForUser } from "@/server/orders/queries";
import { OrderDetail } from "@/components/sections/account/OrderDetail";
import { pageMeta } from "@/lib/seo/meta";
import type { Locale } from "@/lib/domain/enums";

type Props = {
  params: Promise<{ locale: string; number: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, number } = await params;
  return pageMeta({
    locale,
    path: `/account/orders/${number}`,
    title: `Order ${number} — Maa Kali Astuti`,
    description: `Order ${number}`,
    noindex: true,
  });
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
