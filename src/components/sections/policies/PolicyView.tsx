"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RichText } from "@/components/content/RichText";
import { POLICIES, type PolicySlug } from "@/lib/routes";
import { formatIst } from "@/lib/core/ist";
import { cn } from "@/lib/utils/cn";
import type { PageRow } from "@/server/pages/queries";

export type PolicyViewProps = {
  page: PageRow | null;
  slug: PolicySlug;
};

const POLICY_LIST: { slug: PolicySlug; labelKey: string; defaultEn: string }[] = [
  { slug: "shipping", labelKey: "shipping", defaultEn: "Shipping" },
  { slug: "refund-returns", labelKey: "refund-returns", defaultEn: "Refund & Returns" },
  { slug: "privacy", labelKey: "privacy", defaultEn: "Privacy" },
  { slug: "terms", labelKey: "terms", defaultEn: "Terms" },
  { slug: "astrology-disclaimer", labelKey: "astrology-disclaimer", defaultEn: "Astrology Disclaimer" },
];

export function PolicyView({ page, slug }: PolicyViewProps): React.JSX.Element {
  const t = useTranslations("policies");
  const locale = useLocale();
  const isHi = locale === "hi";

  const title =
    (isHi && page?.titleHi) ||
    page?.titleEn ||
    POLICIES[slug] ||
    "Policy";

  const body =
    isHi && page?.bodyHi && page.bodyHi.content?.length
      ? page.bodyHi
      : page?.bodyEn;

  const hasBody = Boolean(body?.content && body.content.length > 0);

  return (
    <div className="min-h-screen bg-iv py-12 sm:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-10 items-start">
          {/* Policy Navigation Sidebar */}
          <aside className="sticky top-28 self-start space-y-4">
            <div className="rounded-btn border border-s2 bg-cream/50 p-4 sm:p-5 backdrop-blur-xs">
              <p className="mb-3 font-sans text-[11px] font-semibold tracking-wider uppercase text-g7">
                Policies & Terms
              </p>
              <nav aria-label="Policies" className="space-y-1">
                {POLICY_LIST.map((item) => {
                  const isActive = item.slug === slug;
                  return (
                    <Link
                      key={item.slug}
                      href={`/policies/${item.slug}`}
                      className={cn(
                        "block px-3 py-2 rounded-field font-sans text-[14px] transition-all no-underline",
                        isActive
                          ? "bg-em9 text-cream font-medium shadow-xs"
                          : "text-ink6 hover:text-ink hover:bg-cream",
                      )}
                    >
                      {isHi && t.has(item.labelKey)
                        ? t(item.labelKey)
                        : item.defaultEn}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Policy Content */}
          <main className="rounded-btn border border-s2 bg-cream/30 p-6 sm:p-10 lg:p-12 space-y-8">
            <header className="space-y-3 pb-6 border-b border-s2">
              <h1 className="font-display text-[clamp(26px,3.2vw,40px)] font-normal text-em9 leading-tight font-soft">
                {title}
              </h1>
              {page?.updatedAt ? (
                <p className="font-sans text-[13px] text-ink6">
                  {t("lastUpdated")}: {formatIst(new Date(page.updatedAt))}
                </p>
              ) : null}
            </header>

            {hasBody && body ? (
              <RichText doc={body} className="max-w-none text-ink/90" />
            ) : (
              <div className="py-12 text-center max-w-md mx-auto space-y-3">
                <p className="font-sans text-[15px] leading-relaxed text-ink6">
                  {t("empty")}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
