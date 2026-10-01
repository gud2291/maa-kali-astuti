import "server-only";
import { eq, asc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { testimonials } from "@/server/db/schema/content";
import { cached, TAG } from "@/server/cache";
import type { TestimonialKind } from "@/lib/domain/enums";

export type TestimonialRow = {
  id: number;
  kind: TestimonialKind;
  quoteEn: string;
  quoteHi: string;
  name: string;
  city: string | null;
  tag: string | null;
  rating: number | null;
  youtubeId: string | null;
  mediaId: number | null;
  featured: boolean;
  sort: number;
};

async function fetchTestimonialRows(): Promise<TestimonialRow[]> {
  return db
    .select({
      id: testimonials.id,
      kind: testimonials.kind,
      quoteEn: testimonials.quoteEn,
      quoteHi: testimonials.quoteHi,
      name: testimonials.name,
      city: testimonials.city,
      tag: testimonials.tag,
      rating: testimonials.rating,
      youtubeId: testimonials.youtubeId,
      mediaId: testimonials.mediaId,
      featured: testimonials.featured,
      sort: testimonials.sort,
    })
    .from(testimonials)
    .where(eq(testimonials.visible, true))
    .orderBy(asc(testimonials.sort));
}

export const getTestimonialRows: () => Promise<TestimonialRow[]> = cached(
  "testimonial-rows",
  fetchTestimonialRows,
  () => [TAG.testimonials],
);
