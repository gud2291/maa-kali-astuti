import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCustomer } from "@/server/auth/guards";
import { listMyAddresses, type SavedAddress } from "@/server/account/queries";
import { CheckoutFlow, type CheckoutPrefill } from "@/components/sections/checkout/CheckoutFlow";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return {
    title: t("pageTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const customer = await getCustomer();
  let prefill: CheckoutPrefill = {
    addresses: [],
    isSignedIn: false,
  };

  if (customer) {
    const addresses = await listMyAddresses(customer.id);
    prefill = {
      contact: {
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
      },
      addresses,
      isSignedIn: true,
    };
  }

  return <CheckoutFlow prefill={prefill} />;
}
