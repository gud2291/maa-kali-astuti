import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getCustomer } from "@/server/auth/guards";
import { getBookingView, getBookingViewForUser } from "@/server/bookings/queries";
import { getSetting } from "@/server/settings/queries";
import { getConsultRows } from "@/server/consult/queries";
import type { ConsultRules } from "@/server/bookings/availability";
import { BookingManage } from "@/components/sections/booking/BookingManage";
import { pageMeta } from "@/lib/seo/meta";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; ref: string }>;
  searchParams: Promise<{ k?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, ref } = await params;
  return pageMeta({
    locale,
    path: `/booking/${ref}`,
    title: `Booking ${ref} — Maa Kali Astuti`,
    description: `Booking ${ref}`,
    noindex: true,
  });
}

export default async function BookingManagePage({
  params,
  searchParams,
}: Props): Promise<React.JSX.Element> {
  const { locale, ref } = await params;
  const { k } = await searchParams;

  setRequestLocale(locale);

  let booking = null;

  if (k) {
    booking = await getBookingView(ref, k);
  }

  if (!booking) {
    const customer = await getCustomer();
    if (customer) {
      booking = await getBookingViewForUser(customer.id, ref);
    }
  }

  if (!booking) {
    notFound();
  }

  const [consult, contact, consultData] = await Promise.all([
    getSetting("consult"),
    getSetting("contact"),
    getConsultRows(),
  ]);

  const tier = consultData.tiers.find(
    (t) => t.serviceKey === booking.serviceKey && t.tierKey === booking.tierKey,
  );
  const mins = tier ? tier.mins : 30;

  const rules: ConsultRules = {
    openDays: consult.openDays,
    bookingWindowDays: consult.bookingWindowDays,
    minLeadHours: consult.minLeadHours,
    blocked: consult.blocked,
  };

  return (
    <main className="min-h-[75vh] bg-iv py-6 md:py-10">
      <BookingManage
        booking={booking}
        rules={rules}
        mins={mins}
        accessKey={k}
        whatsapp={contact.whatsapp}
      />
    </main>
  );
}
