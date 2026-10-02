import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getOrderView } from "@/server/orders/queries";
import { OrderSuccess } from "@/components/sections/order/OrderSuccess";
import { pageMeta } from "@/lib/seo/meta";
import type { Locale } from "@/lib/domain/enums";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ no?: string; k?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "order" });
  return pageMeta({
    locale,
    path: "/order/success",
    title: `${t("title")} — Maa Kali Astuti`,
    description: t("title"),
    noindex: true,
  });
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  const { no, k } = await searchParams;

  setRequestLocale(locale);

  if (!no || !k) {
    notFound();
  }

  const order = await getOrderView(no, k);
  if (!order) {
    notFound();
  }

  return <OrderSuccess order={order} locale={locale as Locale} />;
}
