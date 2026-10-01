import { setRequestLocale } from "next-intl/server";
import { getCustomer } from "@/server/auth/guards";
import { AccountNav } from "@/components/sections/account/AccountNav";
import type { Locale } from "@/lib/domain/enums";

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const customer = await getCustomer();

  return (
    <div className="min-h-screen bg-iv">
      {customer && <AccountNav locale={locale as Locale} />}
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {children}
      </div>
    </div>
  );
}
