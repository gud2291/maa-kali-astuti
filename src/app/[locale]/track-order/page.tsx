import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TrackOrderForm } from "@/components/sections/track/TrackOrderForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "track" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-[75vh] bg-iv py-12 md:py-16">
      <div className="mx-auto max-w-[640px] px-4 sm:px-6">
        <TrackOrderForm />
      </div>
    </main>
  );
}
