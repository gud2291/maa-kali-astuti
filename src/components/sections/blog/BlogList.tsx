"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MediaImg } from "@/components/media/MediaImg";
import { Icon } from "@/components/icons/Icon";
import { ARTICLE_CATEGORIES, type ArticleCategory } from "@/lib/domain/enums";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/domain/labels";
import type { ArticleListItem } from "@/server/articles/queries";
import { formatIst } from "@/lib/core/ist";
import { cn } from "@/lib/utils/cn";

export type BlogListProps = {
  articles: ArticleListItem[];
};

const PAGE_SIZE = 12;

export function BlogList({ articles }: BlogListProps): React.JSX.Element {
  const t = useTranslations("blog");
  const locale = useLocale();
  const isHi = locale === "hi";

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState<number>(PAGE_SIZE);

  // Initialize filter from URL query param `?c=` if present on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("c");
    if (cat && (cat === "all" || ARTICLE_CATEGORIES.includes(cat as ArticleCategory))) {
      setSelectedCategory(cat);
    }
  }, []);

  const handleSelectCategory = (cat: string): void => {
    setSelectedCategory(cat);
    setDisplayCount(PAGE_SIZE);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (cat === "all") {
        url.searchParams.delete("c");
      } else {
        url.searchParams.set("c", cat);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return articles;
    return articles.filter((a) => a.category === selectedCategory);
  }, [articles, selectedCategory]);

  const featured = filtered[0];
  const gridArticles = filtered.slice(1, displayCount);
  const hasMore = filtered.length > displayCount;

  return (
    <div className="space-y-12">
      {/* Category Chips Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => handleSelectCategory("all")}
          className={cn(
            "rounded-pill px-4 py-2 font-sans text-[13.5px] font-medium transition-all cursor-pointer",
            selectedCategory === "all"
              ? "bg-em9 text-cream shadow-xs"
              : "bg-cream/60 border border-s2 text-ink6 hover:text-ink hover:border-em5/50",
          )}
        >
          {t("allCategories")}
        </button>

        {ARTICLE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          const label = isHi
            ? ARTICLE_CATEGORY_LABELS[cat]?.hi || ARTICLE_CATEGORY_LABELS[cat]?.en
            : ARTICLE_CATEGORY_LABELS[cat]?.en;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleSelectCategory(cat)}
              className={cn(
                "rounded-pill px-4 py-2 font-sans text-[13.5px] font-medium transition-all cursor-pointer",
                isSelected
                  ? "bg-em9 text-cream shadow-xs"
                  : "bg-cream/60 border border-s2 text-ink6 hover:text-ink hover:border-em5/50",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-btn border border-s2 bg-cream/40 max-w-xl mx-auto space-y-4">
          <div className="grid size-14 mx-auto place-items-center rounded-pill bg-em1 text-em9">
            <Icon name="scroll" className="size-7" />
          </div>
          <h3 className="font-display text-[22px] font-normal text-em9">
            {t("empty")}
          </h3>
          <button
            type="button"
            onClick={() => handleSelectCategory("all")}
            className="inline-flex items-center gap-1.5 font-sans text-[14px] font-medium text-em5 hover:underline"
          >
            {t("clearFilter")}
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Featured Article Card */}
          {featured && (
            <article className="overflow-hidden rounded-btn border border-s2 bg-cream/50 shadow-card transition-all hover:shadow-card-hover group">
              <Link
                href={`/blog/${featured.slug}`}
                className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] no-underline text-ink"
              >
                <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-iv">
                  {featured.coverMedia ? (
                    <MediaImg
                      media={featured.coverMedia}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      alt={isHi && featured.titleHi ? featured.titleHi : featured.titleEn}
                      fill
                      priority
                      className="group-hover:scale-103 transition-transform duration-500"
                    />
                  ) : (
                    <div className="grid size-full place-items-center bg-cream/80 text-g7 p-12">
                      <Icon name="scroll" className="size-16 stroke-1 text-em5/50" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10 space-y-6">
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5 font-sans text-[12px] font-semibold tracking-wider uppercase text-g7">
                      <span className="text-em5">
                        {isHi
                          ? ARTICLE_CATEGORY_LABELS[featured.category]?.hi ||
                            ARTICLE_CATEGORY_LABELS[featured.category]?.en
                          : ARTICLE_CATEGORY_LABELS[featured.category]?.en}
                      </span>
                      <span>•</span>
                      <span>{t("minRead", { mins: featured.readMins })}</span>
                    </div>

                    <h2 className="font-display text-[clamp(24px,2.5vw,34px)] font-normal leading-[1.2] text-em9 group-hover:text-em5 transition-colors font-soft">
                      {isHi && featured.titleHi ? featured.titleHi : featured.titleEn}
                    </h2>

                    <p className="font-sans text-[15px] leading-relaxed text-ink6 line-clamp-3">
                      {isHi && featured.excerptHi ? featured.excerptHi : featured.excerptEn}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-s2/60">
                    <span className="font-sans text-[12.5px] text-ink6">
                      {featured.publishedAt
                        ? formatIst(new Date(featured.publishedAt))
                        : ""}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-sans text-[13.5px] font-semibold text-em7 group-hover:translate-x-1 transition-transform">
                      {t("readMore")}
                      <Icon name="arrowR" className="size-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          )}

          {/* Grid of Subsequent Articles */}
          {gridArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {gridArticles.map((article) => {
                const title = isHi && article.titleHi ? article.titleHi : article.titleEn;
                const excerpt = isHi && article.excerptHi ? article.excerptHi : article.excerptEn;
                const catLabel = isHi
                  ? ARTICLE_CATEGORY_LABELS[article.category]?.hi ||
                    ARTICLE_CATEGORY_LABELS[article.category]?.en
                  : ARTICLE_CATEGORY_LABELS[article.category]?.en;

                return (
                  <article
                    key={article.id}
                    className="flex flex-col rounded-btn border border-s2 bg-cream/40 overflow-hidden shadow-xs hover:shadow-card transition-all group"
                  >
                    <Link
                      href={`/blog/${article.slug}`}
                      className="flex flex-col h-full no-underline text-ink"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-iv">
                        {article.coverMedia ? (
                          <MediaImg
                            media={article.coverMedia}
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            alt={title}
                            fill
                            className="group-hover:scale-104 transition-transform duration-500"
                          />
                        ) : (
                          <div className="grid size-full place-items-center bg-cream/70 text-g7 p-8">
                            <Icon name="scroll" className="size-12 stroke-1 text-em5/40" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col flex-1 justify-between p-5 space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 font-sans text-[11px] font-semibold tracking-wider uppercase text-g7">
                            <span className="text-em5">{catLabel}</span>
                            <span>•</span>
                            <span>{t("minRead", { mins: article.readMins })}</span>
                          </div>

                          <h3 className="font-display text-[19px] sm:text-[21px] font-normal leading-[1.3] text-em9 group-hover:text-em5 transition-colors line-clamp-2">
                            {title}
                          </h3>

                          <p className="font-sans text-[14px] leading-relaxed text-ink6 line-clamp-2">
                            {excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-s2/50 font-sans text-[12.5px] text-ink6">
                          <span>
                            {article.publishedAt
                              ? formatIst(new Date(article.publishedAt))
                              : ""}
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium text-em7 group-hover:translate-x-0.5 transition-transform">
                            {t("readMore")}
                            <Icon name="arrowR" className="size-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
                className="h-11 px-8 rounded-btn border border-em5/60 bg-cream text-em9 font-sans text-[14px] font-semibold hover:bg-em1 hover:border-em5 transition-colors shadow-xs"
              >
                {t("loadMore")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
