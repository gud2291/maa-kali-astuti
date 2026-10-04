"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { LocaleTabs } from "@/components/admin/form/LocaleTabs";
import { ImageManager } from "@/components/admin/products/ImageManager";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { toast } from "@/components/admin/ui/toast";
import { updateHeroAction } from "@/server/home/admin-actions";
import type { HeroSlideText } from "@/lib/domain/types";
import type { MediaRef } from "@/lib/domain/media";

export const DEFAULT_HERO_SLIDES: Record<"s1" | "s2" | "s3", HeroSlideText> = {
  s1: {
    eyebrow: { en: "॥ MAA KALI ASTUTI ॥", hi: "॥ माँ काली अस्तुति ॥" },
    l1: { en: "Energized by ritual.", hi: "अनुष्ठान से ऊर्जित," },
    l2: { en: "<em>Delivered</em> with devotion.", hi: "<em>श्रद्धा</em> से आप तक" },
    sub: { en: "अनुष्ठान से ऊर्जित, श्रद्धा से आप तक", hi: "Energized by ritual. Delivered with devotion." },
    body: {
      en: "Original Nepali Rudraksha, crystal bracelets and Bhojpatra kavach, each energized in Mahapuja before it ships.",
      hi: "मूल नेपाली रुद्राक्ष, क्रिस्टल ब्रेसलेट और भोजपत्र कवच। हर उत्पाद भेजने से पहले महापूजा में ऊर्जित किया जाता है।",
    },
    cta1: { en: "Shop Energized Products", hi: "ऊर्जित उत्पाद देखें" },
    cta2: { en: "Book a Consultation", hi: "परामर्श बुक करें" },
    mediaId: null,
  },
  s2: {
    eyebrow: { en: "॥ SADHAK PAWAN PANDEY ॥", hi: "॥ साधक पवन पाण्डेय ॥" },
    l1: { en: "Ancient science.", hi: "प्राचीन विज्ञान," },
    l2: { en: "<em>Honest</em> guidance.", hi: "<em>सच्चा</em> मार्गदर्शन" },
    sub: { en: "प्राचीन विज्ञान, सच्चा मार्गदर्शन", hi: "Ancient science. Honest guidance." },
    body: {
      en: "Kundali, palmistry, tarot and numerology, read personally by Sadhak Ji, with guidance until your doubts are resolved.",
      hi: "कुंडली, हस्तरेखा, टैरो और अंक ज्योतिष, जिन्हें साधक जी स्वयं पढ़ते हैं। मार्गदर्शन तब तक चलता है जब तक आपकी शंकाएँ दूर न हों।",
    },
    cta1: { en: "Book a Consultation", hi: "परामर्श बुक करें" },
    cta2: { en: "Meet Sadhak Ji", hi: "साधक जी से मिलें" },
    mediaId: null,
  },
  s3: {
    eyebrow: { en: "॥ JANAM KUNDALI ॥", hi: "॥ जन्म कुंडली ॥" },
    l1: { en: "Your complete", hi: "आपकी संपूर्ण जन्म कुंडली" },
    l2: { en: "Janam Kundali — <em>₹99</em>.", hi: "मात्र <em>₹99</em>" },
    sub: { en: "आपकी संपूर्ण जन्म कुंडली — मात्र ₹99", hi: "Your complete Janam Kundali — ₹99." },
    body: {
      en: "Lagna chart, Navamsa, dasha periods, Manglik check, gemstones and remedies. A 28-page report in English or Hindi.",
      hi: "लग्न कुंडली, नवांश, दशा, मांगलिक जाँच, रत्न और उपाय। 28 पृष्ठों की रिपोर्ट, हिंदी या अंग्रेज़ी में।",
    },
    cta1: { en: "Get My Kundali", hi: "मेरी कुंडली पाएँ" },
    cta2: { en: "Try Love Calculator", hi: "लव कैलकुलेटर" },
    mediaId: null,
  },
};

const SLIDE_TITLES: Record<"s1" | "s2" | "s3", { title: string; subtitle: string }> = {
  s1: {
    title: "Slide 1: Shop & Sacred Blessings",
    subtitle: "Default slide featuring Pandit Ji illustration and shop offerings",
  },
  s2: {
    title: "Slide 2: Sadhak Ji Consultation",
    subtitle: "Consultation guidance banner with booking options",
  },
  s3: {
    title: "Slide 3: Janam Kundali ₹99",
    subtitle: "Automated birth chart report teaser and direct purchase",
  },
};

