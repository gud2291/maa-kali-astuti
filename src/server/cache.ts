import "server-only";
import { cache } from "react";
import { unstable_cache, updateTag, revalidateTag } from "next/cache";
import { env } from "@/server/env";

/* ── Tags ────────────────────────────────────────────────────────────── */

export const TAG = {
  catalog: "catalog" as const,
  product: (id: string): string => `product:${id}`,
  settings: "settings" as const,
  consult: "consult" as const,
  courses: "courses" as const,
  rituals: "rituals" as const,
  videos: "videos" as const,
  testimonials: "testimonials" as const,
  faqs: "faqs" as const,
  articles: "articles" as const,
  article: (slug: string): string => `article:${slug}`,
  pages: "pages" as const,
  page: (slug: string): string => `page:${slug}`,
  rashifal: "rashifal" as const,
  reviews: "reviews" as const,
  productReviews: (id: string): string => `reviews:${id}`,
};

/* ── cached() — wraps unstable_cache with request dedup ──────────────── */

export function cached<A extends (string | number | boolean | null)[], R>(
  name: string,
  fn: (...args: A) => Promise<R>,
  tags: (...args: A) => string[],
): (...args: A) => Promise<R> {
  if (env.NODE_ENV === "development") {
    return cache(fn);
  }

  return cache((...args: A) =>
    unstable_cache(() => fn(...args), [name, ...args.map(String)], {
      tags: tags(...args),
    })(),
  );
}

/* ── Invalidation ────────────────────────────────────────────────────── */

/** Server Actions only — next request gets fresh data. */
export function invalidate(...tags: string[]): void {
  for (const tag of tags) {
    updateTag(tag);
  }
}

/** Route handlers / after() — stale-while-revalidate. */
export function invalidateLater(...tags: string[]): void {
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}
