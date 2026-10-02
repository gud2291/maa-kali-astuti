import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { UnsubscribeConfirm } from "@/components/sections/contact/UnsubscribeConfirm";
import { pageMeta } from "@/lib/seo/meta";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "newsletter" });
  return pageMeta({
    locale,
    path: "/newsletter/unsubscribe",
    title: t("unsub.metaTitle"),
    description: t("unsub.title"),
    noindex: true,
  });
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
