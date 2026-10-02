import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireCustomerPage } from "@/server/auth/guards";
import { getMyProfile } from "@/server/account/queries";
import { ProfileForm } from "@/components/sections/account/ProfileForm";
import { pageMeta } from "@/lib/seo/meta";
import type { Locale } from "@/lib/domain/enums";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.profile" });
  return pageMeta({
    locale,
    path: "/account/profile",
    title: t("title"),
    description: t("title"),
    noindex: true,
  });
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
