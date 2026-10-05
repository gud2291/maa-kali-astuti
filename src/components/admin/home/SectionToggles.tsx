"use client";

import { useState, useTransition } from "react";
import { Switch } from "radix-ui";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { toast } from "@/components/admin/ui/toast";
import { updateSectionsAction } from "@/server/home/admin-actions";
import { HOME_SECTIONS, type HomeSection } from "@/lib/domain/enums";
import { cn } from "@/lib/utils/cn";

const SECTION_METADATA: Record<HomeSection, { label: string; description: string }> = {
  hero: {
    label: "Hero Section",
    description: "Main hero banner, celestial sky animation, and Pandit Ji / banners slider",
  },
  trust: {
    label: "Trust Strip",
    description: "Energized in Mahapuja scrolling marquee and guarantees",
  },
  categories: {
    label: "Category Arches",
    description: "Sacred collections (Rudraksha, Gemstones, Amulets, Havan, Copper)",
  },
  bestsellers: {
    label: "Bestsellers",
    description: "Featured energized products with category filter tabs",
  },
  nagSpotlight: {
    label: "12 Nag Spotlight",
    description: "Dedicated product spotlight feature for 12 Nag Kavach",
  },
  rashifal: {
    label: "Daily Rashifal",
    description: "Interactive 12-rashi horoscope wheel and daily astrological predictions",
  },
  astroTools: {
    label: "Astro Tools",
    description: "Free Vedic tools (Kundali matching, Sade Sati, Muhurat calculator)",
  },
  consult: {
    label: "Consultations Bento",
    description: "Personal consultation booking cards with Sadhak Pawan Pandey",
  },
  intentions: {
    label: "Intentions",
    description: "Browse energized offerings grouped by spiritual intention and life goal",
  },
  courses: {
    label: "Sadhana Courses",
    description: "Sacred sadhana, Diksha guidance, and spiritual learning tracks",
  },
  rituals: {
    label: "Sacred Rituals",
    description: "Special anushthan and Vedic pujas conducted at the ashram",
  },
  about: {
    label: "About Sadhak Ji",
    description: "Lineage, sadhana journey, and ashram mission teaser",
  },
  videos: {
    label: "Latest Videos",
    description: "Pravachan, remedies, and spiritual discourse library from YouTube",
  },
  testimonials: {
    label: "Testimonials & Reviews",
    description: "Devotee experiences and verified sacred product reviews",
  },
  journal: {
    label: "Vedic Journal",
    description: "Spiritual articles, astrological insights, and festival guides",
  },
  faq: {
    label: "Frequently Asked Questions",
    description: "Common customer questions and spiritual guidance FAQs",
  },
  newsletter: {
    label: "Newsletter Subscription",
    description: "Sacred blessings and mahapuja reminders email subscription band",
  },
};

export function SectionToggles({
  initialSections,
}: {
  initialSections: Record<HomeSection, boolean>;
}): React.JSX.Element {
  const [sections, setSections] = useState<Record<HomeSection, boolean>>(initialSections);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (key: HomeSection, checked: boolean) => {
    setSections((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateSectionsAction(sections);
      if (res.ok) {
        toast.ok("Home sections updated successfully");
      } else {
        toast.err(res.message ?? "Failed to update home sections");
      }
    });
  };

  const isDirty = HOME_SECTIONS.some((key) => sections[key] !== initialSections[key]);

  return (
    <Card>
      <CardHeader
        title="Home Page Sections"
        description="Toggle sections on or off to control what appears on the storefront home page. Sections appear in the order listed below."
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className="inline-flex h-9 items-center justify-center rounded-btn bg-em7 px-4 font-sans text-[13px] font-semibold text-iv shadow-xs transition-colors hover:bg-em5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? "Saving..." : "Save Sections"}
          </button>
        }
      />
      <CardBody className="divide-y divide-s2">
        {HOME_SECTIONS.map((key, idx) => {
          const meta = SECTION_METADATA[key];
          const enabled = sections[key] ?? true;
          const switchId = `section-toggle-${key}`;

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-6 flex-none items-center justify-center rounded-full bg-s1 font-sans text-[11px] font-semibold text-ink6">
                  {idx + 1}
                </span>
                <label htmlFor={switchId} className="cursor-pointer select-none">
                  <span className="block font-sans text-[14px] font-semibold text-ink">
                    {meta.label}
                  </span>
                  <span className="mt-0.5 block font-sans text-[12px] leading-normal text-ink6">
                    {meta.description}
                  </span>
                </label>
              </div>

              <Switch.Root
                id={switchId}
                checked={enabled}
                onCheckedChange={(checked) => handleToggle(key, checked)}
                className={cn(
                  "relative h-6 w-11 flex-none rounded-pill transition-colors outline-none cursor-pointer",
                  enabled ? "bg-em7" : "bg-s2",
                )}
              >
                <Switch.Thumb
                  className={cn(
                    "block size-5 rounded-full bg-cream shadow-sm transition-transform duration-150 will-change-transform",
                    enabled ? "translate-x-[22px]" : "translate-x-0.5",
                  )}
                />
              </Switch.Root>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
