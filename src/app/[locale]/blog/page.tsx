import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getArticleList } from "@/server/articles/queries";
import { BlogList } from "@/components/sections/blog/BlogList";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function BlogPage({ params }: Props): Promise<React.JSX.Element> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const articles = await getArticleList();

  return (
    <main className="bg-iv min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="text-center max-w-2xl mx-auto space-y-3.5">
          <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-g7">
            Maa Kali Astuti Journal
          </p>
          <h1 className="font-display text-[clamp(28px,3.8vw,48px)] font-normal text-em9 leading-tight font-soft">
            {t("title")}
          </h1>
          <p className="font-sans text-[16px] leading-relaxed text-ink6">
            {t("subtitle")}
          </p>
        </header>

        <BlogList articles={articles} />
      </div>
    </main>
  );
}
