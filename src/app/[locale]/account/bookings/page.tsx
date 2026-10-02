import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireCustomerPage } from "@/server/auth/guards";
import { listMyBookings } from "@/server/bookings/queries";
import { BookingList } from "@/components/sections/account/BookingList";
import { pageMeta } from "@/lib/seo/meta";
import type { Locale } from "@/lib/domain/enums";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.bookings" });
  return pageMeta({
    locale,
    path: "/account/bookings",
    title: t("title"),
    description: t("title"),
    noindex: true,
  });
}

export default async function AccountBookingsPage({ params }: Props): Promise<React.JSX.Element> {
  const { locale } = await params;
  setRequestLocale(locale);

  const customer = await requireCustomerPage(locale as Locale, "/account/bookings");
  const bookings = await listMyBookings(customer.id);

  return <BookingList bookings={bookings} locale={locale as Locale} />;
}
