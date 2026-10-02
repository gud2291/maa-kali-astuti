import { SITE_URL } from "@/lib/site";

export type JsonLdObject = Record<string, unknown>;

export type OrganizationSettings = {
  siteName?: string;
  phone?: string;
  email?: string;
  social?: {
    youtube?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    whatsappChannel?: string | null;
  } | null;
} | null;

/**
 * Organization structured data
 */
export function organization(settings?: OrganizationSettings): JsonLdObject {
  const sameAs: string[] = [];
  if (settings?.social) {
    for (const val of Object.values(settings.social)) {
      if (val && typeof val === "string" && val.startsWith("http")) {
        sameAs.push(val);
      }
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.siteName || "Maa Kali Astuti",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings?.phone || "+919000012345",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
      email: settings?.email || "care@sadhakpawanpandey.com",
    },
  };
}

/**
 * WebSite structured data with SearchAction
 */
export function website(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Maa Kali Astuti",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Person structured data for Sadhak Pawan Pandey
 */
export function person(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Sadhak Pawan Pandey",
    jobTitle: "Spiritual Mentor & Vedic Astrologer",
    url: `${SITE_URL}/about`,
    worksFor: {
      "@type": "Organization",
      name: "Maa Kali Astuti",
      url: SITE_URL,
    },
  };
}

/**
 * BreadcrumbList structured data
 */
export function breadcrumbs(items: { name: string; url: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url.startsWith("/") ? "" : "/"}${item.url}`,
    })),
  };
}

export type ProductInput = {
  id: string;
  name: string;
  description?: string | null;
  image?: string[];
  priceInr: number;
  mrpInr?: number;
  stock: number;
  ratingAvg?: number;
  ratingCount?: number;
};

export type ProductOpts = {
  url: string;
  images?: string[];
  reviews?: {
    author: string;
    rating: number;
    body: string;
    date: string;
  }[];
};

/**
 * Product structured data with Offer and optional AggregateRating
 */
export function product(p: ProductInput, opts: ProductOpts): JsonLdObject {
  const images = opts.images && opts.images.length > 0 ? opts.images : p.image ?? [];
  const fullImages = images.map((img) =>
    img.startsWith("http") ? img : `${SITE_URL}${img.startsWith("/") ? "" : "/"}${img}`,
  );

  const obj: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? undefined,
    image: fullImages.length > 0 ? fullImages : undefined,
    sku: p.id,
    offers: {
      "@type": "Offer",
      url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url.startsWith("/") ? "" : "/"}${opts.url}`,
      priceCurrency: "INR",
      price: p.priceInr,
      priceValidUntil: "2027-12-31",
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Maa Kali Astuti",
      },
    },
  };

  if (p.ratingCount && p.ratingCount > 0) {
    obj.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.ratingAvg && p.ratingAvg > 0 ? Number(p.ratingAvg.toFixed(1)) : 5,
      reviewCount: p.ratingCount,
    };
  }

  if (opts.reviews && opts.reviews.length > 0) {
    obj.review = opts.reviews.map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
      },
      reviewBody: r.body,
      datePublished: r.date,
    }));
  }

  return obj;
}

/**
 * FAQPage structured data
 */
export function faqPage(items: { q: string; a: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export type ArticleInput = {
  title: string;
  description: string;
  image?: string | null;
  publishedAt: string;
  updatedAt?: string | null;
  authorName?: string;
};

/**
 * Article structured data
 */
export function article(a: ArticleInput, url: string): JsonLdObject {
  const fullUrl = url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  const imgUrl = a.image
    ? a.image.startsWith("http")
      ? a.image
      : `${SITE_URL}${a.image.startsWith("/") ? "" : "/"}${a.image}`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    image: imgUrl ? [imgUrl] : undefined,
    datePublished: a.publishedAt,
    dateModified: a.updatedAt || a.publishedAt,
    author: {
      "@type": "Person",
      name: a.authorName || "Sadhak Pawan Pandey",
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Maa Kali Astuti",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": fullUrl,
    },
  };
}

export type VideoInput = {
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
};

/**
 * VideoObject structured data
 */
export function video(v: VideoInput): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.title,
    description: v.description,
    thumbnailUrl: [v.thumbnailUrl],
    uploadDate: v.uploadDate,
    contentUrl: v.contentUrl,
    embedUrl: v.embedUrl,
  };
}

export type ServiceTierOffer = {
  name: string;
  priceInr: number;
};

export type ServiceInput = {
  name: string;
  description: string;
  serviceType?: string;
  tiers?: ServiceTierOffer[];
};

/**
 * Service structured data with offers per tier
 */
export function service(s: ServiceInput, url: string): JsonLdObject {
  const fullUrl = url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.description,
    serviceType: s.serviceType || "Astrology & Spiritual Consultation",
    provider: {
      "@type": "Person",
      name: "Sadhak Pawan Pandey",
      url: `${SITE_URL}/about`,
    },
    offers:
      s.tiers && s.tiers.length > 0
        ? s.tiers.map((t) => ({
            "@type": "Offer",
            name: t.name,
            priceCurrency: "INR",
            price: t.priceInr,
            url: fullUrl,
          }))
        : undefined,
  };
}

export type CourseInput = {
  name: string;
  description: string;
  providerName?: string;
};

/**
 * Course structured data
 */
export function course(c: CourseInput, url: string, feeInr?: number | null): JsonLdObject {
  const fullUrl = url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: c.name,
    description: c.description,
    provider: {
      "@type": "Person",
      name: c.providerName || "Sadhak Pawan Pandey",
      url: `${SITE_URL}/about`,
    },
    offers:
      feeInr != null && feeInr > 0
        ? {
            "@type": "Offer",
            priceCurrency: "INR",
            price: feeInr,
            url: fullUrl,
          }
        : undefined,
  };
}
