"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MediaImg } from "@/components/media/MediaImg";
import { Icon } from "@/components/icons/Icon";
import { RichText, extractHeadings } from "@/components/content/RichText";
import { Toc } from "@/components/content/Toc";
import { ProductsMentioned } from "./ProductsMentioned";
import { FaqList } from "@/components/ui/FaqList";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/domain/labels";
import { formatIst } from "@/lib/core/ist";
import { useUi } from "@/stores/ui";
import type { ArticleDetail, ArticleListItem } from "@/server/articles/queries";
import type { ProductCardData } from "@/components/commerce/ProductCard";

export type ArticleViewProps = {
  article: ArticleDetail;
  relatedArticles: ArticleListItem[];
  products: ProductCardData[];
};

export function ArticleView({
  article,
  relatedArticles,
  products,
}: ArticleViewProps): React.JSX.Element {
  const t = useTranslations("blog");
  const tp = useTranslations("pdp");
  const te = useTranslations("errors");
  const locale = useLocale();
  const isHi = locale === "hi";

  const [copied, setCopied] = useState(false);

  const title = isHi && article.titleHi ? article.titleHi : article.titleEn;
  const excerpt = isHi && article.excerptHi ? article.excerptHi : article.excerptEn;
  const body =
    isHi && article.bodyHi && article.bodyHi.content?.length
      ? article.bodyHi
      : article.bodyEn;

  const headings = extractHeadings(body);
  const catLabel = isHi
    ? ARTICLE_CATEGORY_LABELS[article.category]?.hi ||
      ARTICLE_CATEGORY_LABELS[article.category]?.en
    : ARTICLE_CATEGORY_LABELS[article.category]?.en;

  const faqItems: [string, string][] = (article.faq || [])
    .filter((f) => f.q.en || f.q.hi)
    .map((f) => [
      isHi && f.q.hi ? f.q.hi : f.q.en,
      isHi && f.a.hi ? f.a.hi : f.a.en,
    ]);

  const handleShare = async (): Promise<void> => {
    if (typeof window === "undefined") return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      useUi.getState().toast({ msg: tp("linkCopied"), tone: "ok" });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      useUi.getState().toast({ msg: te("INTERNAL"), tone: "err" });
    }
  };

  const handleWhatsAppShare = (): void => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const text = `${title}\n\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <article className="min-h-screen bg-iv py-10 sm:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-sans text-[13px] text-ink6">
          <Link href="/" className="hover:text-em5 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-em5 transition-colors">
            Journal
          </Link>
          <span>/</span>
          <span className="text-em5 font-medium">{catLabel}</span>
        </nav>

        {/* Article Header */}
        <header className="max-w-[820px] mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2 font-sans text-[12px] font-semibold tracking-wider uppercase text-g7">
            <span className="text-em5">{catLabel}</span>
            <span>•</span>
            <span>{t("minRead", { mins: article.readMins })}</span>
            {article.publishedAt && (
              <>
                <span>•</span>
                <span>{formatIst(new Date(article.publishedAt))}</span>
              </>
            )}
          </div>

          <h1 className="font-display text-[clamp(28px,3.8vw,46px)] font-normal text-em9 leading-[1.18] font-soft text-balance">
            {title}
          </h1>

          <p className="font-sans text-[17px] sm:text-[19px] leading-relaxed text-ink6 text-pretty">
            {excerpt}
          </p>
        </header>

        {/* Cover Image */}
        {article.coverMedia && (
          <div className="relative aspect-[16/9] max-w-[1020px] mx-auto overflow-hidden rounded-btn border border-s2 bg-cream/50 shadow-card">
            <MediaImg
              media={article.coverMedia}
              sizes="(min-width: 1024px) 1020px, 100vw"
              alt={title}
              fill
              priority
            />
          </div>
        )}

        {/* Main Content Layout with Sticky TOC */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,680px)_1fr] gap-8 items-start">
          {/* Left Column: Sticky TOC (desktop only) */}
          <div className="hidden lg:block justify-self-end w-64">
            <Toc headings={headings} title={t("toc")} />
          </div>

          {/* Center Column: Reading Measure 680px */}
          <div className="space-y-8 min-w-0">
            {/* Rich Content */}
            <RichText doc={body} />

            {/* Products Mentioned */}
            {products.length > 0 && <ProductsMentioned products={products} />}

            {/* FAQ Block (AEO / Schema) */}
            {faqItems.length > 0 && (
              <section className="my-12 pt-8 border-t border-s2 space-y-6">
                <div className="space-y-1">
                  <p className="font-sans text-[11px] font-semibold tracking-wider uppercase text-g7">
                    Knowledge Base
                  </p>
                  <h3 className="font-display text-[24px] sm:text-[28px] font-normal text-em9 font-soft">
                    {t("faqTitle")}
                  </h3>
                </div>
                <FaqList items={faqItems} openFirst={false} />
              </section>
            )}

            {/* Share and Social Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-s2">
              <span className="font-sans text-[13px] font-semibold tracking-wider uppercase text-g7">
                {t("share")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-pill border border-s2 bg-cream font-sans text-[13px] font-medium text-ink hover:text-em5 hover:border-em5/50 transition-colors"
                >
                  <Icon name="whatsapp" className="size-4 text-[#25D366]" />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-pill border border-s2 bg-cream font-sans text-[13px] font-medium text-ink hover:text-em5 hover:border-em5/50 transition-colors"
                >
                  <Icon name={copied ? "check" : "share"} className="size-4" />
                  {copied ? "Copied" : "Copy Link"}
                </button>
              </div>
            </div>

            {/* Author Box */}
            <section className="my-8 rounded-btn border border-s2 bg-cream/40 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="grid size-14 place-items-center rounded-pill bg-em9 text-cream shrink-0 font-display text-[22px] font-semibold shadow-xs">
                  सा
                </div>
                <div>
                  <p className="font-sans text-[11px] font-semibold tracking-wider uppercase text-g7">
                    {t("author")}
                  </p>
                  <h4 className="font-display text-[20px] font-normal text-em9 font-soft">
                    {t("authorName")}
                  </h4>
                </div>
              </div>
              <p className="font-sans text-[14.5px] leading-relaxed text-ink6">
                {t("authorBio")}
              </p>
            </section>
          </div>

          {/* Right Column: Empty spacer or future widgets */}
          <div className="hidden lg:block" />
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="pt-16 border-t border-s2 space-y-8">
            <div className="text-center space-y-2">
              <p className="font-sans text-[11px] font-semibold tracking-wider uppercase text-g7">
                Continue Reading
              </p>
              <h2 className="font-display text-[clamp(24px,3vw,36px)] font-normal text-em9 font-soft">
                {t("related")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => {
                const relTitle = isHi && rel.titleHi ? rel.titleHi : rel.titleEn;
                const relExcerpt = isHi && rel.excerptHi ? rel.excerptHi : rel.excerptEn;
                const relCat = isHi
                  ? ARTICLE_CATEGORY_LABELS[rel.category]?.hi ||
                    ARTICLE_CATEGORY_LABELS[rel.category]?.en
                  : ARTICLE_CATEGORY_LABELS[rel.category]?.en;

                return (
                  <article
                    key={rel.id}
                    className="flex flex-col rounded-btn border border-s2 bg-cream/40 overflow-hidden shadow-xs hover:shadow-card transition-all group"
                  >
                    <Link
                      href={`/blog/${rel.slug}`}
                      className="flex flex-col h-full no-underline text-ink"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-iv">
                        {rel.coverMedia ? (
                          <MediaImg
                            media={rel.coverMedia}
                            sizes="(min-width: 1024px) 33vw, 100vw"
                            alt={relTitle}
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-sans text-[11px] font-semibold tracking-wider uppercase text-g7">
                            <span className="text-em5">{relCat}</span>
                            <span>•</span>
                            <span>{t("minRead", { mins: rel.readMins })}</span>
                          </div>

                          <h3 className="font-display text-[18px] sm:text-[20px] font-normal leading-[1.3] text-em9 group-hover:text-em5 transition-colors line-clamp-2">
                            {relTitle}
                          </h3>

                          <p className="font-sans text-[13.5px] leading-relaxed text-ink6 line-clamp-2">
                            {relExcerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-s2/50 font-sans text-[12px] text-ink6">
                          <span>
                            {rel.publishedAt
                              ? formatIst(new Date(rel.publishedAt))
                              : ""}
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium text-em7">
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
          </section>
        )}
      </div>
    </article>
  );
}
