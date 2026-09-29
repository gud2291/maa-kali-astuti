import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontVariables } from "../fonts";
import { AmbientRoot } from "@/components/motion/AmbientRoot";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { default: t("title"), template: `%s · ${t("siteName")}` },
    description: t("description"),
    applicationName: t("siteName"),
  };
}

export const viewport: Viewport = {
  themeColor: "#0E3B30",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <a
          href="#main"
          className="sr-only-focusable fixed top-2 left-2 z-[10001] rounded-btn bg-em7 px-4 py-3 font-sans text-[14px] font-semibold text-iv no-underline"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          {/* F4 mounts SiteChrome, SiteFooter, Toaster, PageTransition and the Lenis provider here. */}
          <main id="main">{children}</main>
          <AmbientRoot />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
