import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { requireCustomerPage } from "@/server/auth/guards";
import { listMyOrders } from "@/server/account/queries";
import { OrderList } from "@/components/sections/account/OrderList";
import type { Locale } from "@/lib/domain/enums";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "hi" ? "मेरे ऑर्डर — Maa Kali Astuti" : "My Orders — Maa Kali Astuti",
    robots: { index: false, follow: false },
  };
}

export default async function AccountOrdersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page: pageStr } = await searchParams;

  setRequestLocale(locale);

  const customer = await requireCustomerPage(locale as Locale, "/account/orders");

  const page = Math.max(1, parseInt(pageStr || "1", 10) || 1);
  const result = await listMyOrders(customer.id, page, 10);

  return (
    <OrderList
      orders={result.orders}
      totalCount={result.totalCount}
      page={result.page}
      totalPages={result.totalPages}
      locale={locale as Locale}
    />
  );
}
