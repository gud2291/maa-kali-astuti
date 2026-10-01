import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { requireCustomerPage } from "@/server/auth/guards";
import { getMyProfile } from "@/server/account/queries";
import { ProfileForm } from "@/components/sections/account/ProfileForm";
import type { Locale } from "@/lib/domain/enums";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "hi"
        ? "प्रोफ़ाइल एवं जन्म विवरण — Maa Kali Astuti"
        : "Profile & Birth Details — Maa Kali Astuti",
    robots: { index: false, follow: false },
  };
}

export default async function AccountProfilePage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const customer = await requireCustomerPage(
    locale as Locale,
    "/account/profile",
  );

  const profile = await getMyProfile(customer.id);

  return <ProfileForm profile={profile} locale={locale as Locale} />;
}
