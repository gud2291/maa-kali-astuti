import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { requireCustomerPage } from "@/server/auth/guards";
import { listMyKundaliOrders } from "@/server/kundali/queries";
import { KundaliList } from "@/components/sections/account/KundaliList";
import type { Locale } from "@/lib/domain/enums";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "hi" ? "मेरी जन्मपत्री — Maa Kali Astuti" : "My Kundali — Maa Kali Astuti",
    robots: { index: false, follow: false },
  };
}

export default async function AccountKundaliPage({
  params,
}: Props): Promise<React.JSX.Element> {
  const { locale } = await params;
  setRequestLocale(locale);

  const customer = await requireCustomerPage(locale as Locale, "/account/kundali");
  const orders = await listMyKundaliOrders(customer.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <KundaliList orders={orders} locale={locale as Locale} />
    </div>
  );
}
