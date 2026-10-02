import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireCustomerPage } from "@/server/auth/guards";
import { listMyAddresses } from "@/server/account/queries";
import { AddressBook } from "@/components/sections/account/AddressBook";
import { pageMeta } from "@/lib/seo/meta";
import type { Locale } from "@/lib/domain/enums";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.addresses" });
  return pageMeta({
    locale,
    path: "/account/addresses",
    title: t("title"),
    description: t("title"),
    noindex: true,
  });
}

export default async function AccountAddressesPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const customer = await requireCustomerPage(
    locale as Locale,
    "/account/addresses",
  );

  const addresses = await listMyAddresses(customer.id);

  return <AddressBook initialAddresses={addresses} locale={locale as Locale} />;
}