export function HeroSlidesForm({
  initialHero,
  initialMedia,
}: {
  initialHero: Record<"s1" | "s2" | "s3", HeroSlideText> | null;
  initialMedia: Record<number, MediaRef>;
}): React.JSX.Element {
  const [slides, setSlides] = useState<Record<"s1" | "s2" | "s3", HeroSlideText>>(
    initialHero ?? DEFAULT_HERO_SLIDES,
  );

  const [mediaRefs, setMediaRefs] = useState<Record<"s1" | "s2" | "s3", MediaRef[]>>({
    s1: initialHero?.s1.mediaId && initialMedia[initialHero.s1.mediaId] ? [initialMedia[initialHero.s1.mediaId]] : [],
    s2: initialHero?.s2.mediaId && initialMedia[initialHero.s2.mediaId] ? [initialMedia[initialHero.s2.mediaId]] : [],
    s3: initialHero?.s3.mediaId && initialMedia[initialHero.s3.mediaId] ? [initialMedia[initialHero.s3.mediaId]] : [],
  });

  const [isPending, startTransition] = useTransition();

  const handleFieldChange = (
    key: "s1" | "s2" | "s3",
    field: keyof Omit<HeroSlideText, "mediaId">,
    locale: "en" | "hi",
    value: string,
  ) => {
    setSlides((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: {
          ...prev[key][field],
          [locale]: value,
        },
      },
    }));
  };

  const handleImageChange = (key: "s1" | "s2" | "s3", next: MediaRef[]) => {
    setMediaRefs((prev) => ({
      ...prev,
      [key]: next,
    }));
    setSlides((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        mediaId: next[0]?.id ?? null,
      },
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateHeroAction(slides);
      if (res.ok) {
        toast.ok("Hero slides updated successfully");
      } else {
        toast.err(res.message ?? "Failed to update hero slides");
      }
    });
  };

  const handleReset = async (): Promise<boolean> => {
    const res = await updateHeroAction(null);
    if (res.ok) {
      setSlides(DEFAULT_HERO_SLIDES);
      setMediaRefs({ s1: [], s2: [], s3: [] });
      toast.ok("Hero slides reset to default values");
      return true;
    }
    toast.err(res.message ?? "Failed to reset hero slides");
    return false;
  };

  const SLIDE_KEYS = ["s1", "s2", "s3"] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-[18px] font-semibold text-ink">Hero Slider Copy & Banners</h2>
          <p className="mt-0.5 font-sans text-[13px] text-ink6">
            Customize the 3 main carousel slides, CTA buttons, and background images.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ConfirmDialog
            title="Reset to Default Slides?"
            body="Are you sure you want to reset all hero slides to the default texts and clear custom images? This will restore the original site copy."
            confirmLabel="Reset to Default"
            tone="danger"
            onConfirm={handleReset}
            trigger={
              <button
                type="button"
                disabled={isPending}
                className="inline-flex h-9 items-center justify-center rounded-btn border border-s2 bg-cream px-3.5 font-sans text-[13px] font-semibold text-ink transition-colors hover:bg-s1 disabled:opacity-50 cursor-pointer"
              >
                Reset to default
              </button>
            }
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex h-9 items-center justify-center rounded-btn bg-em7 px-4 font-sans text-[13px] font-semibold text-iv shadow-xs transition-colors hover:bg-em5 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Saving..." : "Save Hero Slides"}
          </button>
        </div>
      </div>

      {SLIDE_KEYS.map((sKey) => {
        const slide = slides[sKey];
        const meta = SLIDE_TITLES[sKey];

        const renderInputs = (lang: "en" | "hi") => (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-sans text-[12.5px] font-semibold text-ink">
                  Eyebrow Label ({lang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={slide.eyebrow[lang]}
                  onChange={(e) => handleFieldChange(sKey, "eyebrow", lang, e.target.value)}
                  className="h-10 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[14px] text-ink outline-none focus:border-em7"
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-[12.5px] font-semibold text-ink">
                  Headline Line 1 ({lang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={slide.l1[lang]}
                  onChange={(e) => handleFieldChange(sKey, "l1", lang, e.target.value)}
                  className="h-10 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[14px] text-ink outline-none focus:border-em7"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-sans text-[12.5px] font-semibold text-ink">
                Headline Line 2 ({lang.toUpperCase()})
              </label>
              <input
                type="text"
                value={slide.l2[lang]}
                onChange={(e) => handleFieldChange(sKey, "l2", lang, e.target.value)}
                className="h-10 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[14px] text-ink outline-none focus:border-em7"
              />
              <p className="mt-1 font-sans text-[12px] text-ink6">
                Hint: Wrap any word in <code>&lt;em&gt;word&lt;/em&gt;</code> to highlight it in glowing gold italics.
              </p>
            </div>

            <div>
              <label className="mb-1 block font-sans text-[12.5px] font-semibold text-ink">
                Sub-line Tagline ({lang.toUpperCase()})
              </label>
              <input
                type="text"
                value={slide.sub[lang]}
                onChange={(e) => handleFieldChange(sKey, "sub", lang, e.target.value)}
                className="h-10 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[14px] text-ink outline-none focus:border-em7"
              />
            </div>

            <div>
              <label className="mb-1 block font-sans text-[12.5px] font-semibold text-ink">
                Body Copy ({lang.toUpperCase()})
              </label>
              <textarea
                rows={3}
                value={slide.body[lang]}
                onChange={(e) => handleFieldChange(sKey, "body", lang, e.target.value)}
                className="w-full rounded-field border border-s2 bg-cream p-3 font-sans text-[14px] text-ink outline-none focus:border-em7 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-sans text-[12.5px] font-semibold text-ink">
                  Primary CTA Label ({lang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={slide.cta1[lang]}
                  onChange={(e) => handleFieldChange(sKey, "cta1", lang, e.target.value)}
                  className="h-10 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[14px] text-ink outline-none focus:border-em7"
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-[12.5px] font-semibold text-ink">
                  Secondary CTA Label ({lang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={slide.cta2[lang]}
                  onChange={(e) => handleFieldChange(sKey, "cta2", lang, e.target.value)}
                  className="h-10 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[14px] text-ink outline-none focus:border-em7"
                />
              </div>
            </div>
          </div>
        );

        return (
          <Card key={sKey}>
            <CardHeader title={meta.title} description={meta.subtitle} />
            <CardBody className="space-y-6">
              <LocaleTabs en={renderInputs("en")} hi={renderInputs("hi")} />

              <div className="border-t border-s2 pt-4">
                <p className="mb-2 font-sans text-[13px] font-semibold text-ink">
                  Optional Custom Banner Image
                </p>
                <p className="mb-3 font-sans text-[12px] text-ink6">
                  Upload an optional banner image to replace the default art for this slide.
                </p>
                <ImageManager
                  value={mediaRefs[sKey]}
                  onChange={(next) => handleImageChange(sKey, next)}
                  max={1}
                  purpose="banner"
                />
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
