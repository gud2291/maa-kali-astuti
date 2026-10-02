import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { UnsubscribeConfirm } from "@/components/sections/contact/UnsubscribeConfirm";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "newsletter" });
  return {
    title: t("unsub.metaTitle"),
    robots: { index: false },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const token = sp.t ?? "";
  const t = await getTranslations("newsletter");

  if (!token) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="font-sans text-[15px] leading-[1.5] font-medium text-ink6">
          {t("unsub.invalidLink")}
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-20">
      <UnsubscribeConfirm token={token} />
    </main>
  );
}
