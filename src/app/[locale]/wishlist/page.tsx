import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { WishlistView } from "@/components/sections/wishlist/WishlistView";
import { pageMeta } from "@/lib/seo/meta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wishlistPage" });
  return pageMeta({
    locale,
    path: "/wishlist",
    title: t("title"),
    description: t("subtitle"),
    noindex: true,
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-[75vh] bg-iv py-10 md:py-14">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <WishlistView />
      </div>
    </main>
  );
}
