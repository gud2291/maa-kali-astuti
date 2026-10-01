import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routes } from "@/lib/routes";
import { getProductDetail, getCatalog } from "@/server/catalog/queries";
import { getSetting } from "@/server/settings/queries";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RitualSteps } from "@/components/sections/home/RitualSteps";
import { ProductGallery } from "@/components/sections/pdp/ProductGallery";
import { ProductInfo } from "@/components/sections/pdp/ProductInfo";
import { ProductAccordions } from "@/components/sections/pdp/ProductAccordions";
import { PlacementGuide } from "@/components/sections/pdp/PlacementGuide";
import { RelatedRail } from "@/components/sections/pdp/RelatedRail";
import { RecentlyViewed } from "@/components/sections/pdp/RecentlyViewed";
import { StickyBuyBar } from "@/components/sections/pdp/StickyBuyBar";
import { TrackView } from "@/components/sections/pdp/TrackView";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = true;

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const detail = await getProductDetail(slug);
  if (!detail) return {};

  const { product, content } = detail;
  const isHi = locale === "hi";

  const title = isHi
    ? product.seoTitleHi || product.hi || product.name
    : product.seoTitleEn || product.name;

  const descCandidate = isHi
    ? product.seoDescHi || content.description?.hi || content.description?.en || ""
    : product.seoDescEn || content.description?.en || content.description?.hi || "";

  const description = descCandidate.slice(0, 160);

  const firstImage = product.images?.[0]
    ? product.images[0].variants?.[0]?.key || ""
    : product.photo || `/svg/products/${product.id}-main.svg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: firstImage ? [firstImage] : [],
    },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const detail = await getProductDetail(slug);
  if (!detail) notFound();

  const { product, content, related, certificate } = detail;
  const store = await getSetting("store");
  const t = await getTranslations("pdp");
  const isHi = locale === "hi";

  return (
    <article className="relative mx-auto max-w-[1480px] px-[clamp(16px,3vw,32px)] pt-5 pb-16">
      {/* Breadcrumb */}
      <nav
        aria-label={t("crumbShop")}
        className="mb-6 flex flex-wrap items-center gap-2 font-sans text-[12.5px] leading-none font-medium text-ink6"
      >
        <Link href={routes.home} className="text-ink6 no-underline hover:text-em7 transition-colors">
          {t("crumbHome")}
        </Link>
        <span aria-hidden="true" className="text-g5">
          /
        </span>
        <Link href={routes.shop} className="text-ink6 no-underline hover:text-em7 transition-colors">
          {t("crumbShop")}
        </Link>
        <span aria-hidden="true" className="text-g5">
          /
        </span>
        <Link
          href={`/shop?cat=${product.cat}`}
          className="text-ink6 no-underline hover:text-em7 transition-colors"
        >
          {product.catName}
        </Link>
        <span aria-hidden="true" className="text-g5">
          /
        </span>
        <span aria-current="page" className="text-ink font-semibold truncate max-w-[280px]">
          {isHi ? product.hi || product.name : product.name}
        </span>
      </nav>

      {/* 7/5 Grid: gallery on left, product info on right */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-[clamp(24px,4vw,56px)] items-start">
        <ProductGallery
          product={product}
          certificate={certificate}
          youtubeId={content.youtubeId}
        />
        <ProductInfo product={product} />
      </div>

      {/* Accordions */}
      <div className="mt-10 md:mt-14 max-w-[960px]">
        <ProductAccordions
          content={content}
          locale={locale}
          store={store}
          labels={{
            desc: t("accordionDesc"),
            benefits: t("accordionBenefits"),
            howToWear: t("accordionHowToWear"),
            specs: t("accordionSpecs"),
            shipping: t("accordionShipping"),
            shippingText: t("accordionShippingText", {
              min: store.standardDays[0],
              max: store.standardDays[1],
              freeShipping: store.freeShippingInr,
            }),
            authenticity: t("accordionAuth"),
            authenticityText: t("accordionAuthText"),
          }}
        />
      </div>

      {/* Placement guide (when present) */}
      {content.placement && content.placement.length > 0 && (
        <div className="mt-8 md:mt-12">
          <PlacementGuide
            placement={content.placement}
            locale={locale}
            labels={{
              eyebrow: t("placementEyebrow"),
              title: t("placementTitle"),
              temple: t("placeTemple"),
              locker: t("placeLocker"),
              office: t("placeOffice"),
            }}
          />
        </div>
      )}

      {/* How we energize ritual band */}
      <section className="mt-8 md:mt-12 flex flex-col gap-6 py-6 border-t border-s2">
        <SectionHeader
          eyebrow={t("ritualEyebrow")}
          title={
            isHi ? (
              <>
                हम प्रेषण से पूर्व <em>प्राण-प्रतिष्ठा</em> कैसे करते हैं
              </>
            ) : (
              <>
                How we <em>energize</em> every sacred offering
              </>
            )
          }
          size="sm"
        />
        <div className="max-w-[680px]">
          <RitualSteps
            steps={[
              ["flame", t("ritualStep1Title"), t("ritualStep1Desc")],
              ["diya", t("ritualStep2Title"), t("ritualStep2Desc")],
              ["seal", t("ritualStep3Title"), t("ritualStep3Desc")],
            ]}
          />
        </div>
      </section>

      {/* Related rail */}
      <RelatedRail
        products={related}
        eyebrow={t("relatedEyebrow")}
        title={
          isHi ? (
            <>
              सम्बन्धित <em>उत्पाद</em>
            </>
          ) : (
            <>
              Related <em>offerings</em>
            </>
          )
        }
      />

      {/* Recently viewed */}
      <RecentlyViewed currentProductId={product.id} />

      {/* Sticky buy bar */}
      <StickyBuyBar product={product} />

      {/* Track view */}
      <TrackView productId={product.id} />
    </article>
  );
}
