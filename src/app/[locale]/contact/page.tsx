import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { ContactCards } from "@/components/sections/contact/ContactCards";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <main className="mx-auto max-w-[1100px] px-[clamp(16px,4vw,32px)] py-[clamp(40px,6vw,72px)]">
      <h1 className="mb-2 font-display text-[clamp(28px,3vw,38px)] leading-[1.15] font-normal text-ink">
        {t("heading")}
      </h1>
      <p className="mb-10 max-w-[600px] font-sans text-[15px] leading-[1.55] font-medium text-ink6">
        {t("subheading")}
      </p>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
        <ContactForm />
        <ContactCards />
      </div>
    </main>
  );
}
