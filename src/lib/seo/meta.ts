import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import type { Locale } from "@/lib/domain/enums";

export type PageMetaInput = {
  locale: Locale | string;
  path: string;
  title: string;
  description: string;
  image?: string | null;
  noindex?: boolean;
  type?: "website" | "article";
};

function trimDescription(desc: string, max = 160): string {
  const cleaned = desc.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max - 1).trim() + "…";
}

export function pageMeta({
  locale,
  path,
  title,
  description,
  image,
  noindex = false,
  type = "website",
}: PageMetaInput): Metadata {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const isRoot = cleanPath === "/";

  const enUrl = isRoot ? SITE_URL : `${SITE_URL}${cleanPath}`;
  const hiUrl = isRoot ? `${SITE_URL}/hi` : `${SITE_URL}/hi${cleanPath}`;
  const canonicalUrl = locale === "hi" ? hiUrl : enUrl;

  const desc = trimDescription(description);

  let ogImageUrl: string;
  if (image) {
    ogImageUrl = image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  } else {
    ogImageUrl = `${SITE_URL}/opengraph-image`;
  }

  const siteName = locale === "hi" ? "माँ काली स्तुति" : "Maa Kali Astuti";
  const ogLocale = locale === "hi" ? "hi_IN" : "en_IN";

  return {
    title,
    description: desc,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: enUrl,
        hi: hiUrl,
        "x-default": enUrl,
      },
    },
    openGraph: {
      title,
      description: desc,
      url: canonicalUrl,
      siteName,
      locale: ogLocale,
      type,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImageUrl],
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}
