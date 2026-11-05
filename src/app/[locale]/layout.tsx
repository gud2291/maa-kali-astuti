import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontVariables } from "../fonts";
import { AmbientRoot } from "@/components/motion/AmbientRoot";
import { StoreHydrator } from "@/components/commerce/StoreHydrator";
import { QuickAdd } from "@/components/commerce/QuickAdd";
import { Toaster } from "@/components/ui/Toaster";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageTransition } from "@/components/layout/PageTransition";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { SiteSettingsProvider } from "@/components/layout/SiteSettingsProvider";
import { getSetting } from "@/server/settings/queries";
import { SITE_URL } from "@/lib/site";
import { loc } from "@/lib/domain/loc";
import { pageMeta } from "@/lib/seo/meta";
import { organization, website } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const [t, seo] = await Promise.all([
    getTranslations({ locale, namespace: "meta" }),
    getSetting("seo"),
  ]);

  const defaultTitle = loc(seo.title, locale) || t("title");
  const defaultDesc = loc(seo.description, locale) || t("description");
  const siteName = t("siteName") || (locale === "hi" ? "माँ काली अस्तुति" : "Maa Kali Astuti");

  const base = pageMeta({
    locale,
    path: "/",
    title: defaultTitle,
    description: defaultDesc,
  });

  return {
    ...base,
    title: { default: defaultTitle, template: `%s · ${siteName}` },
    applicationName: siteName,
     verification: {
      google: "H2m6msPW4AL31wqiHVvScNs-gbf5dDvPAMR38oLU7lA",
    },
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
  const [t, contact, social, announcement] = await Promise.all([
    getTranslations({ locale, namespace: "common" }),
    getSetting("contact"),
    getSetting("social"),
    getSetting("announcement"),
  ]);

  const orgJsonLd = organization({
    siteName: locale === "hi" ? "माँ काली अस्तुति" : "Maa Kali Astuti",
    phone: contact.phoneTel || contact.phoneDisplay,
    email: contact.email,
    social,
  });
  const siteJsonLd = website();

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <JsonLd data={orgJsonLd} />
        <JsonLd data={siteJsonLd} />
        <a
          href="#main"
          className="sr-only-focusable fixed top-2 left-2 z-[10001] rounded-btn bg-em7 px-4 py-3 font-sans text-[14px] font-semibold text-iv no-underline"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          <SiteSettingsProvider value={{ contact, social, announcement }}>
            {/* Global chrome (F4): fixed header + spacer, menus, search, cart drawer, tab bar, FAB. */}
            <SiteChrome />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <SiteFooter />
            <PageTransition />
            <SmoothScroll />
            <AmbientRoot />
            {/* Global commerce layer (F3): persisted-store hydration, quick-add sheet, toasts. */}
            <StoreHydrator />
            <QuickAdd />
            <Toaster />
          </SiteSettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
