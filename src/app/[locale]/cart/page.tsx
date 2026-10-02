import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CartPageView } from "@/components/sections/cart/CartPageView";
import { pageMeta } from "@/lib/seo/meta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cartPage" });
  return pageMeta({
    locale,
    path: "/cart",
    title: t("title"),
    description: t("description"),
    noindex: true,
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CartPageView />;
}
