import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getCustomer } from "@/server/auth/guards";
import { getAccountOverview } from "@/server/account/queries";
import { AccountLogin } from "@/components/sections/account/AccountLogin";
import { AccountOverview } from "@/components/sections/account/AccountOverview";
import type { Locale } from "@/lib/domain/enums";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "hi" ? "मेरा खाता — Maa Kali Astuti" : "My Account — Maa Kali Astuti",
    robots: { index: false, follow: false },
  };
}

export default async function AccountPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { next } = await searchParams;

  setRequestLocale(locale);

  const customer = await getCustomer();

  if (!customer) {
    return <AccountLogin next={next} locale={locale as Locale} />;
  }

  const overview = await getAccountOverview(customer.id);

  return <AccountOverview overview={overview} locale={locale as Locale} />;
}
