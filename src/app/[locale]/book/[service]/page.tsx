import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingFlow } from "@/components/sections/booking/BookingFlow";
import { getConsultSteps, getModes, getService, getServices } from "@/lib/api/consult";
import { getSetting } from "@/server/settings/queries";
import type { ConsultRules } from "@/server/bookings/availability";

/* Booking (design/Booking.dc.html#s=<key>&tier=<t>): /book/kundali-reading?tier=detailed …
   (INV §C). Static per service slug; the tier query, the steps and the confirmation are client
   state inside BookingFlow. Unknown slugs 404. Chrome (chrome-config): checkout bar with
   "← Consultations" and "Secure booking", no tab bar, FAB lifted to 104px, footer only on the
   confirmation. */
type Props = { params: Promise<{ locale: string; service: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, service } = await params;
  const s = await getService(service, locale);
  if (!s) return {};
  const t = await getTranslations({ locale, namespace: "booking.meta" });
  return { title: t("title", { name: s.name }), description: t("description", { name: s.name }) };
}

export default async function BookPage({ params }: Props) {
  const { locale, service } = await params;
  setRequestLocale(locale);
  const s = await getService(service, locale);
  if (!s || s.slug !== service) notFound();
  const [services, modes, steps, consult] = await Promise.all([
    getServices(locale),
    getModes(),
    getConsultSteps(),
    getSetting("consult"),
  ]);

  const rules: ConsultRules = {
    openDays: consult.openDays,
    bookingWindowDays: consult.bookingWindowDays,
    minLeadHours: consult.minLeadHours,
    blocked: consult.blocked,
  };

  return (
    <BookingFlow
      services={services}
      modes={modes}
      stepIcons={steps.map(([icon]) => icon)}
      rules={rules}
      key={s.key}
      initialKey={s.key}
    />
  );
}
